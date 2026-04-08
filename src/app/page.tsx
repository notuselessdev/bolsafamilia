import { REGIONS, getNationalSummary } from "@/lib/data/regions";
import { BrazilMap } from "@/components/map/brazil-map";
import { MapLegend } from "@/components/map/map-legend";
import { SummaryCard } from "@/components/ui/summary-card";

export default function Home() {
  const summary = getNationalSummary();

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <header className="border-b border-slate-800 px-6 py-4">
        <h1 className="text-xl font-bold text-white">
          Bolsa Fam&iacute;lia vs. Trabalhadores Formais
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Vis&atilde;o nacional por regi&atilde;o
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard
            title="Benefici&aacute;rios Bolsa Fam&iacute;lia"
            value={summary.totalBolsaFamilia.toLocaleString("pt-BR")}
            subtitle="Total nacional"
            accent="amber"
          />
          <SummaryCard
            title="Trabalhadores Formais"
            value={summary.totalFormalWorkers.toLocaleString("pt-BR")}
            subtitle="Total nacional"
            accent="blue"
          />
          <SummaryCard
            title="Raz&atilde;o Nacional"
            value={summary.ratio.toFixed(2)}
            subtitle="Benefici&aacute;rios por trabalhador formal"
            accent="white"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/50 rounded-2xl border border-slate-800 p-4 sm:p-6">
            <BrazilMap regions={REGIONS} />
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-4 sm:p-6">
              <MapLegend />
            </div>

            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
                Dados por Regi&atilde;o
              </h3>
              <div className="space-y-3">
                {REGIONS.sort((a, b) => b.ratio - a.ratio).map((region) => (
                  <div
                    key={region.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-slate-300">{region.name}</span>
                    <div className="flex gap-4 tabular-nums">
                      <span className="text-amber-400">
                        {(region.bolsaFamiliaRecipients / 1_000_000).toFixed(1)}M
                      </span>
                      <span className="text-blue-400">
                        {(region.formalWorkers / 1_000_000).toFixed(1)}M
                      </span>
                      <span className="text-white font-medium w-10 text-right">
                        {region.ratio.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-4 mt-2 text-xs text-slate-500">
                <span>BF</span>
                <span>Trab.</span>
                <span className="w-10 text-right">Raz&atilde;o</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
