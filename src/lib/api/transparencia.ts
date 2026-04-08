/**
 * Portal da Transparência API client for Bolsa Família data.
 * Docs: https://api.portaldatransparencia.gov.br/swagger-ui.html
 *
 * Requires API key via TRANSPARENCIA_API_KEY env var.
 * When unavailable, the data provider falls back to static data.
 */

const TRANSPARENCIA_BASE =
  "https://api.portaldatransparencia.gov.br/api-de-dados";

export interface BolsaFamiliaByState {
  uf: string;
  quantidadeBeneficiados: number;
  valor: number;
}

export async function fetchBolsaFamiliaByState(
  yearMonth: string,
): Promise<BolsaFamiliaByState[]> {
  const apiKey = process.env.TRANSPARENCIA_API_KEY;
  if (!apiKey) {
    throw new Error(
      "TRANSPARENCIA_API_KEY not configured — using fallback data",
    );
  }

  const res = await fetch(
    `${TRANSPARENCIA_BASE}/bolsa-familia-disponivel-por-municipio?mesAno=${yearMonth}&pagina=1&quantidade=10000`,
    {
      headers: { "chave-api-dados": apiKey },
      next: { revalidate: 3600 },
    },
  );
  if (!res.ok)
    throw new Error(`Portal da Transparência: ${res.status}`);
  return res.json();
}
