"use client";

import { useState, useEffect } from "react";
import { RegionData, StateData, MunicipalityData } from "@/lib/types/region";
import { NationalSummary } from "@/lib/types/region";
import { BrazilMap } from "@/components/map/brazil-map";
import { MapLegend } from "@/components/map/map-legend";
import { SummaryCard } from "@/components/ui/summary-card";
import { getColorForRatio } from "@/lib/data/colors";
import { TopRankings } from "@/components/ui/top-rankings";

interface DashboardProps {
  regions: RegionData[];
  statesByRegion: Record<string, StateData[]>;
  municipalitiesByState: Record<string, MunicipalityData[]>;
  nationalSummary: NationalSummary;
  errors: string[];
}

export function Dashboard({
  regions,
  statesByRegion,
  municipalitiesByState,
  nationalSummary,
  errors,
}: DashboardProps) {
  function ratioLabel(ratio: number): string {
    if (ratio >= 1.5) return "Situação crítica";
    if (ratio >= 1.0) return "Mais BF que trabalhadores";
    if (ratio >= 0.5) return "Situação preocupante";
    if (ratio >= 0.2) return "Situação moderada";
    return "Situação controlada";
  }

  function formatRatioPercent(ratio: number): string {
    return `${(ratio * 100).toFixed(0)}%`;
  }

  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<string | null>(null);

  const [nudgeDismissed, setNudgeDismissed] = useState({ step1: false, step2: false });
  useEffect(() => {
    const stored = sessionStorage.getItem("nudge-dismissed");
    if (stored) setNudgeDismissed(JSON.parse(stored));
  }, []);

  function dismissNudge(step: "step1" | "step2") {
    setNudgeDismissed((prev) => {
      const next = { ...prev, [step]: true };
      sessionStorage.setItem("nudge-dismissed", JSON.stringify(next));
      return next;
    });
  }

  const allStates = Object.values(statesByRegion).flat();

  const selectedState = selectedStateId
    ? allStates.find((s) => s.id === selectedStateId) ?? null
    : null;

  const municipalities = selectedState
    ? (municipalitiesByState[selectedState.id] ?? [])
    : [];

  const selectedMunicipality = selectedMunicipalityId
    ? municipalities.find((m) => m.id === selectedMunicipalityId) ?? null
    : null;

  function handleStateClick(stateId: string, regionId: string) {
    if (!nudgeDismissed.step1) dismissNudge("step1");
    if (selectedStateId === stateId) {
      setSelectedStateId(null);
      setSelectedRegionId(null);
      setSelectedMunicipalityId(null);
    } else {
      setSelectedRegionId(regionId);
      setSelectedStateId(stateId);
      setSelectedMunicipalityId(null);
    }
  }

  function handleBackToNational() {
    setSelectedRegionId(null);
    setSelectedStateId(null);
    setSelectedMunicipalityId(null);
  }

  // Determine what summary data to show
  const summaryTarget = selectedMunicipality ?? selectedState ?? null;

  return (
    <>
      <WelcomeModal />

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

      {/* City selector — appears when a state is selected, above stats */}
      {selectedState && municipalities.length > 0 && (
        <CitySelector
          municipalities={municipalities}
          selectedMunicipalityId={selectedMunicipalityId}
          stateName={selectedState.name}
          onSelect={(id) => {
            setSelectedMunicipalityId(id);
            if (id && !nudgeDismissed.step2) dismissNudge("step2");
          }}
          onClear={handleBackToNational}
          showNudge={!nudgeDismissed.step2}
        />
      )}

      {/* Summary cards */}
      {summaryTarget ? (() => {
        const isMunicipality = "stateId" in summaryTarget;
        const scope = isMunicipality ? summaryTarget.name : `Estado: ${summaryTarget.name}`;
        const pop = summaryTarget.population || 0;
        const pctBfPop = pop > 0 ? (summaryTarget.bolsaFamiliaRecipients / pop) * 100 : 0;
        const pctWorkersPop = pop > 0 ? (summaryTarget.formalWorkers / pop) * 100 : 0;
        return (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <SummaryCard title="População" value={pop > 0 ? pop.toLocaleString("pt-BR") : "—"} subtitle={scope} accent="white" />
            <SummaryCard title="Beneficiários Bolsa Família" value={summaryTarget.bolsaFamiliaRecipients.toLocaleString("pt-BR")} subtitle={pctBfPop > 0 ? `${pctBfPop.toFixed(1)}% da população` : scope} accent="white" />
            <SummaryCard title="Trabalhadores Formais" value={summaryTarget.formalWorkers.toLocaleString("pt-BR")} subtitle={pctWorkersPop > 0 ? `${pctWorkersPop.toFixed(1)}% da população` : scope} accent="white" />
            <SummaryCard
              title="Bolsa Família vs Trabalhadores Formais"
              value={formatRatioPercent(summaryTarget.ratio)}
              subtitle={ratioLabel(summaryTarget.ratio)}
              accent={summaryTarget.ratio >= 1 ? "red" : summaryTarget.ratio >= 0.5 ? "amber" : "green"}
            />
            <SummaryCard title="% População no Bolsa Família" value={pctBfPop > 0 ? `${pctBfPop.toFixed(1)}%` : "—"} subtitle={pctBfPop >= 15 ? "Nível crítico" : pctBfPop >= 8 ? "Nível alto" : "Nível moderado"} accent={pctBfPop >= 15 ? "red" : pctBfPop >= 8 ? "amber" : "green"} />
            <SummaryCard title="% População Trabalhando" value={pctWorkersPop > 0 ? `${pctWorkersPop.toFixed(1)}%` : "—"} subtitle={pctWorkersPop >= 40 ? "Alta formalização" : pctWorkersPop >= 25 ? "Moderada" : "Baixa formalização"} accent={pctWorkersPop >= 40 ? "green" : pctWorkersPop >= 25 ? "amber" : "red"} />
          </div>
        );
      })() : (() => {
        const pctBfPop = nationalSummary.totalPopulation > 0 ? (nationalSummary.totalBolsaFamilia / nationalSummary.totalPopulation) * 100 : 0;
        const pctWorkersPop = nationalSummary.totalPopulation > 0 ? (nationalSummary.totalFormalWorkers / nationalSummary.totalPopulation) * 100 : 0;
        return (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <SummaryCard title="População" value={nationalSummary.totalPopulation > 0 ? nationalSummary.totalPopulation.toLocaleString("pt-BR") : "—"} subtitle="Total nacional" accent="white" />
            <SummaryCard title="Beneficiários Bolsa Família" value={nationalSummary.totalBolsaFamilia.toLocaleString("pt-BR")} subtitle={pctBfPop > 0 ? `${pctBfPop.toFixed(1)}% da população` : "Total nacional"} accent="white" />
            <SummaryCard title="Trabalhadores Formais" value={nationalSummary.totalFormalWorkers.toLocaleString("pt-BR")} subtitle={pctWorkersPop > 0 ? `${pctWorkersPop.toFixed(1)}% da população` : "Total nacional"} accent="white" />
            <SummaryCard
              title="Bolsa Família vs Trabalhadores Formais"
              value={formatRatioPercent(nationalSummary.ratio)}
              subtitle={ratioLabel(nationalSummary.ratio)}
              accent={nationalSummary.ratio >= 1 ? "red" : nationalSummary.ratio >= 0.5 ? "amber" : "green"}
            />
            <SummaryCard title="% População no Bolsa Família" value={pctBfPop > 0 ? `${pctBfPop.toFixed(1)}%` : "—"} subtitle={pctBfPop >= 15 ? "Nível crítico" : pctBfPop >= 8 ? "Nível alto" : "Nível moderado"} accent={pctBfPop >= 15 ? "red" : pctBfPop >= 8 ? "amber" : "green"} />
            <SummaryCard title="% População Trabalhando" value={pctWorkersPop > 0 ? `${pctWorkersPop.toFixed(1)}%` : "—"} subtitle={pctWorkersPop >= 40 ? "Alta formalização" : pctWorkersPop >= 25 ? "Moderada" : "Baixa formalização"} accent={pctWorkersPop >= 40 ? "green" : pctWorkersPop >= 25 ? "amber" : "red"} />
          </div>
        );
      })()}

      {/* Map + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-slate-900/50 rounded-2xl border border-slate-800 p-3 sm:p-6">
          {!selectedStateId && !nudgeDismissed.step1 && (
            <div className="flex justify-center mb-3 animate-bubble-in">
              <div className="animate-gentle-bounce">
                <div className="relative bg-amber-500 text-slate-950 text-xs font-semibold px-4 py-2 rounded-full shadow-lg shadow-amber-500/20">
                  <span className="mr-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-950/20 text-[10px] font-bold">1</span>
                  Clique em um estado no mapa
                  <svg className="absolute -bottom-2 left-1/2 -translate-x-1/2" width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M6 8L0 0H12L6 8Z" fill="rgb(245 158 11)" />
                  </svg>
                </div>
              </div>
            </div>
          )}
          <BrazilMap
            statesByRegion={statesByRegion}
            selectedStateId={selectedStateId}
            onStateClick={handleStateClick}
          />
        </div>

        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-3 sm:p-6">
            <MapLegend />
          </div>

          {selectedState ? (
            <TopRankings
              className="flex-1 min-h-0"
              allStates={allStates}
              allMunicipalities={municipalitiesByState}
              selectedRegionId={selectedRegionId}
              selectedStateId={selectedStateId}
            />
          ) : (
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-3 sm:p-6">
              <StatesSidebar
                states={allStates}
                onStateClick={handleStateClick}
              />
            </div>
          )}
        </div>
      </div>

      {/* Economic impact alert */}
      <EconomicImpactAlert
        bolsaFamiliaRecipients={summaryTarget ? summaryTarget.bolsaFamiliaRecipients : nationalSummary.totalBolsaFamilia}
      />

    </>
  );
}

