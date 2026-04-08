import { LEGEND_STEPS } from "@/lib/data/colors";

export function MapLegend() {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
        Raz&atilde;o Bolsa Fam&iacute;lia / Trabalhadores
      </h3>
      <div className="flex items-center gap-1">
        <span className="text-xs text-slate-400 w-8 text-right">Baixa</span>
        <div className="flex h-4 flex-1 rounded overflow-hidden">
          {LEGEND_STEPS.map((step, i) => (
            <div
              key={i}
              className="flex-1"
              style={{ backgroundColor: step.color }}
              aria-hidden="true"
            />
          ))}
        </div>
        <span className="text-xs text-slate-400 w-8">Alta</span>
      </div>
      <div className="flex justify-between px-8">
        {LEGEND_STEPS.map((step, i) => (
          <span key={i} className="text-xs text-slate-400 tabular-nums">
            {step.label}
          </span>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-1">
        Paleta viridis — acessível para daltonismo
      </p>
    </div>
  );
}
