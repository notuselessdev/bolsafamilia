export interface RegionPath {
  id: string;
  d: string;
  labelX: number;
  labelY: number;
}

export const REGION_PATHS: RegionPath[] = [
  {
    id: "norte",
    d: "M120,50 L350,30 L450,60 L520,100 L530,180 L500,250 L450,280 L380,300 L300,310 L220,290 L170,260 L130,220 L100,170 L90,120 Z",
    labelX: 310,
    labelY: 170,
  },
  {
    id: "nordeste",
    d: "M380,300 L450,280 L500,250 L530,180 L580,170 L650,180 L700,220 L720,300 L700,380 L660,430 L600,460 L530,440 L480,400 L430,370 L390,340 Z",
    labelX: 590,
    labelY: 330,
  },
  {
    id: "centro-oeste",
    d: "M220,290 L300,310 L380,300 L390,340 L430,370 L480,400 L530,440 L510,500 L460,530 L390,540 L320,520 L260,480 L220,430 L200,370 Z",
    labelX: 360,
    labelY: 420,
  },
  {
    id: "sudeste",
    d: "M530,440 L600,460 L660,430 L680,470 L670,530 L630,580 L570,600 L510,590 L460,560 L460,530 L510,500 Z",
    labelX: 570,
    labelY: 520,
  },
  {
    id: "sul",
    d: "M390,540 L460,530 L460,560 L510,590 L570,600 L560,650 L520,700 L460,720 L400,700 L360,660 L350,610 Z",
    labelX: 450,
    labelY: 640,
  },
];
