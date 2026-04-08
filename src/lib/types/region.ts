export interface RegionData {
  id: string;
  name: string;
  bolsaFamiliaRecipients: number;
  formalWorkers: number;
  ratio: number;
  states: string[];
}

export interface NationalSummary {
  totalBolsaFamilia: number;
  totalFormalWorkers: number;
  ratio: number;
}
