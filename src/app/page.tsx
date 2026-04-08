import { getDataSnapshot } from "@/lib/api/data-provider";
import { Dashboard } from "@/components/dashboard";

export default async function Home() {
  let snapshot;
  try {
    if (process.env.SIMULATE_DB_ERROR === "true") {
      throw new Error("simulated db error");
    }
    snapshot = await getDataSnapshot();
  } catch (e) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-white mb-2">Dados sendo atualizados</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Os dados estão sendo sincronizados com as fontes oficiais. Por favor, tente novamente em alguns minutos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] py-5 sm:py-8">
      <header className="border-b border-slate-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div>
          <h1 className="text-base sm:text-xl font-bold text-white">
            Bolsa Família vs. Trabalhadores Formais
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Visão nacional por estado
          </p>
        </div>
        <span className="text-xs text-slate-500 whitespace-nowrap">
          Atualizado em:{" "}
          {new Date(snapshot.lastUpdated).toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </span>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <Dashboard
          regions={snapshot.regions}
          statesByRegion={snapshot.statesByRegion}
          municipalitiesByState={snapshot.municipalitiesByState}
          nationalSummary={snapshot.nationalSummary}
          errors={snapshot.errors}
        />
      </main>
    </div>
  );
}
