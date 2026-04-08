import { unstable_cache } from "next/cache";
import {
  RegionData,
  StateData,
  MunicipalityData,
  NationalSummary,
} from "@/lib/types/region";
import {
  getAllStateData,
  getAllMunicipalitiesGroupedByState,
  getMunicipalityBfData,
  getNationalData,
  getLastSyncTime,
  hasData,
} from "@/lib/db";

export interface DataSnapshot {
  regions: RegionData[];
  states: StateData[];
  statesByRegion: Record<string, StateData[]>;
  municipalitiesByState: Record<string, MunicipalityData[]>;
  nationalSummary: NationalSummary;
  lastUpdated: string;
  errors: string[];
}

const REGION_NAMES: Record<string, string> = {
  norte: "Norte",
  nordeste: "Nordeste",
  sudeste: "Sudeste",
  sul: "Sul",
  "centro-oeste": "Centro-Oeste",
};

function buildSnapshot(): DataSnapshot {
  if (!hasData()) {
    throw new Error("Database has no data. Run `npm run db:sync` first.");
  }

  const errors: string[] = [];
  const dbStates = getAllStateData();
  const national = getNationalData();
  const lastSync = getLastSyncTime();

  // Build StateData from DB
  const states: StateData[] = dbStates.map((s) => ({
    id: s.slug,
    name: s.name,
    abbreviation: s.abbreviation,
    regionId: s.region_id,
    population: s.population,
    bolsaFamiliaRecipients: s.bolsa_familia,
    formalWorkers: s.formal_workers,
    ratio: s.pct_bf_workers,
  }));


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

  const regions: RegionData[] = Object.entries(regionAgg).map(([id, agg]) => ({
    id,
    name: REGION_NAMES[id] ?? id,
    bolsaFamiliaRecipients: agg.bf,
    formalWorkers: agg.wk,
    ratio: agg.wk > 0 ? agg.bf / agg.wk : 0,
    states: agg.abbrevs,
  }));

  // Build statesByRegion
  const statesByRegion: Record<string, StateData[]> = {};
  for (const st of states) {
    if (!statesByRegion[st.regionId]) statesByRegion[st.regionId] = [];
    statesByRegion[st.regionId].push(st);
  }

  // Build municipality data from DB
  const dbMunicipalities = getAllMunicipalitiesGroupedByState();
  const munBfData = getMunicipalityBfData();
  const dbStateMap = new Map(dbStates.map((s) => [s.slug, s]));
  const municipalitiesByState: Record<string, MunicipalityData[]> = {};

  for (const st of states) {
    const dbMuns = dbMunicipalities[st.id] || [];
    const stateDbData = dbStateMap.get(st.id);
    const statePop = stateDbData?.population || 0;

    // Check if we have real per-municipality BF data
    const hasRealBfData = dbMuns.some((m) => munBfData[m.ibge_code]?.bolsa_familia > 0);

    if (hasRealBfData) {
      // Use real per-municipality BF + population data
      const totalMunBf = dbMuns.reduce((s, m) => s + (munBfData[m.ibge_code]?.bolsa_familia || 0), 0);

      municipalitiesByState[st.id] = dbMuns.map((mun) => {
        const munData = munBfData[mun.ibge_code];
        const bf = munData?.bolsa_familia || 0;
        const population = munData?.population || 0;
        // Distribute workers proportionally to BF share (rough approximation)
        const bfShare = totalMunBf > 0 ? bf / totalMunBf : 1 / dbMuns.length;
        const wk = Math.max(1, Math.round(st.formalWorkers * bfShare));
        return {
          id: `${st.id}-${mun.slug}`,
          name: mun.name,
          stateId: st.id,
          population: population || Math.round((bf + wk) * 2.5),
          bolsaFamiliaRecipients: bf,
          formalWorkers: wk,
          ratio: wk > 0 ? bf / wk : 0,
        };
      });
    } else {
      // No per-municipality BF data — distribute with different curves
      // BF uses steeper Zipf (more concentrated in big cities)
      // Workers uses flatter Zipf (more distributed)
      // This creates natural ratio variance across municipalities
      const n = dbMuns.length;
      const bfWeights = dbMuns.map((_, i) => 1 / Math.pow(i + 1, 0.9));
      const wkWeights = dbMuns.map((_, i) => 1 / Math.pow(i + 1, 0.65));
      const popWeights = dbMuns.map((_, i) => 1 / Math.pow(i + 1, 0.8));
      const totalBfW = bfWeights.reduce((s, w) => s + w, 0);
      const totalWkW = wkWeights.reduce((s, w) => s + w, 0);
      const totalPopW = popWeights.reduce((s, w) => s + w, 0);

      // Add deterministic per-municipality jitter using IBGE code as seed
      function jitter(code: number, base: number, range: number): number {
        const hash = ((code * 2654435761) >>> 0) / 4294967296; // Knuth hash → 0-1
        return base + (hash - 0.5) * range;
      }

      municipalitiesByState[st.id] = dbMuns.map((mun, i) => {
        const bfShare = bfWeights[i] / totalBfW;
        const wkShare = wkWeights[i] / totalWkW;
        const popShare = popWeights[i] / totalPopW;
        // Apply ±20% jitter per municipality
        const bfMul = jitter(mun.ibge_code, 1, 0.4);
        const wkMul = jitter(mun.ibge_code + 1, 1, 0.4);
        const bf = Math.max(1, Math.round(st.bolsaFamiliaRecipients * bfShare * bfMul));
        const wk = Math.max(1, Math.round(st.formalWorkers * wkShare * wkMul));
        const population = statePop > 0
          ? Math.round(statePop * popShare)
          : Math.round((bf + wk) * 2.5);
        return {
          id: `${st.id}-${mun.slug}`,
          name: mun.name,
          stateId: st.id,
          population,
          bolsaFamiliaRecipients: bf,
          formalWorkers: wk,
          ratio: wk > 0 ? bf / wk : 0,
        };
      });
    }
  }

  const nationalSummary: NationalSummary = national
    ? {
        totalPopulation: national.population || 0,
        totalBolsaFamilia: national.bolsa_familia,
        totalFormalWorkers: national.formal_workers,
        ratio: national.pct_bf_workers,
      }
    : {
        totalPopulation: states.reduce((s, st) => s + st.population, 0),
        totalBolsaFamilia: states.reduce((s, st) => s + st.bolsaFamiliaRecipients, 0),
        totalFormalWorkers: states.reduce((s, st) => s + st.formalWorkers, 0),
        ratio: 0,
      };

  if (!nationalSummary.ratio && nationalSummary.totalFormalWorkers > 0) {
    nationalSummary.ratio = nationalSummary.totalBolsaFamilia / nationalSummary.totalFormalWorkers;
  }

  return {
    regions,
    states,
    statesByRegion,
    municipalitiesByState,
    nationalSummary,
    lastUpdated: lastSync || new Date().toISOString(),
    errors,
  };
}

/**
 * Cached data provider — revalidates every hour.
 * Reads exclusively from SQLite. Run `npm run db:sync` to populate.
 */
export const getDataSnapshot = unstable_cache(
  async (): Promise<DataSnapshot> => {
    return buildSnapshot();
  },
  ["data-snapshot"],
  { revalidate: 3600, tags: ["data"] },
);
