import { getDataSnapshot } from "@/lib/api/data-provider";
import { Dashboard } from "@/components/dashboard";

export default async function Home() {
  let snapshot;
  try {
    snapshot = await getDataSnapshot();
  } catch (e) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-800/50 rounded-2xl p-8 max-w-lg text-center">
          <h1 className="text-xl font-bold text-red-400 mb-3">Dados indisponíveis</h1>
          <p className="text-slate-300 mb-4">
            O banco de dados ainda não foi populado. Execute o comando abaixo para sincronizar os dados:
          </p>
          <code className="block bg-slate-800 rounded-lg px-4 py-3 text-sm text-amber-400 font-mono">
            npm run db:sync
          </code>
          <p className="text-xs text-slate-500 mt-4">
            {e instanceof Error ? e.message : "Erro ao carregar dados"}
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
