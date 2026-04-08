/**
 * Seed script: fetches all Brazilian municipalities from IBGE API
 * and stores them in a local SQLite database.
 *
 * Usage: node scripts/seed-municipalities.mjs
 */

import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "..", "data", "bolsafamilia.db");

const IBGE_BASE = "https://servicodados.ibge.gov.br/api/v1/localidades";

// State abbreviation → IBGE code mapping
const STATE_MAP = {
  AC: 12, AL: 27, AM: 13, AP: 16, BA: 29, CE: 23, DF: 53, ES: 32,
  GO: 52, MA: 21, MG: 31, MS: 50, MT: 51, PA: 15, PB: 25, PE: 26,
  PI: 22, PR: 41, RJ: 33, RN: 24, RO: 11, RR: 14, RS: 43, SC: 42,
  SE: 28, SP: 35, TO: 17,
};

// Our internal state slug mapping
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

function toSlug(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function fetchMunicipalities(ibgeStateCode) {
  const res = await fetch(`${IBGE_BASE}/estados/${ibgeStateCode}/municipios`);
  if (!res.ok) throw new Error(`IBGE ${ibgeStateCode}: ${res.status}`);
  return res.json();
}

async function main() {
  // Ensure data directory exists
  mkdirSync(dirname(DB_PATH), { recursive: true });

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  // Create tables
  db.exec(`
    DROP TABLE IF EXISTS municipalities;
    DROP TABLE IF EXISTS states;

    CREATE TABLE states (
      abbreviation TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      region_id TEXT NOT NULL,
      ibge_code INTEGER NOT NULL
    );

    CREATE TABLE municipalities (
      ibge_code INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      state_abbreviation TEXT NOT NULL REFERENCES states(abbreviation),
      state_slug TEXT NOT NULL,
      UNIQUE(state_slug, slug)
    );

    CREATE INDEX idx_mun_state ON municipalities(state_abbreviation);
    CREATE INDEX idx_mun_state_slug ON municipalities(state_slug);
  `);

  // Insert states
  const insertState = db.prepare(
    "INSERT INTO states (abbreviation, slug, name, region_id, ibge_code) VALUES (?, ?, ?, ?, ?)",
  );

  // Fetch state names from IBGE
  const ibgeStates = await (await fetch(`${IBGE_BASE}/estados?orderBy=nome`)).json();
  const stateNames = {};
  for (const s of ibgeStates) stateNames[s.sigla] = s.nome;

  for (const [abbr, ibgeCode] of Object.entries(STATE_MAP)) {
    insertState.run(abbr, STATE_SLUGS[abbr], stateNames[abbr] || abbr, REGION_MAP[abbr], ibgeCode);
  }
  console.log(`Inserted ${Object.keys(STATE_MAP).length} states`);

  // Fetch and insert municipalities for each state
  const insertMun = db.prepare(
    "INSERT INTO municipalities (ibge_code, name, slug, state_abbreviation, state_slug) VALUES (?, ?, ?, ?, ?)",
  );

  const insertMany = db.transaction((rows) => {
    for (const row of rows) insertMun.run(...row);
  });

  let totalMunicipalities = 0;

  for (const [abbr, ibgeCode] of Object.entries(STATE_MAP)) {
    try {
      const municipalities = await fetchMunicipalities(ibgeCode);
      const rows = municipalities.map((m) => [
        m.id,
        m.nome,
        toSlug(m.nome),
        abbr,
        STATE_SLUGS[abbr],
      ]);
      insertMany(rows);
      totalMunicipalities += rows.length;
      console.log(`  ${abbr}: ${rows.length} municipalities`);
    } catch (e) {
      console.error(`  ${abbr}: FAILED - ${e.message}`);
    }
  }

  console.log(`\nTotal: ${totalMunicipalities} municipalities`);
  console.log(`Database saved to: ${DB_PATH}`);
  db.close();
}

main().catch(console.error);
