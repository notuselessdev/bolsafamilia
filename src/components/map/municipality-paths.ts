export interface MunicipalityPath {
  id: string;
  d: string;
  labelX: number;
  labelY: number;
}

export interface StateMunicipalityPaths {
  stateId: string;
  viewBox: string;
  paths: MunicipalityPath[];
}

/**
 * Generates a grid-based layout of municipality shapes within a viewBox.
 * Each municipality gets a rectangular cell with a slightly irregular polygon shape.
 */
function generateGrid(
  ids: string[],
  cols: number,
  width: number,
  height: number,
  padding: number = 8,
): MunicipalityPath[] {
  const rows = Math.ceil(ids.length / cols);
  const cellW = (width - padding * 2) / cols;
  const cellH = (height - padding * 2) / rows;
  const inset = 4;

  return ids.map((id, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = padding + col * cellW;
    const y = padding + row * cellH;

    // Slightly irregular polygon for visual interest
    const jx = (i * 7) % 5;
    const jy = (i * 11) % 5;
    const x0 = x + inset + jx;
    const y0 = y + inset + jy;
    const x1 = x + cellW - inset - jy;
    const y1 = y + cellH - inset - jx;
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;

    const d = `M${x0},${y0 + (y1 - y0) * 0.2} L${mx - (x1 - x0) * 0.1},${y0} L${x1 - (x1 - x0) * 0.1},${y0 + (y1 - y0) * 0.1} L${x1},${my} L${x1 - (x1 - x0) * 0.05},${y1 - (y1 - y0) * 0.1} L${mx},${y1} L${x0 + (x1 - x0) * 0.1},${y1 - (y1 - y0) * 0.15} Z`;

    return {
      id,
      d,
      labelX: Math.round(mx),
      labelY: Math.round(my),
    };
  });
}