function CitySelector({
  municipalities,
  selectedMunicipalityId,
  stateName,
  onSelect,
  onClear,
  showNudge,
}: {
  municipalities: MunicipalityData[];
  selectedMunicipalityId: string | null;
  stateName: string;
  onSelect: (id: string | null) => void;
  onClear: () => void;
  showNudge: boolean;
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const sorted = [...municipalities].sort((a, b) => a.name.localeCompare(b.name));
  const normalize = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const filtered = search
    ? sorted.filter((m) => normalize(m.name).includes(normalize(search)))
    : sorted;

  const selectedMun = selectedMunicipalityId
    ? municipalities.find((m) => m.id === selectedMunicipalityId)
    : null;

  function handleSelect(id: string) {
    onSelect(id);
    setSearch("");
    setIsOpen(false);
  }

  return (
    <div className="relative bg-slate-900/50 rounded-2xl border border-slate-800 p-3 sm:p-4 animate-fade-in overflow-visible">
      {showNudge && !selectedMunicipalityId && !isOpen && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bubble-in z-10">
          <div className="animate-gentle-bounce">
            <div className="relative bg-amber-500 text-slate-950 text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg shadow-amber-500/20 whitespace-nowrap">
              <span className="mr-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-950/20 text-[10px] font-bold">2</span>
              Agora escolha um município
              <svg className="absolute -bottom-2 left-1/2 -translate-x-1/2" width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M6 8L0 0H12L6 8Z" fill="rgb(245 158 11)" />
              </svg>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <label className="text-sm font-medium text-slate-300 whitespace-nowrap">
          Município em {stateName}
          <span className="text-slate-500 ml-1">({municipalities.length})</span>:
        </label>
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={isOpen ? search : selectedMun ? selectedMun.name : search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              setSearch("");
              setIsOpen(true);
            }}
            placeholder="Buscar município..."
            className={`w-full bg-slate-800 border text-white rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-colors placeholder:text-slate-500 ${
              selectedMun && !isOpen ? "border-amber-400/30" : "border-slate-700"
            }`}
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute z-50 top-full mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-2xl max-h-64 overflow-y-auto custom-scrollbar">
                {filtered.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-slate-500">
                    Nenhum município encontrado
                  </div>
                ) : (
                  filtered.slice(0, 100).map((mun) => (
                    <button
                      key={mun.id}
                      onClick={() => handleSelect(mun.id)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-slate-700/50 transition-colors cursor-pointer flex items-center justify-between gap-2"
                    >
                      <span className="text-slate-200 truncate">{mun.name}</span>
                      <span className="text-amber-400/70 text-xs tabular-nums shrink-0">
                        {mun.bolsaFamiliaRecipients.toLocaleString("pt-BR")}
                      </span>
                    </button>
                  ))
                )}
                {filtered.length > 100 && (
                  <div className="px-4 py-2 text-xs text-slate-500 border-t border-slate-700">
                    Mostrando 100 de {filtered.length} — digite para filtrar
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <button
          onClick={() => {
            setSearch("");
            setIsOpen(false);
            onClear();
          }}
          className="shrink-0 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer px-3 py-2.5 rounded-lg hover:bg-slate-800 border border-slate-700"
        >
          Limpar
        </button>
      </div>
    </div>
  );
}

function StatesSidebar({
  states,
  onStateClick,
}: {
  states: StateData[];
  onStateClick: (stateId: string, regionId: string) => void;
}) {
  const [activeMetric, setActiveMetric] = useState<"count" | "ratio">("count");

  const sorted = activeMetric === "count"
    ? [...states].sort((a, b) => b.bolsaFamiliaRecipients - a.bolsaFamiliaRecipients)
    : [...states].sort((a, b) => b.ratio - a.ratio);

  return (
    <>
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
        Estados — Brasil
      </h3>

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

      <div className="divide-y divide-slate-800/50 max-h-[500px] overflow-y-auto custom-scrollbar pr-4">
        {sorted.map((state, i) => (
          <button
            key={state.id}
            onClick={() => onStateClick(state.id, state.regionId)}
            className="flex items-center text-sm py-2 w-full text-left hover:bg-slate-800/50 transition-colors cursor-pointer"
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
                  {formatCompact(state.bolsaFamiliaRecipients)}
                </span>
                <span className="w-20 text-right text-blue-400 tabular-nums text-xs">
                  {formatCompact(state.formalWorkers)}
                </span>
              </>
            ) : (
              <span className="w-32 flex justify-end">
                <span className="tabular-nums text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: getColorForRatio(state.ratio), backgroundColor: `${getColorForRatio(state.ratio)}18` }}>
                  {(state.ratio * 100).toFixed(0)}%
                </span>
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-800 flex gap-4 text-xs text-slate-500">
        <span><span className="text-amber-400">BF</span> = Bolsa Família</span>
        <span><span className="text-blue-400">Trab.</span> = Trabalhadores</span>
      </div>
    </>
  );
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toLocaleString("pt-BR");
}


const AVG_BF_MONTHLY = 680;
const MINIMUM_WAGE = 1621;
const INSS_RATE = 0.075; // 7.5% for minimum wage earners
const FGTS_RATE = 0.08; // 8% employer contribution
const INSS_PATRONAL_RATE = 0.20; // 20% employer INSS

function EconomicImpactAlert({ bolsaFamiliaRecipients }: { bolsaFamiliaRecipients: number }) {
  // Cost to the state
  const monthlyCostBF = bolsaFamiliaRecipients * AVG_BF_MONTHLY;
  const yearlyCostBF = monthlyCostBF * 12;

  // If working at minimum wage
  const monthlyIfWorking = bolsaFamiliaRecipients * MINIMUM_WAGE;

  // Taxes they WOULD pay (INSS worker contribution)
  const monthlyINSS = bolsaFamiliaRecipients * MINIMUM_WAGE * INSS_RATE;
  const yearlyINSS = monthlyINSS * 12;

  // Employer contributions (FGTS + INSS Patronal)
  const monthlyFGTS = bolsaFamiliaRecipients * MINIMUM_WAGE * FGTS_RATE;
  const monthlyINSSPatronal = bolsaFamiliaRecipients * MINIMUM_WAGE * INSS_PATRONAL_RATE;
  const monthlyEmployerContrib = monthlyFGTS + monthlyINSSPatronal;
  const yearlyEmployerContrib = monthlyEmployerContrib * 12;

  // Total tax revenue (worker + employer)
  const monthlyTotalTax = monthlyINSS + monthlyEmployerContrib;
  const yearlyTotalTax = monthlyTotalTax * 12;

  // The swing: instead of PAYING BF, the state would RECEIVE taxes
  const monthlySwing = monthlyCostBF + monthlyTotalTax;
  const yearlySwing = monthlySwing * 12;

  const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
    <div className="lg:col-span-2 bg-red-900/10 border border-red-800/30 rounded-2xl p-4 sm:p-5 space-y-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 className="text-sm font-semibold text-red-300">Imposto Negativo — O Custo Real do Bolsa Família</h3>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed">
        Cada beneficiário do Bolsa Família recebe em média <span className="text-red-400 font-semibold">{fmt(AVG_BF_MONTHLY)}/mês</span> do
        governo. Isso significa que o estado gasta <span className="text-red-400 font-semibold">{fmt(monthlyCostBF)}/mês</span> ({fmt(yearlyCostBF)}/ano) apenas para manter esses beneficiários.
        Esse dinheiro sai dos impostos pagos pelos trabalhadores formais.
      </p>

      <p className="text-sm text-slate-300 leading-relaxed">
        Se essas mesmas pessoas estivessem trabalhando com salário mínimo ({fmt(MINIMUM_WAGE)}), cada uma contribuiria com <span className="text-emerald-400 font-medium">{fmt(MINIMUM_WAGE * INSS_RATE)}/mês em INSS</span> (7,5%).
        Somado à contribuição do empregador (20% INSS Patronal + 8% FGTS), cada trabalhador geraria <span className="text-emerald-400 font-medium">{fmt(MINIMUM_WAGE * (INSS_RATE + FGTS_RATE + INSS_PATRONAL_RATE))}/mês em tributos</span>.
        No total, seriam <span className="text-emerald-400 font-semibold">{fmt(monthlyTotalTax)}/mês</span> ({fmt(yearlyTotalTax)}/ano) em arrecadação.
      </p>

      <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">O real impacto nas contas públicas</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-slate-400 text-xs">Hoje o estado paga</p>
            <p className="text-red-400 font-bold text-lg tabular-nums">-{fmt(monthlyCostBF)}<span className="text-xs font-normal text-slate-500">/mês</span></p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Se trabalhassem, o estado receberia</p>
            <p className="text-emerald-400 font-bold text-lg tabular-nums">+{fmt(monthlyTotalTax)}<span className="text-xs font-normal text-slate-500">/mês</span></p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Diferença para os cofres públicos</p>
            <p className="text-white font-bold text-lg tabular-nums">{fmt(yearlySwing)}<span className="text-xs font-normal text-slate-500">/ano</span></p>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed">
        Além de ganhar <span className="text-white font-medium">{fmt(MINIMUM_WAGE - AVG_BF_MONTHLY)} a mais por mês</span> do que recebem do Bolsa Família,
        essas pessoas movimentariam a economia local com consumo, e o estado poderia redirecionar os recursos gastos em programas sociais para
        infraestrutura, saúde e educação — gerando um ciclo econômico positivo.
      </p>

      <p className="text-[11px] text-slate-500">
        * Valores estimados. BF médio: {fmt(AVG_BF_MONTHLY)}/mês (abril/2026). Salário mínimo: {fmt(MINIMUM_WAGE)} (2026).
        INSS trabalhador: 7,5%. INSS patronal: 20%. FGTS: 8%. Trabalhadores de salário mínimo são isentos de IRRF.
      </p>
    </div>

    <div className="bg-amber-900/10 border border-amber-800/30 rounded-2xl p-4 sm:p-5 space-y-3 animate-fade-in flex flex-col">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <h3 className="text-sm font-semibold text-amber-300">Bolsa Família Não Tem Crescimento</h3>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed">
        O beneficiário que recebe {fmt(AVG_BF_MONTHLY)} hoje
        vai continuar recebendo o mesmo valor amanhã, no ano que vem e daqui a 10 anos — enquanto o custo de vida só aumenta.
        Não há plano de carreira, promoção, ou aumento por mérito. É uma renda estagnada que mantém famílias presas no mesmo patamar.
      </p>
      <p className="text-sm text-slate-300 leading-relaxed">
        Um trabalhador formal que começa ganhando {fmt(MINIMUM_WAGE)} pode crescer.
        Com experiência, qualificação e tempo de serviço, esse mesmo trabalhador pode dobrar ou triplicar sua renda em poucos anos.
        Além disso, acumula <span className="text-emerald-400 font-medium">FGTS</span>, contribui para
        a <span className="text-emerald-400 font-medium">aposentadoria pelo INSS</span>, tem
        acesso a <span className="text-emerald-400 font-medium">férias remuneradas e 13º salário</span> —
        benefícios que o Bolsa Família nunca vai oferecer.
      </p>
      <p className="text-sm text-amber-400/80 font-semibold mt-auto pt-2 border-t border-amber-800/20">
        O trabalho formal é uma escada. O Bolsa Família é um chão.
      </p>
    </div>
    </div>
  );
}

function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem("bf-welcome-dismissed")) {
      setOpen(true);
    }
  }, []);

  function dismiss() {
    sessionStorage.setItem("bf-welcome-dismissed", "1");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={dismiss} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">Bem-vindo</h2>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            Os dados exibidos neste painel são atualizados diariamente a partir de fontes oficiais do governo federal:
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 bg-slate-800/50 rounded-xl p-3">
              <span className="text-amber-400 text-lg leading-none mt-0.5">1</span>
              <div>
                <p className="text-sm font-medium text-white">Portal da Transparência</p>
                <p className="text-xs text-slate-400">Dados de beneficiários do Bolsa Família e valores pagos pelo governo federal.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-slate-800/50 rounded-xl p-3">
              <span className="text-amber-400 text-lg leading-none mt-0.5">2</span>
              <div>
                <p className="text-sm font-medium text-white">IBGE (SIDRA)</p>
                <p className="text-xs text-slate-400">Dados populacionais e de trabalhadores formais por estado e município.</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-5">
            Todas as informações são públicas e obtidas via APIs oficiais. Nenhum dado pessoal é coletado ou armazenado.
          </p>

          <button
            onClick={dismiss}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer text-sm"
          >
            Entendi
          </button>
        </div>
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
          "sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700 rounded-t-2xl p-4 pb-6 max-h-[70vh] overflow-y-auto custom-scrollbar animate-slide-up"
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
            label="Beneficiários Bolsa Família"
            value={municipality.bolsaFamiliaRecipients.toLocaleString("pt-BR")}
            color="text-amber-400"
          />
          <Stat
            label="Trabalhadores Formais"
            value={municipality.formalWorkers.toLocaleString("pt-BR")}
            color="text-blue-400"
          />
          <Stat label="Bolsa Família vs Trabalhadores Formais" value={`${(municipality.ratio * 100).toFixed(0)}%`} color={municipality.ratio >= 1 ? "text-red-400" : municipality.ratio >= 0.5 ? "text-amber-400" : "text-emerald-400"} />
          <Stat
            label="% Pop. no Bolsa Família"
            value={`${bfPercentOfPopulation}%`}
            color="text-amber-400"
          />
        </div>
      </div>

      {/* Desktop: inline panel */}
      <div className="hidden sm:block bg-slate-900/50 rounded-2xl border border-slate-800 p-4 sm:p-6 relative animate-fade-in">
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
            label="Beneficiários Bolsa Família"
            value={municipality.bolsaFamiliaRecipients.toLocaleString("pt-BR")}
            color="text-amber-400"
          />
          <Stat
            label="Trabalhadores Formais"
            value={municipality.formalWorkers.toLocaleString("pt-BR")}
            color="text-blue-400"
          />
          <Stat label="Bolsa Família vs Trabalhadores Formais" value={`${(municipality.ratio * 100).toFixed(0)}%`} color={municipality.ratio >= 1 ? "text-red-400" : municipality.ratio >= 0.5 ? "text-amber-400" : "text-emerald-400"} />
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
