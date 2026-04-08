import { RegionData, NationalSummary } from "@/lib/types/region";

export const REGIONS: RegionData[] = [
  {
    id: "norte",
    name: "Norte",
    bolsaFamiliaRecipients: 2_870_000,
    formalWorkers: 1_950_000,
    ratio: 2_870_000 / 1_950_000,
    states: ["AC", "AM", "AP", "PA", "RO", "RR", "TO"],
  },
  {
    id: "nordeste",
    name: "Nordeste",
    bolsaFamiliaRecipients: 10_450_000,
    formalWorkers: 5_800_000,
    ratio: 10_450_000 / 5_800_000,
    states: ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"],
  },
  {
    id: "centro-oeste",
    name: "Centro-Oeste",
    bolsaFamiliaRecipients: 1_320_000,
    formalWorkers: 3_200_000,
    ratio: 1_320_000 / 3_200_000,
    states: ["DF", "GO", "MS", "MT"],
  },
  {
    id: "sudeste",
    name: "Sudeste",
    bolsaFamiliaRecipients: 6_900_000,
    formalWorkers: 22_500_000,
    ratio: 6_900_000 / 22_500_000,
    states: ["ES", "MG", "RJ", "SP"],
  },
  {
    id: "sul",
    name: "Sul",
    bolsaFamiliaRecipients: 1_460_000,
    formalWorkers: 7_100_000,
    ratio: 1_460_000 / 7_100_000,
    states: ["PR", "RS", "SC"],
  },
];

export function getNationalSummary(): NationalSummary {
  const totalBolsaFamilia = REGIONS.reduce(
    (sum, r) => sum + r.bolsaFamiliaRecipients,
    0
  );
  const totalFormalWorkers = REGIONS.reduce(
    (sum, r) => sum + r.formalWorkers,
    0
  );
  return {
    totalPopulation: 0,
    totalBolsaFamilia,
    totalFormalWorkers,
    ratio: totalBolsaFamilia / totalFormalWorkers,
  };
}
