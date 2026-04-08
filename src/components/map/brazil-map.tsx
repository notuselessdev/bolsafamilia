"use client";

import { useState } from "react";
import { RegionData, StateData, MunicipalityData } from "@/lib/types/region";
import { getColorForRatio } from "@/lib/data/colors";
import { REGION_PATHS } from "./region-paths";
import { REGION_STATE_PATHS } from "./state-paths";
import { getStateMunicipalityPaths } from "./municipality-paths";

type ViewLevel = "national" | "region" | "state";

interface BrazilMapProps {
  regions: RegionData[];
  statesByRegion: Record<string, StateData[]>;
  municipalitiesByState: Record<string, MunicipalityData[]>;
  selectedRegion: RegionData | null;
  selectedState: StateData | null;
  onRegionClick: (regionId: string) => void;
  onStateClick: (stateId: string) => void;
  onMunicipalityClick: (municipalityId: string) => void;
}

export function BrazilMap({
  regions,
  statesByRegion,
  municipalitiesByState,
  selectedRegion,
  selectedState,
  onRegionClick,
  onStateClick,
  onMunicipalityClick,
}: BrazilMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const viewLevel: ViewLevel = selectedState
    ? "state"
    : selectedRegion
      ? "region"
      : "national";

  if (viewLevel === "state" && selectedState) {
    const municipalities = municipalitiesByState[selectedState.id] || [];
    return (
      <MunicipalityDetailMap
        state={selectedState}
        municipalities={municipalities}
        hoveredId={hoveredId}
        onHover={setHoveredId}
        onMunicipalityClick={onMunicipalityClick}
      />
    );
  }

  if (viewLevel === "region" && selectedRegion) {
    return (
      <RegionDetailMap
        region={selectedRegion}
        states={statesByRegion[selectedRegion.id] || []}
        hoveredId={hoveredId}
        onHover={setHoveredId}
        onStateClick={onStateClick}
      />
    );
  }

  const regionMap = new Map(regions.map((r) => [r.id, r]));

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 800 750"
        className="w-full h-auto"
        role="img"
        aria-label="Mapa do Brasil por regiões"
      >
        {REGION_PATHS.map(({ id, d, labelX, labelY }) => {
          const region = regionMap.get(id);
          if (!region) return null;
          const isHovered = hoveredId === id;

          return (
            <g key={id}>
              <path
                d={d}
                fill={getColorForRatio(region.ratio)}
                stroke="#0f172a"
                strokeWidth={isHovered ? 2.5 : 1.5}
                opacity={isHovered ? 1 : 0.85}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredId(id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onRegionClick(id)}
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                fill="#fff"
                fontSize="14"
                fontWeight="600"
                className="pointer-events-none select-none"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
              >
                {region.name}
              </text>
            </g>
          );
        })}
      </svg>

      {hoveredId && regionMap.has(hoveredId) && (
        <Tooltip
          name={regionMap.get(hoveredId)!.name}
          bolsaFamilia={regionMap.get(hoveredId)!.bolsaFamiliaRecipients}
          workers={regionMap.get(hoveredId)!.formalWorkers}
          ratio={regionMap.get(hoveredId)!.ratio}
        />
      )}
    </div>
  );
}

function RegionDetailMap({
  region,
  states,
  hoveredId,
  onHover,
  onStateClick,
}: {
  region: RegionData;
  states: StateData[];
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onStateClick: (stateId: string) => void;
}) {
  const regionPaths = REGION_STATE_PATHS[region.id];
  if (!regionPaths) return null;

  const stateMap = new Map(states.map((s) => [s.id, s]));

  return (
    <div className="relative w-full">
      <svg
        viewBox={regionPaths.viewBox}
        className="w-full h-auto"
        role="img"
        aria-label={`Mapa da região ${region.name}`}
      >
        {regionPaths.paths.map(({ id, d, labelX, labelY, abbreviation }) => {
          const state = stateMap.get(id);
          if (!state) return null;
          const isHovered = hoveredId === id;

          return (
            <g key={id}>
              <path
                d={d}
                fill={getColorForRatio(state.ratio)}
                stroke="#0f172a"
                strokeWidth={isHovered ? 2.5 : 1.5}
                opacity={isHovered ? 1 : 0.85}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => onHover(id)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onStateClick(id)}
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                fill="#fff"
                fontSize="13"
                fontWeight="600"
                className="pointer-events-none select-none"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
              >
                {abbreviation}
              </text>
            </g>
          );
        })}
      </svg>

      {hoveredId && stateMap.has(hoveredId) && (
        <Tooltip
          name={stateMap.get(hoveredId)!.name}
          bolsaFamilia={stateMap.get(hoveredId)!.bolsaFamiliaRecipients}
          workers={stateMap.get(hoveredId)!.formalWorkers}
          ratio={stateMap.get(hoveredId)!.ratio}
        />
      )}
    </div>
  );
}

function MunicipalityDetailMap({
  state,
  municipalities,
  hoveredId,
  onHover,
  onMunicipalityClick,
}: {
  state: StateData;
  municipalities: MunicipalityData[];
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onMunicipalityClick: (municipalityId: string) => void;
}) {
  const pathData = getStateMunicipalityPaths(state.id);
  if (!pathData) return null;

  const munMap = new Map(municipalities.map((m) => [m.id, m]));

  return (
    <div className="relative w-full">
      <svg
        viewBox={pathData.viewBox}
        className="w-full h-auto"
        role="img"
        aria-label={`Mapa dos municípios de ${state.name}`}
      >
        {pathData.paths.map(({ id, d, labelX, labelY }) => {
          const mun = munMap.get(id);
          if (!mun) return null;
          const isHovered = hoveredId === id;

          // Extract short name for label (first word or abbreviation for long names)
          const shortName =
            mun.name.length > 12
              ? mun.name.split(" ")[0]
              : mun.name;

          return (
            <g key={id}>
              <path
                d={d}
                fill={getColorForRatio(mun.ratio)}
                stroke="#0f172a"
                strokeWidth={isHovered ? 2.5 : 1.5}
                opacity={isHovered ? 1 : 0.85}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => onHover(id)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onMunicipalityClick(id)}
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                fill="#fff"
                fontSize="11"
                fontWeight="500"
                className="pointer-events-none select-none"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
              >
                {shortName}
              </text>
            </g>
          );
        })}
      </svg>

      {hoveredId && munMap.has(hoveredId) && (
        <Tooltip
          name={munMap.get(hoveredId)!.name}
          bolsaFamilia={munMap.get(hoveredId)!.bolsaFamiliaRecipients}
          workers={munMap.get(hoveredId)!.formalWorkers}
          ratio={munMap.get(hoveredId)!.ratio}
        />
      )}
    </div>
  );
}

function Tooltip({
  name,
  bolsaFamilia,
  workers,
  ratio,
}: {
  name: string;
  bolsaFamilia: number;
  workers: number;
  ratio: number;
}) {
  return (
    <div className="absolute top-4 right-4 bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-xl p-4 min-w-[220px] shadow-2xl">
      <h3 className="text-white font-semibold text-lg mb-2">{name}</h3>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Bolsa Família</span>
          <span className="text-amber-400 font-medium">
            {bolsaFamilia.toLocaleString("pt-BR")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Trabalhadores</span>
          <span className="text-blue-400 font-medium">
            {workers.toLocaleString("pt-BR")}
          </span>
        </div>
        <div className="border-t border-slate-600 pt-1.5 flex justify-between">
          <span className="text-slate-400">Razão</span>
          <span className="text-white font-semibold">
            {ratio.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
