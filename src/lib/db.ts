import Database from "better-sqlite3";
import { join } from "path";

const DB_PATH = join(process.cwd(), "data", "bolsafamilia.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true });
    _db.pragma("journal_mode = WAL");
  }
  return _db;
}

// ── Municipality queries ────────────────────────────────────────────────────

export interface DbMunicipality {
  ibge_code: number;
  name: string;
  slug: string;
  state_abbreviation: string;
  state_slug: string;
}

export interface DbMunicipalityData {
  ibge_code: number;
  state_abbreviation: string;
  population: number;
  bolsa_familia: number;
  pct_bf_population: number;
  bf_period: string | null;
  updated_at: string;
}

export function getMunicipalitiesByStateSlug(stateSlug: string): DbMunicipality[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM municipalities WHERE state_slug = ? ORDER BY name")
    .all(stateSlug) as DbMunicipality[];
}

export function getAllMunicipalitiesGroupedByState(): Record<string, DbMunicipality[]> {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM municipalities ORDER BY state_slug, name")
    .all() as DbMunicipality[];

  const grouped: Record<string, DbMunicipality[]> = {};
  for (const row of rows) {
    if (!grouped[row.state_slug]) grouped[row.state_slug] = [];
    grouped[row.state_slug].push(row);
  }
  return grouped;
}

export function getMunicipalityBfData(): Record<number, { bolsa_familia: number; population: number }> {
  const db = getDb();
  try {
    const rows = db
      .prepare("SELECT ibge_code, bolsa_familia, population FROM municipality_data")
      .all() as { ibge_code: number; bolsa_familia: number; population: number }[];
    const result: Record<number, { bolsa_familia: number; population: number }> = {};
    for (const row of rows) result[row.ibge_code] = { bolsa_familia: row.bolsa_familia, population: row.population };
    return result;
  } catch {
    return {};
  }
}

// ── State queries ───────────────────────────────────────────────────────────

export interface DbStateData {
  abbreviation: string;
  slug: string;
  name: string;
  region_id: string;
  population: number;
  bolsa_familia: number;
  formal_workers: number;
  pct_bf_workers: number;
  pct_bf_population: number;
  rank_bf_workers: number | null;
  rank_bf_count: number | null;
  bf_period: string | null;
  updated_at: string;
}

export function getStateData(): Record<string, DbStateData> {
  const db = getDb();
  try {
    const rows = db
      .prepare("SELECT * FROM state_data")
      .all() as DbStateData[];
    const result: Record<string, DbStateData> = {};
    for (const row of rows) result[row.abbreviation] = row;
    return result;
  } catch {
    return {};
  }
}

export function getAllStateData(): DbStateData[] {
  const db = getDb();
  try {
    return db.prepare("SELECT * FROM state_data ORDER BY abbreviation").all() as DbStateData[];
  } catch {
    return [];
  }
}

// ── National queries ────────────────────────────────────────────────────────

export interface DbNationalData {
  population: number;
  bolsa_familia: number;
  formal_workers: number;
  pct_bf_workers: number;
  pct_bf_population: number;
  bf_period: string | null;
  updated_at: string;
}

export function getNationalData(): DbNationalData | null {
  const db = getDb();
  try {
    return db.prepare("SELECT * FROM national_data WHERE id = 1").get() as DbNationalData | null;
  } catch {
    return null;
  }
}

export function getLastSyncTime(): string | null {
  const db = getDb();
  try {
    const row = db
      .prepare("SELECT MAX(updated_at) as last FROM state_data")
      .get() as { last: string | null };
    return row?.last ?? null;
  } catch {
    return null;
  }
}

export function hasData(): boolean {
  const db = getDb();
  try {
    const row = db.prepare("SELECT COUNT(*) as c FROM state_data").get() as { c: number };
    return row.c > 0;
  } catch {
    return false;
  }
}
