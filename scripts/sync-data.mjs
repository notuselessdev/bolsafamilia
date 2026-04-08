/**
 * Daily sync script: fetches Bolsa Família data from Portal da Transparência
 * and formal employment data from IBGE SIDRA, then computes all metrics
 * and saves to SQLite.
 *
 * Usage:
 *   npm run db:sync
 *
 * Data sources:
 *   - Portal da Transparência: Bolsa Família beneficiaries per municipality
 *   - IBGE SIDRA table 4093: occupied + informal workers by state
 *     (formal = total occupied - informal)
 *   - IBGE API: population estimates per state
 */

import Database from "better-sqlite3";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const DB_PATH = join(PROJECT_ROOT, "data", "bolsafamilia.db");

config({ path: join(PROJECT_ROOT, ".env.local") });

const SIDRA_BASE = "https://apisidra.ibge.gov.br/values";
const TRANSPARENCIA_BASE = "https://api.portaldatransparencia.gov.br/api-de-dados";
const IBGE_BASE = "https://servicodados.ibge.gov.br/api/v1/localidades";

const STATE_SLUGS = {
  AC: "acre", AL: "alagoas", AM: "amazonas", AP: "amapa", BA: "bahia",
  CE: "ceara", DF: "distrito-federal", ES: "espirito-santo", GO: "goias",
  MA: "maranhao", MG: "minas-gerais", MS: "mato-grosso-do-sul",
  MT: "mato-grosso", PA: "para", PB: "paraiba", PE: "pernambuco",
  PI: "piaui", PR: "parana", RJ: "rio-de-janeiro",
  RN: "rio-grande-do-norte", RO: "rondonia", RR: "roraima",
  RS: "rio-grande-do-sul", SC: "santa-catarina", SE: "sergipe",
  SP: "sao-paulo", TO: "tocantins",
};

const REGION_MAP = {
  AC: "norte", AL: "nordeste", AM: "norte", AP: "norte", BA: "nordeste",
  CE: "nordeste", DF: "centro-oeste", ES: "sudeste", GO: "centro-oeste",
  MA: "nordeste", MG: "sudeste", MS: "centro-oeste", MT: "centro-oeste",
  PA: "norte", PB: "nordeste", PE: "nordeste", PI: "nordeste", PR: "sul",
  RJ: "sudeste", RN: "nordeste", RO: "norte", RR: "norte", RS: "sul",
  SC: "sul", SE: "nordeste", SP: "sudeste", TO: "norte",
};

function slugToAbbr(slug) {
  return Object.entries(STATE_SLUGS).find(([, s]) => s === slug)?.[0];
}

// Rate limiting: 180 req/min for restricted APIs (Transparência)
// Use 150 req/min to stay safe with margin
function getRateLimit() {
  const hour = new Date().getHours();
  return hour >= 0 && hour < 6 ? 600 : 150; // night: 600, day: 150 (safe margin)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── SIDRA: Formal workers by state ──────────────────────────────────────────

async function fetchSidra(variableId) {
  const url = `${SIDRA_BASE}/t/4093/n3/all/v/${variableId}/p/last`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`SIDRA v${variableId}: ${res.status}`);
  const rows = await res.json();
  const data = {};
  for (let i = 1; i < rows.length; i++) {
    const name = rows[i]["D1N"];
    const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const abbr = Object.entries(STATE_SLUGS).find(([, s]) => s === slug)?.[0];
    if (abbr) data[abbr] = parseInt(rows[i]["V"], 10) || 0;
  }
  return data;
}

async function fetchFormalWorkers() {
  console.log("  Fetching total occupied (SIDRA v/4090) ...");
  const totalOccupied = await fetchSidra(4090);
  console.log("  Fetching informal workers (SIDRA v/4723) ...");
  const informal = await fetchSidra(4723);

  const formal = {};
  for (const [uf, total] of Object.entries(totalOccupied)) {
    formal[uf] = (total - (informal[uf] || 0)) * 1000;
  }
  return formal;
}

