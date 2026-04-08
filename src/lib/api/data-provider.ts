import { unstable_cache } from "next/cache";
import {
  RegionData,
  StateData,
  MunicipalityData,
  NationalSummary,
} from "@/lib/types/region";
import { fetchIBGEStates } from "./ibge";
import { fetchBolsaFamiliaByState } from "./transparencia";
import { fetchCAGEDByState } from "./caged";

// Static data imports for fallback
import { REGIONS as STATIC_REGIONS, getNationalSummary } from "@/lib/data/regions";
import { STATES as STATIC_STATES } from "@/lib/data/states";
import { getAllMunicipalitiesByState as getStaticMunicipalities } from "@/lib/data/municipalities";

export interface DataSnapshot {
  regions: RegionData[];
  states: StateData[];
  statesByRegion: Record<string, StateData[]>;
  municipalitiesByState: Record<string, MunicipalityData[]>;
  nationalSummary: NationalSummary;
  lastUpdated: string;
  dataSource: "api" | "static";
  errors: string[];
}

/** Mapping from IBGE region ID to our internal slug */
const REGION_MAP: Record<number, { id: string; name: string }> = {
  1: { id: "norte", name: "Norte" },
  2: { id: "nordeste", name: "Nordeste" },
  3: { id: "sudeste", name: "Sudeste" },
  4: { id: "sul", name: "Sul" },
  5: { id: "centro-oeste", name: "Centro-Oeste" },
};

/** IBGE state code → our state slug */
function stateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Try to fetch IBGE geographic data and enrich with BF/CAGED numbers.
 * Falls back to static data on any failure.
 */
