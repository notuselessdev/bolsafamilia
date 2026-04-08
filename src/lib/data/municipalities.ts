import { MunicipalityData } from "@/lib/types/region";

// Mock municipality data for each state
// In production, this would come from IBGE API (US-007)
const MUNICIPALITY_DATA: Record<string, { name: string; bfPct: number; wkPct: number }[]> = {
  // Norte
  acre: [
    { name: "Rio Branco", bfPct: 0.55, wkPct: 0.60 },
    { name: "Cruzeiro do Sul", bfPct: 0.20, wkPct: 0.15 },
    { name: "Sena Madureira", bfPct: 0.12, wkPct: 0.10 },
    { name: "Tarauacá", bfPct: 0.08, wkPct: 0.08 },
    { name: "Feijó", bfPct: 0.05, wkPct: 0.07 },
  ],
  amazonas: [
    { name: "Manaus", bfPct: 0.65, wkPct: 0.72 },
    { name: "Parintins", bfPct: 0.10, wkPct: 0.07 },
    { name: "Itacoatiara", bfPct: 0.08, wkPct: 0.06 },
    { name: "Manacapuru", bfPct: 0.07, wkPct: 0.05 },
    { name: "Coari", bfPct: 0.05, wkPct: 0.05 },
    { name: "Tefé", bfPct: 0.05, wkPct: 0.05 },
  ],
  amapa: [
    { name: "Macapá", bfPct: 0.60, wkPct: 0.65 },
    { name: "Santana", bfPct: 0.20, wkPct: 0.18 },
    { name: "Laranjal do Jari", bfPct: 0.10, wkPct: 0.08 },
    { name: "Oiapoque", bfPct: 0.10, wkPct: 0.09 },
  ],
  para: [
    { name: "Belém", bfPct: 0.30, wkPct: 0.40 },
    { name: "Ananindeua", bfPct: 0.12, wkPct: 0.10 },
    { name: "Santarém", bfPct: 0.10, wkPct: 0.08 },
    { name: "Marabá", bfPct: 0.15, wkPct: 0.12 },
    { name: "Parauapebas", bfPct: 0.08, wkPct: 0.15 },
    { name: "Castanhal", bfPct: 0.10, wkPct: 0.07 },
    { name: "Altamira", bfPct: 0.08, wkPct: 0.04 },
    { name: "Cametá", bfPct: 0.07, wkPct: 0.04 },
  ],
  rondonia: [
    { name: "Porto Velho", bfPct: 0.50, wkPct: 0.55 },
    { name: "Ji-Paraná", bfPct: 0.18, wkPct: 0.18 },
    { name: "Ariquemes", bfPct: 0.12, wkPct: 0.10 },
    { name: "Vilhena", bfPct: 0.10, wkPct: 0.10 },
    { name: "Cacoal", bfPct: 0.10, wkPct: 0.07 },
  ],
  roraima: [
    { name: "Boa Vista", bfPct: 0.70, wkPct: 0.75 },
    { name: "Rorainópolis", bfPct: 0.15, wkPct: 0.10 },
    { name: "Caracaraí", bfPct: 0.10, wkPct: 0.10 },
    { name: "Pacaraima", bfPct: 0.05, wkPct: 0.05 },
  ],
  tocantins: [
    { name: "Palmas", bfPct: 0.35, wkPct: 0.45 },
    { name: "Araguaína", bfPct: 0.20, wkPct: 0.18 },
    { name: "Gurupi", bfPct: 0.15, wkPct: 0.12 },
    { name: "Porto Nacional", bfPct: 0.15, wkPct: 0.13 },
    { name: "Paraíso do Tocantins", bfPct: 0.15, wkPct: 0.12 },
  ],
  // Nordeste
  alagoas: [
    { name: "Maceió", bfPct: 0.45, wkPct: 0.55 },
    { name: "Arapiraca", bfPct: 0.18, wkPct: 0.15 },
    { name: "Rio Largo", bfPct: 0.10, wkPct: 0.08 },
    { name: "Palmeira dos Índios", bfPct: 0.12, wkPct: 0.08 },
    { name: "Penedo", bfPct: 0.08, wkPct: 0.07 },
    { name: "União dos Palmares", bfPct: 0.07, wkPct: 0.07 },
  ],
  bahia: [
    { name: "Salvador", bfPct: 0.25, wkPct: 0.35 },
    { name: "Feira de Santana", bfPct: 0.12, wkPct: 0.10 },
    { name: "Vitória da Conquista", bfPct: 0.08, wkPct: 0.07 },
    { name: "Camaçari", bfPct: 0.06, wkPct: 0.08 },
    { name: "Itabuna", bfPct: 0.07, wkPct: 0.06 },
    { name: "Juazeiro", bfPct: 0.07, wkPct: 0.05 },
    { name: "Lauro de Freitas", bfPct: 0.05, wkPct: 0.06 },
    { name: "Ilhéus", bfPct: 0.06, wkPct: 0.05 },
    { name: "Jequié", bfPct: 0.06, wkPct: 0.05 },
    { name: "Teixeira de Freitas", bfPct: 0.05, wkPct: 0.04 },
    { name: "Barreiras", bfPct: 0.04, wkPct: 0.04 },
    { name: "Alagoinhas", bfPct: 0.04, wkPct: 0.03 },
    { name: "Porto Seguro", bfPct: 0.05, wkPct: 0.02 },
  ],
  ceara: [
    { name: "Fortaleza", bfPct: 0.40, wkPct: 0.50 },
    { name: "Caucaia", bfPct: 0.10, wkPct: 0.08 },
    { name: "Juazeiro do Norte", bfPct: 0.10, wkPct: 0.08 },
    { name: "Maracanaú", bfPct: 0.08, wkPct: 0.07 },
    { name: "Sobral", bfPct: 0.08, wkPct: 0.07 },
    { name: "Crato", bfPct: 0.07, wkPct: 0.05 },
    { name: "Itapipoca", bfPct: 0.06, wkPct: 0.05 },
    { name: "Maranguape", bfPct: 0.06, wkPct: 0.05 },
    { name: "Iguatu", bfPct: 0.05, wkPct: 0.05 },
  ],
  maranhao: [
    { name: "São Luís", bfPct: 0.35, wkPct: 0.50 },
    { name: "Imperatriz", bfPct: 0.15, wkPct: 0.15 },
    { name: "Timon", bfPct: 0.10, wkPct: 0.07 },
    { name: "Caxias", bfPct: 0.10, wkPct: 0.07 },
    { name: "Codó", bfPct: 0.08, wkPct: 0.05 },
    { name: "Paço do Lumiar", bfPct: 0.07, wkPct: 0.05 },
    { name: "Açailândia", bfPct: 0.08, wkPct: 0.06 },
    { name: "Bacabal", bfPct: 0.07, wkPct: 0.05 },
  ],
  paraiba: [
    { name: "João Pessoa", bfPct: 0.40, wkPct: 0.50 },
    { name: "Campina Grande", bfPct: 0.20, wkPct: 0.18 },
    { name: "Santa Rita", bfPct: 0.10, wkPct: 0.08 },
    { name: "Patos", bfPct: 0.10, wkPct: 0.08 },
    { name: "Bayeux", bfPct: 0.08, wkPct: 0.06 },
    { name: "Cabedelo", bfPct: 0.06, wkPct: 0.05 },
    { name: "Cajazeiras", bfPct: 0.06, wkPct: 0.05 },
  ],
  pernambuco: [
    { name: "Recife", bfPct: 0.30, wkPct: 0.40 },
    { name: "Jaboatão dos Guararapes", bfPct: 0.12, wkPct: 0.10 },
    { name: "Olinda", bfPct: 0.08, wkPct: 0.07 },
    { name: "Caruaru", bfPct: 0.08, wkPct: 0.08 },
    { name: "Petrolina", bfPct: 0.08, wkPct: 0.08 },
    { name: "Paulista", bfPct: 0.06, wkPct: 0.05 },
    { name: "Cabo de Santo Agostinho", bfPct: 0.06, wkPct: 0.05 },
    { name: "Camaragibe", bfPct: 0.05, wkPct: 0.04 },
    { name: "Garanhuns", bfPct: 0.05, wkPct: 0.04 },
    { name: "Vitória de Santo Antão", bfPct: 0.05, wkPct: 0.04 },
    { name: "Igarassu", bfPct: 0.04, wkPct: 0.03 },
    { name: "São Lourenço da Mata", bfPct: 0.03, wkPct: 0.02 },
  ],
  piaui: [
    { name: "Teresina", bfPct: 0.50, wkPct: 0.60 },
    { name: "Parnaíba", bfPct: 0.15, wkPct: 0.12 },
    { name: "Picos", bfPct: 0.10, wkPct: 0.08 },
    { name: "Piripiri", bfPct: 0.10, wkPct: 0.08 },
    { name: "Floriano", bfPct: 0.08, wkPct: 0.06 },
    { name: "Campo Maior", bfPct: 0.07, wkPct: 0.06 },
  ],
  "rio-grande-do-norte": [
    { name: "Natal", bfPct: 0.40, wkPct: 0.50 },
    { name: "Mossoró", bfPct: 0.18, wkPct: 0.15 },
    { name: "Parnamirim", bfPct: 0.12, wkPct: 0.10 },
    { name: "São Gonçalo do Amarante", bfPct: 0.08, wkPct: 0.07 },
    { name: "Macaíba", bfPct: 0.08, wkPct: 0.06 },
    { name: "Ceará-Mirim", bfPct: 0.07, wkPct: 0.06 },
    { name: "Caicó", bfPct: 0.07, wkPct: 0.06 },
  ],
  sergipe: [
    { name: "Aracaju", bfPct: 0.45, wkPct: 0.55 },
    { name: "Nossa Senhora do Socorro", bfPct: 0.15, wkPct: 0.12 },
    { name: "Lagarto", bfPct: 0.12, wkPct: 0.08 },
    { name: "Itabaiana", bfPct: 0.10, wkPct: 0.08 },
    { name: "São Cristóvão", bfPct: 0.10, wkPct: 0.10 },
    { name: "Estância", bfPct: 0.08, wkPct: 0.07 },
  ],
  // Centro-Oeste
  "distrito-federal": [
    { name: "Brasília", bfPct: 0.50, wkPct: 0.55 },
    { name: "Ceilândia", bfPct: 0.18, wkPct: 0.12 },
    { name: "Taguatinga", bfPct: 0.12, wkPct: 0.13 },
    { name: "Samambaia", bfPct: 0.10, wkPct: 0.10 },
    { name: "Planaltina", bfPct: 0.10, wkPct: 0.10 },
  ],
  goias: [
    { name: "Goiânia", bfPct: 0.35, wkPct: 0.45 },
    { name: "Aparecida de Goiânia", bfPct: 0.15, wkPct: 0.12 },
    { name: "Anápolis", bfPct: 0.12, wkPct: 0.10 },
    { name: "Rio Verde", bfPct: 0.08, wkPct: 0.08 },
    { name: "Luziânia", bfPct: 0.08, wkPct: 0.07 },
    { name: "Águas Lindas de Goiás", bfPct: 0.07, wkPct: 0.05 },
    { name: "Valparaíso de Goiás", bfPct: 0.07, wkPct: 0.06 },
    { name: "Trindade", bfPct: 0.08, wkPct: 0.07 },
  ],
  "mato-grosso-do-sul": [
    { name: "Campo Grande", bfPct: 0.45, wkPct: 0.50 },
    { name: "Dourados", bfPct: 0.15, wkPct: 0.15 },
    { name: "Três Lagoas", bfPct: 0.10, wkPct: 0.10 },
    { name: "Corumbá", bfPct: 0.10, wkPct: 0.08 },
    { name: "Ponta Porã", bfPct: 0.10, wkPct: 0.08 },
    { name: "Naviraí", bfPct: 0.10, wkPct: 0.09 },
  ],
  "mato-grosso": [
    { name: "Cuiabá", bfPct: 0.35, wkPct: 0.40 },
    { name: "Várzea Grande", bfPct: 0.15, wkPct: 0.12 },
    { name: "Rondonópolis", bfPct: 0.12, wkPct: 0.12 },
    { name: "Sinop", bfPct: 0.10, wkPct: 0.10 },
    { name: "Tangará da Serra", bfPct: 0.08, wkPct: 0.08 },
    { name: "Cáceres", bfPct: 0.08, wkPct: 0.06 },
    { name: "Sorriso", bfPct: 0.06, wkPct: 0.06 },
    { name: "Lucas do Rio Verde", bfPct: 0.06, wkPct: 0.06 },
  ],
  // Sudeste
  "espirito-santo": [
    { name: "Vitória", bfPct: 0.20, wkPct: 0.30 },
    { name: "Vila Velha", bfPct: 0.20, wkPct: 0.18 },
    { name: "Serra", bfPct: 0.18, wkPct: 0.16 },
    { name: "Cariacica", bfPct: 0.15, wkPct: 0.12 },
    { name: "Cachoeiro de Itapemirim", bfPct: 0.10, wkPct: 0.08 },
    { name: "Linhares", bfPct: 0.08, wkPct: 0.08 },
    { name: "São Mateus", bfPct: 0.09, wkPct: 0.08 },
  ],
  "minas-gerais": [
    { name: "Belo Horizonte", bfPct: 0.22, wkPct: 0.30 },
    { name: "Uberlândia", bfPct: 0.10, wkPct: 0.10 },
    { name: "Contagem", bfPct: 0.08, wkPct: 0.08 },
    { name: "Juiz de Fora", bfPct: 0.07, wkPct: 0.07 },
    { name: "Betim", bfPct: 0.06, wkPct: 0.06 },
    { name: "Montes Claros", bfPct: 0.07, wkPct: 0.05 },
    { name: "Ribeirão das Neves", bfPct: 0.06, wkPct: 0.04 },
    { name: "Uberaba", bfPct: 0.05, wkPct: 0.05 },
    { name: "Governador Valadares", bfPct: 0.06, wkPct: 0.04 },
    { name: "Ipatinga", bfPct: 0.05, wkPct: 0.05 },
    { name: "Sete Lagoas", bfPct: 0.04, wkPct: 0.04 },
    { name: "Divinópolis", bfPct: 0.04, wkPct: 0.04 },
    { name: "Santa Luzia", bfPct: 0.05, wkPct: 0.04 },
    { name: "Poços de Caldas", bfPct: 0.05, wkPct: 0.04 },
  ],
  "rio-de-janeiro": [
    { name: "Rio de Janeiro", bfPct: 0.35, wkPct: 0.40 },
    { name: "São Gonçalo", bfPct: 0.10, wkPct: 0.08 },
    { name: "Duque de Caxias", bfPct: 0.10, wkPct: 0.08 },
    { name: "Nova Iguaçu", bfPct: 0.08, wkPct: 0.07 },
    { name: "Niterói", bfPct: 0.05, wkPct: 0.08 },
    { name: "Belford Roxo", bfPct: 0.06, wkPct: 0.04 },
    { name: "São João de Meriti", bfPct: 0.06, wkPct: 0.04 },
    { name: "Campos dos Goytacazes", bfPct: 0.05, wkPct: 0.05 },
    { name: "Petrópolis", bfPct: 0.04, wkPct: 0.05 },
    { name: "Volta Redonda", bfPct: 0.04, wkPct: 0.04 },
    { name: "Magé", bfPct: 0.04, wkPct: 0.03 },
    { name: "Macaé", bfPct: 0.03, wkPct: 0.04 },
  ],
  "sao-paulo": [
    { name: "São Paulo", bfPct: 0.30, wkPct: 0.35 },
    { name: "Guarulhos", bfPct: 0.08, wkPct: 0.07 },
    { name: "Campinas", bfPct: 0.06, wkPct: 0.07 },
    { name: "São Bernardo do Campo", bfPct: 0.05, wkPct: 0.06 },
    { name: "Santo André", bfPct: 0.04, wkPct: 0.05 },
    { name: "Osasco", bfPct: 0.04, wkPct: 0.05 },
    { name: "Ribeirão Preto", bfPct: 0.04, wkPct: 0.05 },
    { name: "Sorocaba", bfPct: 0.04, wkPct: 0.04 },
    { name: "São José dos Campos", bfPct: 0.04, wkPct: 0.05 },
    { name: "Santos", bfPct: 0.03, wkPct: 0.04 },
    { name: "Mauá", bfPct: 0.04, wkPct: 0.03 },
    { name: "São José do Rio Preto", bfPct: 0.03, wkPct: 0.03 },
    { name: "Mogi das Cruzes", bfPct: 0.04, wkPct: 0.03 },
    { name: "Piracicaba", bfPct: 0.03, wkPct: 0.03 },
    { name: "Bauru", bfPct: 0.03, wkPct: 0.03 },
    { name: "Jundiaí", bfPct: 0.03, wkPct: 0.03 },
    { name: "Carapicuíba", bfPct: 0.04, wkPct: 0.02 },
    { name: "Itaquaquecetuba", bfPct: 0.04, wkPct: 0.02 },
  ],
  // Sul
  parana: [
    { name: "Curitiba", bfPct: 0.30, wkPct: 0.35 },
    { name: "Londrina", bfPct: 0.12, wkPct: 0.10 },
    { name: "Maringá", bfPct: 0.10, wkPct: 0.10 },
    { name: "Ponta Grossa", bfPct: 0.08, wkPct: 0.08 },
    { name: "Cascavel", bfPct: 0.08, wkPct: 0.08 },
    { name: "São José dos Pinhais", bfPct: 0.06, wkPct: 0.06 },
    { name: "Foz do Iguaçu", bfPct: 0.06, wkPct: 0.05 },
    { name: "Colombo", bfPct: 0.05, wkPct: 0.04 },
    { name: "Guarapuava", bfPct: 0.05, wkPct: 0.04 },
    { name: "Paranaguá", bfPct: 0.05, wkPct: 0.05 },
    { name: "Toledo", bfPct: 0.05, wkPct: 0.05 },
  ],
  "rio-grande-do-sul": [
    { name: "Porto Alegre", bfPct: 0.25, wkPct: 0.30 },
    { name: "Caxias do Sul", bfPct: 0.10, wkPct: 0.12 },
    { name: "Pelotas", bfPct: 0.08, wkPct: 0.06 },
    { name: "Canoas", bfPct: 0.07, wkPct: 0.07 },
    { name: "Santa Maria", bfPct: 0.07, wkPct: 0.06 },
    { name: "Gravataí", bfPct: 0.06, wkPct: 0.06 },
    { name: "Viamão", bfPct: 0.06, wkPct: 0.04 },
    { name: "Novo Hamburgo", bfPct: 0.05, wkPct: 0.06 },
    { name: "São Leopoldo", bfPct: 0.05, wkPct: 0.05 },
    { name: "Rio Grande", bfPct: 0.05, wkPct: 0.05 },
    { name: "Alvorada", bfPct: 0.05, wkPct: 0.03 },
    { name: "Passo Fundo", bfPct: 0.05, wkPct: 0.05 },
    { name: "Sapucaia do Sul", bfPct: 0.06, wkPct: 0.05 },
  ],
  "santa-catarina": [
    { name: "Joinville", bfPct: 0.18, wkPct: 0.20 },
    { name: "Florianópolis", bfPct: 0.15, wkPct: 0.18 },
    { name: "Blumenau", bfPct: 0.12, wkPct: 0.14 },
    { name: "São José", bfPct: 0.10, wkPct: 0.10 },
    { name: "Chapecó", bfPct: 0.08, wkPct: 0.08 },
    { name: "Itajaí", bfPct: 0.07, wkPct: 0.08 },
    { name: "Criciúma", bfPct: 0.07, wkPct: 0.06 },
    { name: "Jaraguá do Sul", bfPct: 0.06, wkPct: 0.05 },
    { name: "Palhoça", bfPct: 0.06, wkPct: 0.04 },
    { name: "Lages", bfPct: 0.06, wkPct: 0.04 },
    { name: "Balneário Camboriú", bfPct: 0.05, wkPct: 0.03 },
  ],
};

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildMunicipalities(
  stateId: string,
  totalBF: number,
  totalWK: number,
): MunicipalityData[] {
  const template = MUNICIPALITY_DATA[stateId];
  if (!template) return [];

  return template.map(({ name, bfPct, wkPct }) => {
    const bf = Math.round(totalBF * bfPct);
    const wk = Math.round(totalWK * wkPct);
    // Mock population: roughly 2.5x the sum of BF recipients and workers
    const population = Math.round((bf + wk) * 2.5);
    return {
      id: `${stateId}-${toSlug(name)}`,
      name,
      stateId,
      population,
      bolsaFamiliaRecipients: bf,
      formalWorkers: wk,
      ratio: wk > 0 ? bf / wk : 0,
    };
  });
}

import { STATES } from "./states";

const municipalityCache: Record<string, MunicipalityData[]> = {};

export function getMunicipalitiesByState(stateId: string): MunicipalityData[] {
  if (municipalityCache[stateId]) return municipalityCache[stateId];

  const state = STATES.find((s) => s.id === stateId);
  if (!state) return [];

  const result = buildMunicipalities(
    stateId,
    state.bolsaFamiliaRecipients,
    state.formalWorkers,
  );
  municipalityCache[stateId] = result;
  return result;
}

export function getAllMunicipalitiesByState(): Record<string, MunicipalityData[]> {
  const result: Record<string, MunicipalityData[]> = {};
  for (const state of STATES) {
    result[state.id] = getMunicipalitiesByState(state.id);
  }
  return result;
}
