"use client";

import { useState } from "react";
import { StateData, MunicipalityData } from "@/lib/types/region";
import { getColorForRatio } from "@/lib/data/colors";

type Tab = "states" | "cities";
type Metric = "count" | "ratio";

interface TopRankingsProps {
  allStates: StateData[];
  allMunicipalities: Record<string, MunicipalityData[]>;
  selectedRegionId: string | null;
  selectedStateId: string | null;
  className?: string;
}

export function TopRankings({
  allStates,
  allMunicipalities,
  selectedRegionId,
  selectedStateId,
  className,
}: TopRankingsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("states");
  const [activeMetric, setActiveMetric] = useState<Metric>("count");

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

  // Sort by selected metric descending (worst first)
  const sortFn =
    activeMetric === "count"
      ? (a: { bolsaFamiliaRecipients: number }, b: { bolsaFamiliaRecipients: number }) =>
          b.bolsaFamiliaRecipients - a.bolsaFamiliaRecipients
      : (a: { ratio: number }, b: { ratio: number }) => b.ratio - a.ratio;

  const sortedStates = [...scopedStates].sort(sortFn);
  const sortedCities = [...scopedMunicipalities].sort(sortFn);

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
    <div className={`bg-slate-900/50 rounded-2xl border border-slate-800 p-3 sm:p-6 flex flex-col ${className ?? ""}`}>
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
        Municípios — {scopeLabel}
      </h3>

      {/* Metric toggle: By Count / By % */}
      <div className="flex gap-1 mb-3 bg-slate-800/50 rounded-lg p-1">
        <button
          onClick={() => setActiveMetric("count")}
          className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-md transition-colors cursor-pointer ${
            activeMetric === "count"
              ? "bg-amber-600/80 text-white"
              : "text-slate-400 hover:text-slate-300"
          }`}
        >
          Por Quantidade
        </button>
        <button
          onClick={() => setActiveMetric("ratio")}
          className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-md transition-colors cursor-pointer ${
            activeMetric === "ratio"
              ? "bg-amber-600/80 text-white"
              : "text-slate-400 hover:text-slate-300"
          }`}
        >
          Por Porcentagem
        </button>
      </div>

      {/* Entity toggle: States / Cities */}
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
            Estados
          </button>
          <button
            onClick={() => setActiveTab("cities")}
            className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-md transition-colors cursor-pointer ${
              effectiveTab === "cities"
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            Cidades
          </button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center text-xs text-slate-500 pb-2 border-b border-slate-800 pr-4">
          <span className="w-6 text-right mr-2">#</span>
          <span className="flex-1">Nome</span>
          {activeMetric === "count" ? (
            <>
              <span className="w-20 text-right">BF</span>
              <span className="w-20 text-right">Trab.</span>
            </>
          ) : (
            <span className="w-32 text-right">BF/Trab.</span>
          )}
        </div>

        {effectiveTab === "states" ? (
          <div className="divide-y divide-slate-800/50 max-h-[500px] overflow-y-auto custom-scrollbar pr-4">
            {sortedStates.map((state, i) => (
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
                {activeMetric === "count" ? (
                  <>
                    <span className="w-20 text-right text-amber-400 tabular-nums text-xs">
                      {formatNumber(state.bolsaFamiliaRecipients)}
                    </span>
                    <span className="w-20 text-right text-blue-400 tabular-nums text-xs">
                      {formatNumber(state.formalWorkers)}
                    </span>
                  </>
                ) : (
                  <span className="w-32 flex justify-end">
                    <span className="tabular-nums text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: getColorForRatio(state.ratio), backgroundColor: `${getColorForRatio(state.ratio)}18` }}>
                      {formatRatio(state.ratio)}
                    </span>
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50 max-h-[500px] overflow-y-auto custom-scrollbar pr-4">
            {sortedCities.map((city, i) => (
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
                {activeMetric === "count" ? (
                  <>
                    <span className="w-20 text-right text-amber-400 tabular-nums text-xs">
                      {formatNumber(city.bolsaFamiliaRecipients)}
                    </span>
                    <span className="w-20 text-right text-blue-400 tabular-nums text-xs">
                      {formatNumber(city.formalWorkers)}
                    </span>
                  </>
                ) : (
                  <span className="w-32 flex justify-end">
                    <span className="tabular-nums text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: getColorForRatio(city.ratio), backgroundColor: `${getColorForRatio(city.ratio)}18` }}>
                      {formatRatio(city.ratio)}
                    </span>
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-800 flex gap-4 text-xs text-slate-500">
        <span><span className="text-amber-400">BF</span> = Bolsa Família</span>
        <span><span className="text-blue-400">Trab.</span> = Trabalhadores</span>
      </div>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toLocaleString("pt-BR");
}

function formatRatio(ratio: number): string {
  return `${(ratio * 100).toFixed(0)}%`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}