async function fetchLiveData(): Promise<DataSnapshot> {
  const errors: string[] = [];
  let dataSource: "api" | "static" = "api";

  // Step 1: Fetch IBGE states (geographic metadata)
  let ibgeStates;
  try {
    ibgeStates = await fetchIBGEStates();
  } catch (e) {
    errors.push(`IBGE: ${e instanceof Error ? e.message : String(e)}`);
    return buildStaticSnapshot(errors);
  }

  // Step 2: Try Bolsa Família data
  const bfByUF: Record<string, number> = {};
  try {
    const now = new Date();
    // Use previous month since current month data may not be available
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const yearMonth = `${prevMonth.getFullYear()}${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;
    const bfData = await fetchBolsaFamiliaByState(yearMonth);
    for (const row of bfData) {
      bfByUF[row.uf] = (bfByUF[row.uf] ?? 0) + row.quantidadeBeneficiados;
    }
  } catch (e) {
    errors.push(
      `Bolsa Família: ${e instanceof Error ? e.message : String(e)}`,
    );
    dataSource = "static";
  }

  // Step 3: Try CAGED data
  const cagedByUF: Record<string, number> = {};
  try {
    const cagedData = await fetchCAGEDByState();
    for (const row of cagedData) {
      cagedByUF[row.uf] = row.estoqueEmpregos;
    }
  } catch (e) {
    errors.push(`CAGED: ${e instanceof Error ? e.message : String(e)}`);
    dataSource = "static";
  }

  // If both BF and CAGED failed, fall back entirely to static data
  const hasBF = Object.keys(bfByUF).length > 0;
  const hasCaged = Object.keys(cagedByUF).length > 0;
  if (!hasBF && !hasCaged) {
    return buildStaticSnapshot(errors);
  }

  // Build state data from IBGE + available API data, falling back per-state to static
  const staticStateMap = new Map(STATIC_STATES.map((s) => [s.abbreviation, s]));
  const states: StateData[] = ibgeStates.map((ibge) => {
    const staticState = staticStateMap.get(ibge.sigla);
    const bf = hasBF
      ? (bfByUF[ibge.sigla] ?? staticState?.bolsaFamiliaRecipients ?? 0)
      : (staticState?.bolsaFamiliaRecipients ?? 0);
    const wk = hasCaged
      ? (cagedByUF[ibge.sigla] ?? staticState?.formalWorkers ?? 0)
      : (staticState?.formalWorkers ?? 0);
    const regionInfo = REGION_MAP[ibge.regiao.id] ?? {
      id: stateSlug(ibge.regiao.nome),
      name: ibge.regiao.nome,
    };

    return {
      id: staticState?.id ?? stateSlug(ibge.nome),
      name: ibge.nome,
      abbreviation: ibge.sigla,
      regionId: regionInfo.id,
      bolsaFamiliaRecipients: bf,
      formalWorkers: wk,
      ratio: wk > 0 ? bf / wk : 0,
    };
  });

  // Build regions from aggregated state data
  const regionAgg: Record<string, { bf: number; wk: number; abbrevs: string[] }> = {};
  for (const st of states) {
    if (!regionAgg[st.regionId]) {
      regionAgg[st.regionId] = { bf: 0, wk: 0, abbrevs: [] };
    }
    regionAgg[st.regionId].bf += st.bolsaFamiliaRecipients;
    regionAgg[st.regionId].wk += st.formalWorkers;
    regionAgg[st.regionId].abbrevs.push(st.abbreviation);
  }

  const regionNames: Record<string, string> = {};
  for (const v of Object.values(REGION_MAP)) {
    regionNames[v.id] = v.name;
  }

  const regions: RegionData[] = Object.entries(regionAgg).map(
    ([id, agg]) => ({
      id,
      name: regionNames[id] ?? id,
      bolsaFamiliaRecipients: agg.bf,
      formalWorkers: agg.wk,
      ratio: agg.wk > 0 ? agg.bf / agg.wk : 0,
      states: agg.abbrevs,
    }),
  );

  // Build statesByRegion
  const statesByRegion: Record<string, StateData[]> = {};
  for (const st of states) {
    if (!statesByRegion[st.regionId]) statesByRegion[st.regionId] = [];
    statesByRegion[st.regionId].push(st);
  }

  // For municipalities, try IBGE for names but use static distribution for numbers
  // (BF/CAGED don't provide per-municipality breakdowns without heavy pagination)
  const staticMunicipalities = getStaticMunicipalities();
  const municipalitiesByState: Record<string, MunicipalityData[]> = {};
  for (const st of states) {
    const staticMuns = staticMunicipalities[st.id] ?? [];
    if (staticMuns.length > 0) {
      // Rescale mock municipality data to match new state totals
      const oldStaticState = staticStateMap.get(st.abbreviation);
      const oldBF = oldStaticState?.bolsaFamiliaRecipients ?? st.bolsaFamiliaRecipients;
      const oldWK = oldStaticState?.formalWorkers ?? st.formalWorkers;
      const bfScale = oldBF > 0 ? st.bolsaFamiliaRecipients / oldBF : 1;
      const wkScale = oldWK > 0 ? st.formalWorkers / oldWK : 1;

      municipalitiesByState[st.id] = staticMuns.map((m) => {
        const bf = Math.round(m.bolsaFamiliaRecipients * bfScale);
        const wk = Math.round(m.formalWorkers * wkScale);
        return {
          ...m,
          bolsaFamiliaRecipients: bf,
          formalWorkers: wk,
          ratio: wk > 0 ? bf / wk : 0,
          population: Math.round((bf + wk) * 2.5),
        };
      });
    } else {
      municipalitiesByState[st.id] = [];
    }
  }

  const totalBF = regions.reduce((s, r) => s + r.bolsaFamiliaRecipients, 0);
  const totalWK = regions.reduce((s, r) => s + r.formalWorkers, 0);

  return {
    regions,
    states,
    statesByRegion,
    municipalitiesByState,
    nationalSummary: {
      totalBolsaFamilia: totalBF,
      totalFormalWorkers: totalWK,
      ratio: totalWK > 0 ? totalBF / totalWK : 0,
    },
    lastUpdated: new Date().toISOString(),
    dataSource,
    errors,
  };
}

function buildStaticSnapshot(errors: string[]): DataSnapshot {
  const statesByRegion: Record<string, StateData[]> = {};
  for (const state of STATIC_STATES) {
    if (!statesByRegion[state.regionId]) statesByRegion[state.regionId] = [];
    statesByRegion[state.regionId].push(state);
  }

  return {
    regions: STATIC_REGIONS,
    states: STATIC_STATES,
    statesByRegion,
    municipalitiesByState: getStaticMunicipalities(),
    nationalSummary: getNationalSummary(),
    lastUpdated: new Date().toISOString(),
    dataSource: "static",
    errors,
  };
}

/**
 * Cached data provider — revalidates every hour.
 * Uses unstable_cache for server-side caching across requests.
 */
export const getDataSnapshot = unstable_cache(
  async (): Promise<DataSnapshot> => {
    try {
      return await fetchLiveData();
    } catch {
      return buildStaticSnapshot(["Unexpected error fetching live data"]);
    }
  },
  ["data-snapshot"],
  { revalidate: 3600, tags: ["data"] },
);
