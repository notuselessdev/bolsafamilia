"use client";

import { useState } from "react";
import { StateData, MunicipalityData } from "@/lib/types/region";

type Tab = "states" | "cities";

interface TopRankingsProps {
  allStates: StateData[];
  allMunicipalities: Record<string, MunicipalityData[]>;
  selectedRegionId: string | null;
  selectedStateId: string | null;
}

export function TopRankings({
  allStates,
  allMunicipalities,
  selectedRegionId,
  selectedStateId,
}: TopRankingsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("states");

  // Filter states by scope
  const scopedStates = selectedRegionId
    ? allStates.filter((s) => s.regionId === selectedRegionId)
    : allStates;

  // Filter municipalities by scope
  const scopedMunicipalities: MunicipalityData[] = [];
  if (selectedStateId) {
    scopedMunicipalities.push(...(allMunicipalities[selectedStateId] ?? []));
  } else if (selectedRegionId) {
    for (const state of scopedStates) {
      scopedMunicipalities.push(...(allMunicipalities[state.id] ?? []));
    }
  } else {
    for (const muns of Object.values(allMunicipalities)) {
      scopedMunicipalities.push(...muns);
    }
  }

  // Sort by BF recipients descending, take top 10
  const topStates = [...scopedStates]
    .sort((a, b) => b.bolsaFamiliaRecipients - a.bolsaFamiliaRecipients)
    .slice(0, 10);

  const topCities = [...scopedMunicipalities]
    .sort((a, b) => b.bolsaFamiliaRecipients - a.bolsaFamiliaRecipients)
    .slice(0, 10);

  // When drilled into a state, only cities tab makes sense
  const showStatesTab = !selectedStateId;

  // If on states tab but drilled into a state, switch to cities
  const effectiveTab = selectedStateId ? "cities" : activeTab;

  const scopeLabel = selectedStateId
    ? allStates.find((s) => s.id === selectedStateId)?.name ?? ""
    : selectedRegionId
      ? `Região ${scopedStates[0]?.regionId ? capitalize(selectedRegionId) : ""}`
      : "Brasil";

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
        Top Rankings — {scopeLabel}
      </h3>

      {/* Toggle tabs */}
      {showStatesTab && (
        <div className="flex gap-1 mb-4 bg-slate-800/50 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("states")}
            className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-md transition-colors cursor-pointer ${
              effectiveTab === "states"
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            Top Estados
          </button>
          <button
            onClick={() => setActiveTab("cities")}
            className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-md transition-colors cursor-pointer ${
              effectiveTab === "cities"
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            Top Cidades
          </button>
        </div>
      )}

      {/* Table */}
      <div className="space-y-0">
        {/* Header */}
        <div className="flex items-center text-xs text-slate-500 pb-2 border-b border-slate-800">
          <span className="w-6 text-right mr-2">#</span>
          <span className="flex-1">Nome</span>
          <span className="w-20 text-right">BF</span>
          <span className="w-20 text-right">Trab.</span>
        </div>

        {effectiveTab === "states" ? (
          <div className="divide-y divide-slate-800/50">
            {topStates.map((state, i) => (
              <div
                key={state.id}
                className="flex items-center text-sm py-2"
              >
                <span className="w-6 text-right mr-2 text-slate-500 tabular-nums text-xs">
                  {i + 1}
                </span>
                <span className="flex-1 text-slate-300 truncate">
                  {state.abbreviation} — {state.name}
                </span>
                <span className="w-20 text-right text-amber-400 tabular-nums text-xs">
                  {formatNumber(state.bolsaFamiliaRecipients)}
                </span>
                <span className="w-20 text-right text-blue-400 tabular-nums text-xs">
                  {formatNumber(state.formalWorkers)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50 max-h-[400px] overflow-y-auto">
            {topCities.map((city, i) => (
              <div
                key={city.id}
                className="flex items-center text-sm py-2"
              >
                <span className="w-6 text-right mr-2 text-slate-500 tabular-nums text-xs">
                  {i + 1}
                </span>
                <span className="flex-1 text-slate-300 truncate">
                  {city.name}
                </span>
                <span className="w-20 text-right text-amber-400 tabular-nums text-xs">
                  {formatNumber(city.bolsaFamiliaRecipients)}
                </span>
                <span className="w-20 text-right text-blue-400 tabular-nums text-xs">
                  {formatNumber(city.formalWorkers)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toLocaleString("pt-BR");
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}