// ── SIDRA: Population ───────────────────────────────────────────────────────

async function fetchMunicipalityPopulation() {
  // Table 6579: estimated population per municipality (single request, all 5571)
  console.log("  Fetching municipality population (SIDRA t/6579) ...");
  const url = `${SIDRA_BASE}/t/6579/n6/all/v/9324/p/last`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`SIDRA municipality pop: ${res.status}`);
  const rows = await res.json();
  const data = {};
  for (let i = 1; i < rows.length; i++) {
    const code = parseInt(rows[i]["D1C"], 10);
    const pop = parseInt(rows[i]["V"], 10) || 0;
    if (code && pop > 0) data[code] = pop;
  }
  console.log(`  ✓ ${Object.keys(data).length} municipalities`);
  return data;
}

async function fetchPopulation() {
  // Table 4709: estimated population by state
  console.log("  Fetching state population (SIDRA t/4709) ...");
  const url = `${SIDRA_BASE}/t/4709/n3/all/v/93/p/last`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`SIDRA population: ${res.status}`);
  const rows = await res.json();
  const data = {};
  for (let i = 1; i < rows.length; i++) {
    const name = rows[i]["D1N"];
    const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const abbr = Object.entries(STATE_SLUGS).find(([, s]) => s === slug)?.[0];
    if (abbr) data[abbr] = parseInt(rows[i]["V"], 10) || 0;
  }
  return data;
}

// ── Transparência: Bolsa Família per municipality ───────────────────────────

