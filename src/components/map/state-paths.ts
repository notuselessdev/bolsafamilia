export interface StatePath {
  id: string;
  d: string;
  labelX: number;
  labelY: number;
  abbreviation: string;
}

export interface RegionStatePaths {
  regionId: string;
  viewBox: string;
  paths: StatePath[];
}

export const REGION_STATE_PATHS: Record<string, RegionStatePaths> = {
  norte: {
    regionId: "norte",
    viewBox: "0 0 800 700",
    paths: [
      { id: "amazonas", abbreviation: "AM", d: "M50,120 L200,80 L320,100 L340,200 L300,300 L220,320 L120,300 L60,240 Z", labelX: 190, labelY: 200 },
      { id: "para", abbreviation: "PA", d: "M320,100 L520,80 L600,120 L620,220 L580,320 L480,360 L380,340 L300,300 L340,200 Z", labelX: 460, labelY: 220 },
      { id: "acre", abbreviation: "AC", d: "M30,300 L120,300 L140,380 L100,420 L30,400 Z", labelX: 85, labelY: 360 },
      { id: "rondonia", abbreviation: "RO", d: "M120,300 L220,320 L260,400 L220,460 L140,440 L100,420 L140,380 Z", labelX: 180, labelY: 390 },
      { id: "roraima", abbreviation: "RR", d: "M200,20 L320,10 L320,100 L200,80 Z", labelX: 260, labelY: 55 },
      { id: "amapa", abbreviation: "AP", d: "M520,10 L640,30 L600,120 L520,80 Z", labelX: 570, labelY: 65 },
      { id: "tocantins", abbreviation: "TO", d: "M380,340 L480,360 L500,460 L460,540 L380,520 L340,440 Z", labelX: 420, labelY: 440 },
    ],
  },
  nordeste: {
    regionId: "nordeste",
    viewBox: "0 0 800 750",
    paths: [
      { id: "maranhao", abbreviation: "MA", d: "M40,80 L200,60 L260,140 L240,260 L160,300 L60,260 L30,180 Z", labelX: 145, labelY: 175 },
      { id: "piaui", abbreviation: "PI", d: "M200,60 L340,50 L380,130 L360,260 L280,310 L240,260 L260,140 Z", labelX: 295, labelY: 180 },
      { id: "ceara", abbreviation: "CE", d: "M340,50 L520,40 L560,100 L520,180 L440,200 L380,130 Z", labelX: 450, labelY: 120 },
      { id: "rio-grande-do-norte", abbreviation: "RN", d: "M520,40 L700,50 L700,120 L620,140 L560,100 Z", labelX: 620, labelY: 90 },
      { id: "paraiba", abbreviation: "PB", d: "M520,180 L620,140 L700,120 L710,190 L540,210 Z", labelX: 620, labelY: 170 },
      { id: "pernambuco", abbreviation: "PE", d: "M440,200 L520,180 L540,210 L710,190 L720,260 L560,290 L440,270 Z", labelX: 570, labelY: 240 },
      { id: "alagoas", abbreviation: "AL", d: "M560,290 L720,260 L730,330 L600,340 Z", labelX: 650, labelY: 305 },
      { id: "sergipe", abbreviation: "SE", d: "M600,340 L730,330 L740,390 L640,400 Z", labelX: 670, labelY: 365 },
      { id: "bahia", abbreviation: "BA", d: "M160,300 L280,310 L360,260 L440,270 L560,290 L600,340 L640,400 L740,390 L740,540 L620,620 L440,640 L280,580 L180,480 L120,380 Z", labelX: 430, labelY: 460 },
    ],
  },
  "centro-oeste": {
    regionId: "centro-oeste",
    viewBox: "0 0 800 700",
    paths: [
      { id: "mato-grosso", abbreviation: "MT", d: "M40,40 L400,30 L440,160 L420,320 L300,360 L160,340 L60,260 L30,140 Z", labelX: 235, labelY: 190 },
      { id: "goias", abbreviation: "GO", d: "M300,360 L420,320 L540,340 L600,440 L560,540 L440,570 L340,520 L280,440 Z", labelX: 430, labelY: 440 },
      { id: "distrito-federal", abbreviation: "DF", d: "M560,400 L620,390 L630,430 L570,440 Z", labelX: 595, labelY: 415 },
      { id: "mato-grosso-do-sul", abbreviation: "MS", d: "M60,260 L160,340 L300,360 L280,440 L340,520 L300,620 L200,660 L80,600 L30,480 Z", labelX: 185, labelY: 480 },
    ],
  },
  sudeste: {
    regionId: "sudeste",
    viewBox: "0 0 800 700",
    paths: [
      { id: "minas-gerais", abbreviation: "MG", d: "M60,40 L380,30 L520,80 L600,180 L560,300 L440,360 L280,380 L140,340 L60,240 Z", labelX: 320, labelY: 200 },
      { id: "espirito-santo", abbreviation: "ES", d: "M560,300 L600,180 L720,200 L740,320 L640,340 Z", labelX: 660, labelY: 270 },
      { id: "rio-de-janeiro", abbreviation: "RJ", d: "M440,360 L560,300 L640,340 L740,320 L760,420 L640,460 L500,440 Z", labelX: 610, labelY: 395 },
      { id: "sao-paulo", abbreviation: "SP", d: "M60,240 L140,340 L280,380 L440,360 L500,440 L480,540 L360,600 L200,580 L80,500 L30,380 Z", labelX: 275, labelY: 450 },
    ],
  },
  sul: {
    regionId: "sul",
    viewBox: "0 0 800 700",
    paths: [
      { id: "parana", abbreviation: "PR", d: "M60,40 L400,30 L520,80 L560,200 L480,300 L320,340 L160,310 L60,220 Z", labelX: 310, labelY: 175 },
      { id: "santa-catarina", abbreviation: "SC", d: "M160,310 L320,340 L480,300 L520,400 L420,460 L260,450 L140,400 Z", labelX: 340, labelY: 385 },
      { id: "rio-grande-do-sul", abbreviation: "RS", d: "M140,400 L260,450 L420,460 L520,400 L540,520 L480,620 L360,680 L220,660 L120,580 L80,480 Z", labelX: 330, labelY: 550 },
    ],
  },
};