// Pre-defined municipality ID lists per state, matching the data in municipalities.ts
const STATE_MUNICIPALITIES: Record<string, string[]> = {
  acre: ["acre-rio-branco", "acre-cruzeiro-do-sul", "acre-sena-madureira", "acre-tarauaca", "acre-feijo"],
  amazonas: ["amazonas-manaus", "amazonas-parintins", "amazonas-itacoatiara", "amazonas-manacapuru", "amazonas-coari", "amazonas-tefe"],
  amapa: ["amapa-macapa", "amapa-santana", "amapa-laranjal-do-jari", "amapa-oiapoque"],
  para: ["para-belem", "para-ananindeua", "para-santarem", "para-maraba", "para-parauapebas", "para-castanhal", "para-altamira", "para-cameta"],
  rondonia: ["rondonia-porto-velho", "rondonia-ji-parana", "rondonia-ariquemes", "rondonia-vilhena", "rondonia-cacoal"],
  roraima: ["roraima-boa-vista", "roraima-rorainopolis", "roraima-caracarai", "roraima-pacaraima"],
  tocantins: ["tocantins-palmas", "tocantins-araguaina", "tocantins-gurupi", "tocantins-porto-nacional", "tocantins-paraiso-do-tocantins"],
  alagoas: ["alagoas-maceio", "alagoas-arapiraca", "alagoas-rio-largo", "alagoas-palmeira-dos-indios", "alagoas-penedo", "alagoas-uniao-dos-palmares"],
  bahia: ["bahia-salvador", "bahia-feira-de-santana", "bahia-vitoria-da-conquista", "bahia-camacari", "bahia-itabuna", "bahia-juazeiro", "bahia-lauro-de-freitas", "bahia-ilheus", "bahia-jequie", "bahia-teixeira-de-freitas", "bahia-barreiras", "bahia-alagoinhas", "bahia-porto-seguro"],
  ceara: ["ceara-fortaleza", "ceara-caucaia", "ceara-juazeiro-do-norte", "ceara-maracanau", "ceara-sobral", "ceara-crato", "ceara-itapipoca", "ceara-maranguape", "ceara-iguatu"],
  maranhao: ["maranhao-sao-luis", "maranhao-imperatriz", "maranhao-timon", "maranhao-caxias", "maranhao-codo", "maranhao-paco-do-lumiar", "maranhao-acailandia", "maranhao-bacabal"],
  paraiba: ["paraiba-joao-pessoa", "paraiba-campina-grande", "paraiba-santa-rita", "paraiba-patos", "paraiba-bayeux", "paraiba-cabedelo", "paraiba-cajazeiras"],
  pernambuco: ["pernambuco-recife", "pernambuco-jaboatao-dos-guararapes", "pernambuco-olinda", "pernambuco-caruaru", "pernambuco-petrolina", "pernambuco-paulista", "pernambuco-cabo-de-santo-agostinho", "pernambuco-camaragibe", "pernambuco-garanhuns", "pernambuco-vitoria-de-santo-antao", "pernambuco-igarassu", "pernambuco-sao-lourenco-da-mata"],
  piaui: ["piaui-teresina", "piaui-parnaiba", "piaui-picos", "piaui-piripiri", "piaui-floriano", "piaui-campo-maior"],
  "rio-grande-do-norte": ["rio-grande-do-norte-natal", "rio-grande-do-norte-mossoro", "rio-grande-do-norte-parnamirim", "rio-grande-do-norte-sao-goncalo-do-amarante", "rio-grande-do-norte-macaiba", "rio-grande-do-norte-ceara-mirim", "rio-grande-do-norte-caico"],
  sergipe: ["sergipe-aracaju", "sergipe-nossa-senhora-do-socorro", "sergipe-lagarto", "sergipe-itabaiana", "sergipe-sao-cristovao", "sergipe-estancia"],
  "distrito-federal": ["distrito-federal-brasilia", "distrito-federal-ceilandia", "distrito-federal-taguatinga", "distrito-federal-samambaia", "distrito-federal-planaltina"],
  goias: ["goias-goiania", "goias-aparecida-de-goiania", "goias-anapolis", "goias-rio-verde", "goias-luziania", "goias-aguas-lindas-de-goias", "goias-valparaiso-de-goias", "goias-trindade"],
  "mato-grosso-do-sul": ["mato-grosso-do-sul-campo-grande", "mato-grosso-do-sul-dourados", "mato-grosso-do-sul-tres-lagoas", "mato-grosso-do-sul-corumba", "mato-grosso-do-sul-ponta-pora", "mato-grosso-do-sul-navirai"],
  "mato-grosso": ["mato-grosso-cuiaba", "mato-grosso-varzea-grande", "mato-grosso-rondonopolis", "mato-grosso-sinop", "mato-grosso-tangara-da-serra", "mato-grosso-caceres", "mato-grosso-sorriso", "mato-grosso-lucas-do-rio-verde"],
  "espirito-santo": ["espirito-santo-vitoria", "espirito-santo-vila-velha", "espirito-santo-serra", "espirito-santo-cariacica", "espirito-santo-cachoeiro-de-itapemirim", "espirito-santo-linhares", "espirito-santo-sao-mateus"],
  "minas-gerais": ["minas-gerais-belo-horizonte", "minas-gerais-uberlandia", "minas-gerais-contagem", "minas-gerais-juiz-de-fora", "minas-gerais-betim", "minas-gerais-montes-claros", "minas-gerais-ribeirao-das-neves", "minas-gerais-uberaba", "minas-gerais-governador-valadares", "minas-gerais-ipatinga", "minas-gerais-sete-lagoas", "minas-gerais-divinopolis", "minas-gerais-santa-luzia", "minas-gerais-pocos-de-caldas"],
  "rio-de-janeiro": ["rio-de-janeiro-rio-de-janeiro", "rio-de-janeiro-sao-goncalo", "rio-de-janeiro-duque-de-caxias", "rio-de-janeiro-nova-iguacu", "rio-de-janeiro-niteroi", "rio-de-janeiro-belford-roxo", "rio-de-janeiro-sao-joao-de-meriti", "rio-de-janeiro-campos-dos-goytacazes", "rio-de-janeiro-petropolis", "rio-de-janeiro-volta-redonda", "rio-de-janeiro-mage", "rio-de-janeiro-macae"],
  "sao-paulo": ["sao-paulo-sao-paulo", "sao-paulo-guarulhos", "sao-paulo-campinas", "sao-paulo-sao-bernardo-do-campo", "sao-paulo-santo-andre", "sao-paulo-osasco", "sao-paulo-ribeirao-preto", "sao-paulo-sorocaba", "sao-paulo-sao-jose-dos-campos", "sao-paulo-santos", "sao-paulo-maua", "sao-paulo-sao-jose-do-rio-preto", "sao-paulo-mogi-das-cruzes", "sao-paulo-piracicaba", "sao-paulo-bauru", "sao-paulo-jundiai", "sao-paulo-carapicuiba", "sao-paulo-itaquaquecetuba"],
  parana: ["parana-curitiba", "parana-londrina", "parana-maringa", "parana-ponta-grossa", "parana-cascavel", "parana-sao-jose-dos-pinhais", "parana-foz-do-iguacu", "parana-colombo", "parana-guarapuava", "parana-paranagua", "parana-toledo"],
  "rio-grande-do-sul": ["rio-grande-do-sul-porto-alegre", "rio-grande-do-sul-caxias-do-sul", "rio-grande-do-sul-pelotas", "rio-grande-do-sul-canoas", "rio-grande-do-sul-santa-maria", "rio-grande-do-sul-gravatai", "rio-grande-do-sul-viamao", "rio-grande-do-sul-novo-hamburgo", "rio-grande-do-sul-sao-leopoldo", "rio-grande-do-sul-rio-grande", "rio-grande-do-sul-alvorada", "rio-grande-do-sul-passo-fundo", "rio-grande-do-sul-sapucaia-do-sul"],
  "santa-catarina": ["santa-catarina-joinville", "santa-catarina-florianopolis", "santa-catarina-blumenau", "santa-catarina-sao-jose", "santa-catarina-chapeco", "santa-catarina-itajai", "santa-catarina-criciuma", "santa-catarina-jaragua-do-sul", "santa-catarina-palhoca", "santa-catarina-lages", "santa-catarina-balneario-camboriu"],
};

// Grid column configuration per state (based on municipality count)
function getColsForCount(count: number): number {
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  if (count <= 9) return 3;
  if (count <= 12) return 4;
  if (count <= 16) return 4;
  return 5;
}

const VIEWBOX_W = 800;
const VIEWBOX_H = 700;

export function getStateMunicipalityPaths(stateId: string): StateMunicipalityPaths | null {
  const ids = STATE_MUNICIPALITIES[stateId];
  if (!ids) return null;

  const cols = getColsForCount(ids.length);
  const paths = generateGrid(ids, cols, VIEWBOX_W, VIEWBOX_H);

  return {
    stateId,
    viewBox: `0 0 ${VIEWBOX_W} ${VIEWBOX_H}`,
    paths,
  };
}
