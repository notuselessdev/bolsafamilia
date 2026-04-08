import { getDataSnapshot } from "@/lib/api/data-provider";
import { Dashboard } from "@/components/dashboard";

export default async function Home() {
  const snapshot = await getDataSnapshot();

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <header className="border-b border-slate-800 px-4 sm:px-6 py-3 sm:py-4">
        <h1 className="text-base sm:text-xl font-bold text-white">
          Bolsa Família vs. Trabalhadores Formais
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Visão nacional por região
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <Dashboard
          regions={snapshot.regions}
          statesByRegion={snapshot.statesByRegion}
          municipalitiesByState={snapshot.municipalitiesByState}
          nationalSummary={snapshot.nationalSummary}
          lastUpdated={snapshot.lastUpdated}
          dataSource={snapshot.dataSource}
          errors={snapshot.errors}
        />
      </main>
    </div>
  );
}
