"use client";

import { useState } from "react";
import { RegionData, StateData, MunicipalityData } from "@/lib/types/region";
import { NationalSummary } from "@/lib/types/region";
import { BrazilMap } from "@/components/map/brazil-map";
import { MapLegend } from "@/components/map/map-legend";
import { SummaryCard } from "@/components/ui/summary-card";
import { getColorForRatio } from "@/lib/data/colors";
import { TopRankings } from "@/components/ui/top-rankings";
import { STATES } from "@/lib/data/states";

interface DashboardProps {
  regions: RegionData[];
  statesByRegion: Record<string, StateData[]>;
  municipalitiesByState: Record<string, MunicipalityData[]>;
  nationalSummary: NationalSummary;
  lastUpdated: string;
  dataSource: "api" | "static";
  errors: string[];
}

export function Dashboard({
  regions,
  statesByRegion,
  municipalitiesByState,
  nationalSummary,
  lastUpdated,
  dataSource,
  errors,
}: DashboardProps) {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<string | null>(null);

  const selectedRegion = selectedRegionId
    ? regions.find((r) => r.id === selectedRegionId) ?? null
    : null;

  const states = selectedRegion
    ? statesByRegion[selectedRegion.id] ?? []
    : [];

  const selectedState = selectedStateId
    ? states.find((s) => s.id === selectedStateId) ?? null
    : null;

  const municipalities = selectedState
    ? municipalitiesByState[selectedState.id] ?? []
    : [];

  const selectedMunicipality = selectedMunicipalityId
    ? municipalities.find((m) => m.id === selectedMunicipalityId) ?? null
    : null;

  function handleRegionClick(regionId: string) {
    setSelectedRegionId(regionId);
    setSelectedStateId(null);
    setSelectedMunicipalityId(null);
  }

  function handleStateClick(stateId: string) {
    setSelectedStateId(stateId);
    setSelectedMunicipalityId(null);
  }

  function handleMunicipalityClick(municipalityId: string) {
    setSelectedMunicipalityId(municipalityId);
  }

  function handleCloseCityPanel() {
    setSelectedMunicipalityId(null);
  }

  function handleBackToNational() {
    setSelectedRegionId(null);
    setSelectedStateId(null);
    setSelectedMunicipalityId(null);
  }

  function handleBackToRegion() {
    setSelectedStateId(null);
    setSelectedMunicipalityId(null);
  }

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
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
            <button
              onClick={handleBackToRegion}
              className={`transition-colors ${
                selectedState
                  ? "text-blue-400 hover:text-blue-300 cursor-pointer"
                  : "text-white cursor-default"
              }`}
            >
              {selectedRegion.name}
            </button>
          </>
        )}
        {selectedState && (
          <>
            <span className="text-slate-500">&gt;</span>
            <span className="text-white">{selectedState.name}</span>
          </>
        )}
      </nav>

      {/* Data status */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span>
          Atualizado em:{" "}
          {new Date(lastUpdated).toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </span>
        {dataSource === "static" && (
          <span className="bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded">
            Dados estáticos (APIs indisponíveis)
          </span>
        )}
      </div>

      {errors.length > 0 && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-lg px-4 py-3 text-sm text-red-300">
          <p className="font-medium mb-1">Alguns dados podem estar desatualizados:</p>
          <ul className="list-disc list-inside text-xs text-red-400">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {selectedState ? (
          <>
            <SummaryCard
              title="Beneficiários Bolsa Família"
              value={selectedState.bolsaFamiliaRecipients.toLocaleString("pt-BR")}
              subtitle={`Estado: ${selectedState.name}`}
              accent="amber"
            />
            <SummaryCard
              title="Trabalhadores Formais"
              value={selectedState.formalWorkers.toLocaleString("pt-BR")}
              subtitle={`Estado: ${selectedState.name}`}
              accent="blue"
            />
            <SummaryCard
              title="Razão Estadual"
              value={selectedState.ratio.toFixed(2)}
              subtitle="Beneficiários por trabalhador formal"
              accent="white"
            />
          </>
        ) : selectedRegion ? (
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

      {/* City detail panel */}
      {selectedMunicipality && selectedState && (
        <CityDetailPanel
          municipality={selectedMunicipality}
          stateName={selectedState.name}
          onClose={handleCloseCityPanel}
        />
      )}

      {/* Map + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-slate-900/50 rounded-2xl border border-slate-800 p-3 sm:p-6">
          <BrazilMap
            regions={regions}
            statesByRegion={statesByRegion}
            municipalitiesByState={municipalitiesByState}
            selectedRegion={selectedRegion}
            selectedState={selectedState}
            onRegionClick={handleRegionClick}
            onStateClick={handleStateClick}
            onMunicipalityClick={handleMunicipalityClick}
          />
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-3 sm:p-6">
            <MapLegend />
          </div>

          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-3 sm:p-6">
            {selectedState ? (
              <MunicipalitiesSidebar
                municipalities={municipalities}
                stateName={selectedState.name}
              />
            ) : selectedRegion ? (
              <StatesSidebar states={states} regionName={selectedRegion.name} />
            ) : (
              <RegionsSidebar regions={regions} />
            )}
          </div>
        </div>
      </div>

      {/* Top Rankings */}
      <TopRankings
        allStates={STATES}
        allMunicipalities={municipalitiesByState}
        selectedRegionId={selectedRegionId}
        selectedStateId={selectedStateId}
      />
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

function MunicipalitiesSidebar({
  municipalities,
  stateName,
}: {
  municipalities: MunicipalityData[];
  stateName: string;
}) {
  const sorted = [...municipalities].sort((a, b) => b.ratio - a.ratio);
  return (
    <>
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
        Municípios — {stateName}
      </h3>
      <div className="space-y-2.5 max-h-[400px] overflow-y-auto">
        {sorted.map((mun) => (
          <div key={mun.id} className="flex items-center gap-2 text-sm">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: getColorForRatio(mun.ratio) }}
            />
            <span className="text-slate-300 flex-1 truncate">
              {mun.name}
            </span>
            <div className="flex gap-3 tabular-nums text-xs">
              <span className="text-amber-400">
                {(mun.bolsaFamiliaRecipients / 1_000).toFixed(0)}k
              </span>
              <span className="text-blue-400">
                {(mun.formalWorkers / 1_000).toFixed(0)}k
              </span>
              <span className="text-white font-medium w-10 text-right">
                {mun.ratio.toFixed(2)}
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

function CityDetailPanel({
  municipality,
  stateName,
  onClose,
}: {
  municipality: MunicipalityData;
  stateName: string;
  onClose: () => void;
}) {
  const bfPercentOfPopulation =
    municipality.population > 0
      ? ((municipality.bolsaFamiliaRecipients / municipality.population) * 100).toFixed(1)
      : "0.0";

  return (
    <>
      {/* Mobile: bottom sheet overlay */}
      <div className="sm:hidden fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div
        className={
          "sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700 rounded-t-2xl p-4 pb-6 max-h-[70vh] overflow-y-auto animate-slide-up"
        }
      >
        <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-3" />
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-white">{municipality.name}</h2>
            <p className="text-sm text-slate-400">{stateName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xl leading-none p-1"
            aria-label="Fechar painel"
          >
            &times;
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="População" value={municipality.population.toLocaleString("pt-BR")} />
          <Stat
            label="Beneficiários BF"
            value={municipality.bolsaFamiliaRecipients.toLocaleString("pt-BR")}
            color="text-amber-400"
          />
          <Stat
            label="Trabalhadores Formais"
            value={municipality.formalWorkers.toLocaleString("pt-BR")}
            color="text-blue-400"
          />
          <Stat label="Razão BF/Trab." value={municipality.ratio.toFixed(2)} />
          <Stat
            label="% Pop. no Bolsa Família"
            value={`${bfPercentOfPopulation}%`}
            color="text-amber-400"
          />
        </div>
      </div>

      {/* Desktop: inline panel */}
      <div className="hidden sm:block bg-slate-900/50 rounded-2xl border border-slate-800 p-4 sm:p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer text-xl leading-none"
          aria-label="Fechar painel"
        >
          &times;
        </button>

        <h2 className="text-lg font-semibold text-white mb-1">
          {municipality.name}
        </h2>
        <p className="text-sm text-slate-400 mb-4">{stateName}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Stat label="População" value={municipality.population.toLocaleString("pt-BR")} />
          <Stat
            label="Beneficiários BF"
            value={municipality.bolsaFamiliaRecipients.toLocaleString("pt-BR")}
            color="text-amber-400"
          />
          <Stat
            label="Trabalhadores Formais"
            value={municipality.formalWorkers.toLocaleString("pt-BR")}
            color="text-blue-400"
          />
          <Stat label="Razão BF/Trab." value={municipality.ratio.toFixed(2)} />
          <Stat
            label="% Pop. no Bolsa Família"
            value={`${bfPercentOfPopulation}%`}
            color="text-amber-400"
          />
        </div>
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  color = "text-white",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className={`text-base font-semibold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}