async function fetchBolsaFamiliaByMunicipality(db, munPopulation) {
  const apiKey = process.env.TRANSPARENCIA_API_KEY;
  if (!apiKey) {
    console.warn("  ⚠ TRANSPARENCIA_API_KEY not set — skipping BF data");
    return null;
  }

  // Ensure municipality_data table exists with all columns
  db.exec(`
    CREATE TABLE IF NOT EXISTS municipality_data (
      ibge_code INTEGER PRIMARY KEY,
      state_abbreviation TEXT NOT NULL,
      population INTEGER NOT NULL DEFAULT 0,
      bolsa_familia INTEGER NOT NULL DEFAULT 0,
      pct_bf_population REAL NOT NULL DEFAULT 0,
      bf_period TEXT,
      updated_at TEXT NOT NULL
    );
  `);
  // Add columns if upgrading from old schema
  try { db.exec("ALTER TABLE municipality_data ADD COLUMN population INTEGER NOT NULL DEFAULT 0"); } catch {}
  try { db.exec("ALTER TABLE municipality_data ADD COLUMN pct_bf_population REAL NOT NULL DEFAULT 0"); } catch {}

  // Get today's date to filter already-synced municipalities
  const today = new Date().toISOString().slice(0, 10);
  const alreadySynced = new Set(
    db.prepare("SELECT ibge_code FROM municipality_data WHERE updated_at >= ?")
      .all(today + "T00:00:00")
      .map((r) => r.ibge_code),
  );

  // Get all municipality IBGE codes, skip already synced today
  const allMunicipalities = db
    .prepare("SELECT ibge_code, state_abbreviation FROM municipalities")
    .all()
    .filter((m) => !alreadySynced.has(m.ibge_code));

  if (allMunicipalities.length === 0 && alreadySynced.size > 0) {
    console.log(`  ✓ All ${alreadySynced.size} municipalities already synced today`);
    // Return aggregated data from DB
    const rows = db.prepare("SELECT state_abbreviation, SUM(bolsa_familia) as total FROM municipality_data GROUP BY state_abbreviation").all();
    const byState = {};
    for (const r of rows) byState[r.state_abbreviation] = r.total;
    const munRows = db.prepare("SELECT ibge_code, bolsa_familia FROM municipality_data WHERE bolsa_familia > 0").all();
    const byMunicipality = {};
    for (const r of munRows) byMunicipality[r.ibge_code] = r.bolsa_familia;
    const period = db.prepare("SELECT bf_period FROM municipality_data LIMIT 1").get()?.bf_period;
    return { byMunicipality, byState, period };
  }

  if (alreadySynced.size > 0) {
    console.log(`  → Resuming: ${alreadySynced.size} already synced, ${allMunicipalities.length} remaining`);
  }

  // Find a month with data by testing one known municipality (São Paulo = 3550308)
  const now = new Date();
  let yearMonth = null;
  for (let offset = 0; offset <= 12; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
    try {
      const res = await fetch(
        `${TRANSPARENCIA_BASE}/novo-bolsa-familia-por-municipio?mesAno=${ym}&codigoIbge=3550308&pagina=1&quantidade=1`,
        { headers: { "chave-api-dados": apiKey } },
      );
      if (res.ok) {
        const rows = await res.json();
        if (rows.length > 0) {
          yearMonth = ym;
          console.log(`  → Found data for ${ym}`);
          break;
        }
      }
    } catch { /* continue */ }
  }

  if (!yearMonth) {
    console.warn("  ⚠ No BF data found in any recent month");
    return null;
  }

  // Prepare upsert statement for writing as we go
  const upsertMun = db.prepare(`
    INSERT OR REPLACE INTO municipality_data (ibge_code, state_abbreviation, population, bolsa_familia, pct_bf_population, bf_period, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Fetch municipalities with rate limiting, writing each batch to DB
  const rateLimit = getRateLimit();
  const BATCH_SIZE = Math.min(20, Math.floor(rateLimit / 4));
  const DELAY_MS = Math.ceil((BATCH_SIZE / rateLimit) * 60000);
  let fetched = 0;
  let errors = 0;
  const totalToFetch = allMunicipalities.length;

  console.log(`  Rate limit: ${rateLimit} req/min → ${BATCH_SIZE} parallel, ${DELAY_MS}ms between batches`);
  const estMinutes = Math.round((Math.ceil(totalToFetch / BATCH_SIZE) * DELAY_MS) / 60000);
  console.log(`  Estimated time: ~${estMinutes} minutes for ${totalToFetch} municipalities`);

  for (let i = 0; i < totalToFetch; i += BATCH_SIZE) {
    const batch = allMunicipalities.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async ({ ibge_code, state_abbreviation }) => {
        const res = await fetch(
          `${TRANSPARENCIA_BASE}/novo-bolsa-familia-por-municipio?mesAno=${yearMonth}&codigoIbge=${ibge_code}&pagina=1&quantidade=10`,
          { headers: { "chave-api-dados": apiKey } },
        );
        if (!res.ok) return { ibge_code, state_abbreviation, total: 0, ok: false };
        const rows = await res.json();
        let total = 0;
        for (const row of rows) {
          total += row.quantidadeBeneficiados || 0;
        }
        return { ibge_code, state_abbreviation, total, ok: true };
      }),
    );

    // Write batch to DB immediately
    const batchNow = new Date().toISOString();
    db.transaction(() => {
      for (const r of results) {
        if (r.status === "fulfilled" && r.value.ok) {
          const { ibge_code, state_abbreviation, total } = r.value;
          const pop = munPopulation[ibge_code] || 0;
          const pctBfPop = pop > 0 ? total / pop : 0;
          upsertMun.run(ibge_code, state_abbreviation, pop, total, pctBfPop, yearMonth, batchNow);
          if (total > 0) fetched++;
        } else {
          errors++;
        }
      }
    })();

    const pct = Math.round(((i + batch.length) / totalToFetch) * 100);
    const elapsed = i + batch.length;
    process.stdout.write(`\r  Fetching municipalities... ${elapsed}/${totalToFetch} (${pct}%) — ${fetched} with data, ${errors} errors`);

    // Rate limit delay
    if (i + BATCH_SIZE < totalToFetch) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n  ✓ ${fetched} municipalities with BF data`);
  if (errors > 0) console.log(`  ⚠ ${errors} failed requests (will retry on next run)`);

  // Aggregate from DB (includes previously synced + new data)
  const rows = db.prepare("SELECT state_abbreviation, SUM(bolsa_familia) as total FROM municipality_data WHERE bolsa_familia > 0 GROUP BY state_abbreviation").all();
  const byState = {};
  for (const r of rows) byState[r.state_abbreviation] = r.total;
  const munRows = db.prepare("SELECT ibge_code, bolsa_familia FROM municipality_data WHERE bolsa_familia > 0").all();
  const byMunicipality = {};
  for (const r of munRows) byMunicipality[r.ibge_code] = r.bolsa_familia;

  return { byMunicipality, byState, period: yearMonth };
}

