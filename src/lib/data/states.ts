import { StateData } from "@/lib/types/region";

export const STATES: StateData[] = [
  // Norte
  { id: "acre", name: "Acre", abbreviation: "AC", regionId: "norte", bolsaFamiliaRecipients: 150_000, formalWorkers: 85_000, ratio: 150_000 / 85_000 },
  { id: "amazonas", name: "Amazonas", abbreviation: "AM", regionId: "norte", bolsaFamiliaRecipients: 720_000, formalWorkers: 480_000, ratio: 720_000 / 480_000 },
  { id: "amapa", name: "Amapá", abbreviation: "AP", regionId: "norte", bolsaFamiliaRecipients: 140_000, formalWorkers: 78_000, ratio: 140_000 / 78_000 },
  { id: "para", name: "Pará", abbreviation: "PA", regionId: "norte", bolsaFamiliaRecipients: 1_350_000, formalWorkers: 820_000, ratio: 1_350_000 / 820_000 },
  { id: "rondonia", name: "Rondônia", abbreviation: "RO", regionId: "norte", bolsaFamiliaRecipients: 210_000, formalWorkers: 220_000, ratio: 210_000 / 220_000 },
  { id: "roraima", name: "Roraima", abbreviation: "RR", regionId: "norte", bolsaFamiliaRecipients: 100_000, formalWorkers: 62_000, ratio: 100_000 / 62_000 },
  { id: "tocantins", name: "Tocantins", abbreviation: "TO", regionId: "norte", bolsaFamiliaRecipients: 200_000, formalWorkers: 205_000, ratio: 200_000 / 205_000 },

  // Nordeste
  { id: "alagoas", name: "Alagoas", abbreviation: "AL", regionId: "nordeste", bolsaFamiliaRecipients: 680_000, formalWorkers: 340_000, ratio: 680_000 / 340_000 },
  { id: "bahia", name: "Bahia", abbreviation: "BA", regionId: "nordeste", bolsaFamiliaRecipients: 2_800_000, formalWorkers: 1_600_000, ratio: 2_800_000 / 1_600_000 },
  { id: "ceara", name: "Ceará", abbreviation: "CE", regionId: "nordeste", bolsaFamiliaRecipients: 1_700_000, formalWorkers: 950_000, ratio: 1_700_000 / 950_000 },
  { id: "maranhao", name: "Maranhão", abbreviation: "MA", regionId: "nordeste", bolsaFamiliaRecipients: 1_500_000, formalWorkers: 560_000, ratio: 1_500_000 / 560_000 },
  { id: "paraiba", name: "Paraíba", abbreviation: "PB", regionId: "nordeste", bolsaFamiliaRecipients: 780_000, formalWorkers: 420_000, ratio: 780_000 / 420_000 },
  { id: "pernambuco", name: "Pernambuco", abbreviation: "PE", regionId: "nordeste", bolsaFamiliaRecipients: 1_650_000, formalWorkers: 1_050_000, ratio: 1_650_000 / 1_050_000 },
  { id: "piaui", name: "Piauí", abbreviation: "PI", regionId: "nordeste", bolsaFamiliaRecipients: 650_000, formalWorkers: 310_000, ratio: 650_000 / 310_000 },
  { id: "rio-grande-do-norte", name: "Rio Grande do Norte", abbreviation: "RN", regionId: "nordeste", bolsaFamiliaRecipients: 510_000, formalWorkers: 380_000, ratio: 510_000 / 380_000 },
  { id: "sergipe", name: "Sergipe", abbreviation: "SE", regionId: "nordeste", bolsaFamiliaRecipients: 380_000, formalWorkers: 190_000, ratio: 380_000 / 190_000 },

  // Centro-Oeste
  { id: "distrito-federal", name: "Distrito Federal", abbreviation: "DF", regionId: "centro-oeste", bolsaFamiliaRecipients: 220_000, formalWorkers: 1_100_000, ratio: 220_000 / 1_100_000 },
  { id: "goias", name: "Goiás", abbreviation: "GO", regionId: "centro-oeste", bolsaFamiliaRecipients: 520_000, formalWorkers: 1_050_000, ratio: 520_000 / 1_050_000 },
  { id: "mato-grosso-do-sul", name: "Mato Grosso do Sul", abbreviation: "MS", regionId: "centro-oeste", bolsaFamiliaRecipients: 230_000, formalWorkers: 480_000, ratio: 230_000 / 480_000 },
  { id: "mato-grosso", name: "Mato Grosso", abbreviation: "MT", regionId: "centro-oeste", bolsaFamiliaRecipients: 350_000, formalWorkers: 570_000, ratio: 350_000 / 570_000 },

  // Sudeste
  { id: "espirito-santo", name: "Espírito Santo", abbreviation: "ES", regionId: "sudeste", bolsaFamiliaRecipients: 450_000, formalWorkers: 850_000, ratio: 450_000 / 850_000 },
  { id: "minas-gerais", name: "Minas Gerais", abbreviation: "MG", regionId: "sudeste", bolsaFamiliaRecipients: 2_300_000, formalWorkers: 4_800_000, ratio: 2_300_000 / 4_800_000 },
  { id: "rio-de-janeiro", name: "Rio de Janeiro", abbreviation: "RJ", regionId: "sudeste", bolsaFamiliaRecipients: 1_800_000, formalWorkers: 4_350_000, ratio: 1_800_000 / 4_350_000 },
  { id: "sao-paulo", name: "São Paulo", abbreviation: "SP", regionId: "sudeste", bolsaFamiliaRecipients: 2_350_000, formalWorkers: 12_500_000, ratio: 2_350_000 / 12_500_000 },

  // Sul
  { id: "parana", name: "Paraná", abbreviation: "PR", regionId: "sul", bolsaFamiliaRecipients: 600_000, formalWorkers: 2_900_000, ratio: 600_000 / 2_900_000 },
  { id: "rio-grande-do-sul", name: "Rio Grande do Sul", abbreviation: "RS", regionId: "sul", bolsaFamiliaRecipients: 530_000, formalWorkers: 2_600_000, ratio: 530_000 / 2_600_000 },
  { id: "santa-catarina", name: "Santa Catarina", abbreviation: "SC", regionId: "sul", bolsaFamiliaRecipients: 330_000, formalWorkers: 1_600_000, ratio: 330_000 / 1_600_000 },
];

export function getStatesByRegion(regionId: string): StateData[] {
  return STATES.filter((s) => s.regionId === regionId);
}
