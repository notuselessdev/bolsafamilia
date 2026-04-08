import { REGIONS, getNationalSummary } from "@/lib/data/regions";
import { STATES } from "@/lib/data/states";
import { Dashboard } from "@/components/dashboard";

export default function Home() {
  const summary = getNationalSummary();

  const statesByRegion: Record<string, typeof STATES> = {};
  for (const state of STATES) {
    if (!statesByRegion[state.regionId]) {
      statesByRegion[state.regionId] = [];
    }
    statesByRegion[state.regionId].push(state);
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <header className="border-b border-slate-800 px-6 py-4">
        <h1 className="text-xl font-bold text-white">
          Bolsa Família vs. Trabalhadores Formais
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Visão nacional por região
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <Dashboard
          regions={REGIONS}
          statesByRegion={statesByRegion}
          nationalSummary={summary}
        />
      </main>
    </div>
  );
}