// ── Save everything to SQLite ───────────────────────────────────────────────

function saveToDb(db, formalWorkers, population, bfData) {
  // Recreate tables
  db.exec(`
    DROP TABLE IF EXISTS state_data;
    DROP TABLE IF EXISTS municipality_data;
    DROP TABLE IF EXISTS national_data;

    CREATE TABLE state_data (
      abbreviation TEXT PRIMARY KEY REFERENCES states(abbreviation),
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      region_id TEXT NOT NULL,
      population INTEGER NOT NULL DEFAULT 0,
      bolsa_familia INTEGER NOT NULL DEFAULT 0,
      formal_workers INTEGER NOT NULL DEFAULT 0,
      pct_bf_workers REAL NOT NULL DEFAULT 0,
      pct_bf_population REAL NOT NULL DEFAULT 0,
      rank_bf_workers INTEGER,
      rank_bf_count INTEGER,
      bf_period TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE municipality_data (
      ibge_code INTEGER PRIMARY KEY,
      state_abbreviation TEXT NOT NULL,
      population INTEGER NOT NULL DEFAULT 0,
      bolsa_familia INTEGER NOT NULL DEFAULT 0,
      pct_bf_population REAL NOT NULL DEFAULT 0,
      bf_period TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE national_data (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      population INTEGER NOT NULL DEFAULT 0,
      bolsa_familia INTEGER NOT NULL DEFAULT 0,
      formal_workers INTEGER NOT NULL DEFAULT 0,
      pct_bf_workers REAL NOT NULL DEFAULT 0,
      pct_bf_population REAL NOT NULL DEFAULT 0,
      bf_period TEXT,
      updated_at TEXT NOT NULL
    );
  `);

  const now = new Date().toISOString();
  const bfPeriod = bfData?.period || null;
  const states = db.prepare("SELECT * FROM states").all();

  // Build state rows with all metrics
  const stateRows = states.map((st) => {
    const bf = bfData?.byState?.[st.abbreviation] || 0;
    const wk = formalWorkers[st.abbreviation] || 0;
    const pop = population[st.abbreviation] || 0;
    return {
      abbreviation: st.abbreviation,
      slug: st.slug,
      name: st.name,
      region_id: st.region_id,
      population: pop,
      bolsa_familia: bf,
      formal_workers: wk,
      pct_bf_workers: wk > 0 ? bf / wk : 0,
      pct_bf_population: pop > 0 ? bf / pop : 0,
    };
  });

  // Compute ranks
  const byPct = [...stateRows].sort((a, b) => b.pct_bf_workers - a.pct_bf_workers);
  const byCount = [...stateRows].sort((a, b) => b.bolsa_familia - a.bolsa_familia);
  byPct.forEach((r, i) => r.rank_bf_workers = i + 1);
  byCount.forEach((r, i) => r.rank_bf_count = i + 1);

  const upsertState = db.prepare(`
    INSERT OR REPLACE INTO state_data
    (abbreviation, slug, name, region_id, population, bolsa_familia, formal_workers,
     pct_bf_workers, pct_bf_population, rank_bf_workers, rank_bf_count, bf_period, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const upsertMun = db.prepare(`
    INSERT OR REPLACE INTO municipality_data (ibge_code, state_abbreviation, bolsa_familia, bf_period, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  db.transaction(() => {
    for (const r of stateRows) {
      upsertState.run(
        r.abbreviation, r.slug, r.name, r.region_id, r.population,
        r.bolsa_familia, r.formal_workers, r.pct_bf_workers, r.pct_bf_population,
        r.rank_bf_workers, r.rank_bf_count, bfPeriod, now,
      );
    }

    // Save per-municipality BF data
    if (bfData?.byMunicipality) {
      for (const [code, bf] of Object.entries(bfData.byMunicipality)) {
        const mun = db.prepare("SELECT state_abbreviation FROM municipalities WHERE ibge_code = ?").get(code);
        if (mun) {
          upsertMun.run(parseInt(code), mun.state_abbreviation, bf, bfPeriod, now);
        }
      }
    }

    // National totals
    const totalPop = stateRows.reduce((s, r) => s + r.population, 0);
    const totalBf = stateRows.reduce((s, r) => s + r.bolsa_familia, 0);
    const totalWk = stateRows.reduce((s, r) => s + r.formal_workers, 0);

    db.prepare(`
      INSERT OR REPLACE INTO national_data (id, population, bolsa_familia, formal_workers, pct_bf_workers, pct_bf_population, bf_period, updated_at)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?)
    `).run(totalPop, totalBf, totalWk, totalWk > 0 ? totalBf / totalWk : 0, totalPop > 0 ? totalBf / totalPop : 0, bfPeriod, now);
  })();

  // Print summary
  console.log("\n  UF   | Population |      BF      | Formal Workers | %BF/Trab | %BF/Pop | Rank");
  console.log("  -----+------------+--------------+----------------+----------+---------+-----");
  for (const r of byPct) {
    console.log(
      `  ${r.abbreviation.padEnd(4)} | ${String(r.population).padStart(10)} | ${String(r.bolsa_familia).padStart(12)} | ${String(r.formal_workers).padStart(14)} | ${(r.pct_bf_workers * 100).toFixed(1).padStart(7)}% | ${(r.pct_bf_population * 100).toFixed(1).padStart(6)}% | ${String(r.rank_bf_workers).padStart(4)}`,
    );
  }

  const munDataCount = db.prepare("SELECT COUNT(*) as c FROM municipality_data WHERE bolsa_familia > 0").get();
  console.log(`\n  Municipality BF data: ${munDataCount.c} records`);
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Bolsa Família Data Sync ===\n");

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  let formalWorkers = {};
  let population = {};
  let munPopulation = {};
  let bfData = null;

  console.log("[1/4] SIDRA — Employment data");
  try {
    formalWorkers = await fetchFormalWorkers();
    console.log(`  ✓ ${Object.keys(formalWorkers).length} states\n`);
  } catch (e) {
    console.error(`  ✗ Failed: ${e.message}\n`);
  }

  console.log("[2/4] SIDRA — State population");
  try {
    population = await fetchPopulation();
    console.log(`  ✓ ${Object.keys(population).length} states\n`);
  } catch (e) {
    console.error(`  ✗ Failed: ${e.message}\n`);
  }

  console.log("[3/4] SIDRA — Municipality population");
  try {
    munPopulation = await fetchMunicipalityPopulation();
  } catch (e) {
    console.error(`  ✗ Failed: ${e.message}\n`);
  }

  console.log("\n[4/4] Transparência — Bolsa Família");
  try {
    bfData = await fetchBolsaFamiliaByMunicipality(db, munPopulation);
    if (bfData) console.log(`  ✓ ${Object.keys(bfData.byState).length} states\n`);
  } catch (e) {
    console.error(`  ✗ Failed: ${e.message}\n`);
  }

  if (Object.keys(formalWorkers).length === 0 && !bfData && Object.keys(population).length === 0) {
    console.error("✗ No data from any source. Aborting.");
    db.close();
    process.exit(1);
  }

  saveToDb(db, formalWorkers, population, bfData);
  db.close();
  console.log("\n✓ Sync complete!");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
