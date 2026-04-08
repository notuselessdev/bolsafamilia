"use client";

import { useState } from "react";
import { RegionData, StateData } from "@/lib/types/region";
import { NationalSummary } from "@/lib/types/region";
import { BrazilMap } from "@/components/map/brazil-map";
import { MapLegend } from "@/components/map/map-legend";
import { SummaryCard } from "@/components/ui/summary-card";
import { getColorForRatio } from "@/lib/data/colors";

interface DashboardProps {
  regions: RegionData[];
  statesByRegion: Record<string, StateData[]>;
  nationalSummary: NationalSummary;
}

export function Dashboard({
  regions,
  statesByRegion,
  nationalSummary,
}: DashboardProps) {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

  const selectedRegion = selectedRegionId
    ? regions.find((r) => r.id === selectedRegionId) ?? null
    : null;

  const states = selectedRegion
    ? statesByRegion[selectedRegion.id] ?? []
    : [];

  function handleRegionClick(regionId: string) {
    setSelectedRegionId(regionId);
  }

  function handleBackToNational() {
    setSelectedRegionId(null);
  }

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <button
          onClick={handleBackToNational}
          className={`transition-colors ${
            selectedRegion
              ? "text-blue-400 hover:text-blue-300 cursor-pointer"
              : "text-white cursor-default"
          }`}
        >
          Brasil
        </button>
        {selectedRegion && (
          <>
            <span className="text-slate-500">&gt;</span>
            <span className="text-white">{selectedRegion.name}</span>
          </>
        )}
      </nav>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {selectedRegion ? (
          <>
            <SummaryCard
              title="Beneficiários Bolsa Família"
              value={selectedRegion.bolsaFamiliaRecipients.toLocaleString("pt-BR")}
              subtitle={`Região ${selectedRegion.name}`}
              accent="amber"
            />
            <SummaryCard
              title="Trabalhadores Formais"
              value={selectedRegion.formalWorkers.toLocaleString("pt-BR")}
              subtitle={`Região ${selectedRegion.name}`}
              accent="blue"
            />
            <SummaryCard
              title="Razão Regional"
              value={selectedRegion.ratio.toFixed(2)}
              subtitle="Beneficiários por trabalhador formal"
              accent="white"
            />
          </>
        ) : (
          <>
            <SummaryCard
              title="Beneficiários Bolsa Família"
              value={nationalSummary.totalBolsaFamilia.toLocaleString("pt-BR")}
              subtitle="Total nacional"
              accent="amber"
            />
            <SummaryCard
              title="Trabalhadores Formais"
              value={nationalSummary.totalFormalWorkers.toLocaleString("pt-BR")}
              subtitle="Total nacional"
              accent="blue"
            />
            <SummaryCard
              title="Razão Nacional"
              value={nationalSummary.ratio.toFixed(2)}
              subtitle="Beneficiários por trabalhador formal"
              accent="white"
            />
          </>
        )}
      </div>

      {/* Map + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/50 rounded-2xl border border-slate-800 p-4 sm:p-6">
          <BrazilMap
            regions={regions}
            statesByRegion={statesByRegion}
            selectedRegion={selectedRegion}
            onRegionClick={handleRegionClick}
          />
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-4 sm:p-6">
            <MapLegend />
          </div>

          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-4 sm:p-6">
            {selectedRegion ? (
              <StatesSidebar states={states} regionName={selectedRegion.name} />
            ) : (
              <RegionsSidebar regions={regions} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function RegionsSidebar({ regions }: { regions: RegionData[] }) {
  const sorted = [...regions].sort((a, b) => b.ratio - a.ratio);
  return (
    <>
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
        Dados por Região
      </h3>
      <div className="space-y-3">
        {sorted.map((region) => (
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
        <span className="w-10 text-right">Razão</span>
      </div>
    </>
  );
}

function StatesSidebar({
  states,
  regionName,
}: {
  states: StateData[];
  regionName: string;
}) {
  const sorted = [...states].sort((a, b) => b.ratio - a.ratio);
  return (
    <>
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
        Estados — {regionName}
      </h3>
      <div className="space-y-2.5">
        {sorted.map((state) => (
          <div key={state.id} className="flex items-center gap-2 text-sm">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: getColorForRatio(state.ratio) }}
            />
            <span className="text-slate-300 flex-1 truncate">
              {state.abbreviation} — {state.name}
            </span>
            <div className="flex gap-3 tabular-nums text-xs">
              <span className="text-amber-400">
                {(state.bolsaFamiliaRecipients / 1_000).toFixed(0)}k
              </span>
              <span className="text-blue-400">
                {(state.formalWorkers / 1_000).toFixed(0)}k
              </span>
              <span className="text-white font-medium w-10 text-right">
                {state.ratio.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3 mt-2 text-xs text-slate-500">
        <span>BF</span>
        <span>Trab.</span>
        <span className="w-10 text-right">Razão</span>
      </div>
    </>
  );
}
