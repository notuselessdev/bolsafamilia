/**
 * CAGED (Cadastro Geral de Empregados e Desempregados) data client.
 *
 * The Novo CAGED data is published by the Ministry of Labor.
 * Public microdata is available at: https://www.gov.br/trabalho-e-emprego/
 *
 * Since there is no simple REST API for CAGED aggregated data,
 * this module provides a fetch interface that the data provider
 * uses when a compatible endpoint is configured via CAGED_API_URL env var.
 * Otherwise, the data provider falls back to static data.
 */

export interface CAGEDStateData {
  uf: string;
  admissoes: number;
  desligamentos: number;
  saldo: number;
  estoqueEmpregos: number;
}

export async function fetchCAGEDByState(): Promise<CAGEDStateData[]> {
  const apiUrl = process.env.CAGED_API_URL;
  if (!apiUrl) {
    throw new Error("CAGED_API_URL not configured — using fallback data");
  }

  const res = await fetch(apiUrl, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`CAGED API: ${res.status}`);
  return res.json();
}
