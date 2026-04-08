export interface StateData {
  id: string;
  name: string;
  abbreviation: string;
  regionId: string;
  bolsaFamiliaRecipients: number;
  formalWorkers: number;
  ratio: number;
}

export interface RegionData {
  id: string;
  name: string;
  bolsaFamiliaRecipients: number;
  formalWorkers: number;
  ratio: number;
  states: string[];
}

export interface MunicipalityData {
  id: string;
  name: string;
  stateId: string;
  population: number;
  bolsaFamiliaRecipients: number;
  formalWorkers: number;
  ratio: number;
}

export interface NationalSummary {
  totalBolsaFamilia: number;
  totalFormalWorkers: number;
  ratio: number;
}
