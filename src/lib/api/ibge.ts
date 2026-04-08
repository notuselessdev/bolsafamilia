/**
 * IBGE API client for geographic metadata.
 * Docs: https://servicodados.ibge.gov.br/api/docs/localidades
 */

const IBGE_BASE = "https://servicodados.ibge.gov.br/api/v1/localidades";

export interface IBGERegion {
  id: number;
  sigla: string;
  nome: string;
}

export interface IBGEState {
  id: number;
  sigla: string;
  nome: string;
  regiao: IBGERegion;
}

export interface IBGEMunicipality {
  id: number;
  nome: string;
  microrregiao: {
    mesorregiao: {
      UF: {
        id: number;
        sigla: string;
        nome: string;
      };
    };
  };
}

export async function fetchIBGERegions(): Promise<IBGERegion[]> {
  const res = await fetch(`${IBGE_BASE}/regioes`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`IBGE regions: ${res.status}`);
  return res.json();
}

export async function fetchIBGEStates(): Promise<IBGEState[]> {
  const res = await fetch(`${IBGE_BASE}/estados?orderBy=nome`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`IBGE states: ${res.status}`);
  return res.json();
}

export async function fetchIBGEMunicipalities(
  stateId: number,
): Promise<IBGEMunicipality[]> {
  const res = await fetch(`${IBGE_BASE}/estados/${stateId}/municipios`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`IBGE municipalities: ${res.status}`);
  return res.json();
}
