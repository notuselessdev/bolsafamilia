// Green → Yellow → Red → Dark alarming for high ratios
const GRADIENT_STOPS = [
  { ratio: 0.0, color: "#22c55e" },  // green — good
  { ratio: 0.25, color: "#eab308" }, // yellow — moderate
  { ratio: 0.5, color: "#ef4444" },  // red — bad
  { ratio: 0.75, color: "#991b1b" }, // dark red — alarming
];

export function getColorForRatio(ratio: number): string {
  if (ratio <= GRADIENT_STOPS[0].ratio) return GRADIENT_STOPS[0].color;
  if (ratio >= GRADIENT_STOPS[GRADIENT_STOPS.length - 1].ratio)
    return GRADIENT_STOPS[GRADIENT_STOPS.length - 1].color;

  for (let i = 0; i < GRADIENT_STOPS.length - 1; i++) {
    const curr = GRADIENT_STOPS[i];
    const next = GRADIENT_STOPS[i + 1];
    if (ratio >= curr.ratio && ratio <= next.ratio) {
      const t = (ratio - curr.ratio) / (next.ratio - curr.ratio);
      return interpolateColor(curr.color, next.color, t);
    }
  }
  return GRADIENT_STOPS[GRADIENT_STOPS.length - 1].color;
}

function interpolateColor(c1: string, c2: string, t: number): string {
  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export const LEGEND_STEPS = GRADIENT_STOPS.map((s) => ({
  ratio: s.ratio,
  color: s.color,
  label: `${(s.ratio * 100).toFixed(0)}%`,
}));
