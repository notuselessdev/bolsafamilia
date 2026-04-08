"use client";

import { useState } from "react";
import { StateData } from "@/lib/types/region";
import { getColorForRatio } from "@/lib/data/colors";
import { BRAZIL_STATE_PATHS, BRAZIL_VIEW_BOX } from "./brazil-state-paths";

interface BrazilMapProps {
  statesByRegion: Record<string, StateData[]>;
  selectedStateId: string | null;
  onStateClick: (stateId: string, regionId: string) => void;
}

function handleKeyActivate(callback: () => void) {
  return (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      callback();
    }
  };
}

export function BrazilMap({
  statesByRegion,
  selectedStateId,
  onStateClick,
}: BrazilMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const allStates = new Map<string, StateData>();
  for (const states of Object.values(statesByRegion)) {
    for (const state of states) {
      allStates.set(state.id, state);
    }
  }

  return (
    <div className="relative w-full">
      <svg
        viewBox={BRAZIL_VIEW_BOX}
        className="w-full h-auto touch-manipulation"
        role="img"
        aria-label="Mapa do Brasil por estados"
      >
        {BRAZIL_STATE_PATHS.map(({ id, d, labelX, labelY, abbreviation, regionId }) => {
          const state = allStates.get(id);
          if (!state) return null;
          const isHovered = hoveredId === id;
          const isSelected = selectedStateId === id;
          const isDimmed = selectedStateId !== null && !isSelected && !isHovered;

          return (
            <g
              key={id}
              role="button"
              tabIndex={0}
              aria-label={`${state.name} (${abbreviation}): ${(state.ratio * 100).toFixed(0)}% BF por trabalhador, ${state.bolsaFamiliaRecipients.toLocaleString("pt-BR")} beneficiários BF, ${state.formalWorkers.toLocaleString("pt-BR")} trabalhadores`}
              onFocus={() => setHoveredId(id)}
              onBlur={() => setHoveredId(null)}
              onKeyDown={handleKeyActivate(() => onStateClick(id, regionId))}
              className="outline-none focus-visible:outline-2 focus-visible:outline-amber-400"
            >
              <path
                d={d}
                fill={getColorForRatio(state.ratio)}
                stroke={isSelected ? "#fbbf24" : "#0f172a"}
                strokeWidth={isSelected ? 2.5 : isHovered ? 1.8 : 0.8}
                opacity={isDimmed ? 0.35 : isHovered || isSelected ? 1 : 0.85}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredId(id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onStateClick(id, regionId)}
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#fff"
                fontSize="8"
                fontWeight="600"
                opacity={isDimmed ? 0.3 : 1}
                className="pointer-events-none select-none transition-opacity duration-300"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
              >
                {abbreviation}
              </text>
            </g>
          );
        })}
      </svg>

      {hoveredId && !selectedStateId && allStates.has(hoveredId) && (
        <Tooltip
          name={allStates.get(hoveredId)!.name}
          bolsaFamilia={allStates.get(hoveredId)!.bolsaFamiliaRecipients}
          workers={allStates.get(hoveredId)!.formalWorkers}
          ratio={allStates.get(hoveredId)!.ratio}
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
    <div
      role="tooltip"
      className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-xl p-3 sm:p-4 min-w-[180px] sm:min-w-[220px] shadow-2xl"
    >
      <h3 className="text-white font-semibold text-sm sm:text-lg mb-1.5 sm:mb-2">{name}</h3>
      <div className="space-y-1 sm:space-y-1.5 text-xs sm:text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-slate-400">Bolsa Família</span>
          <span className="text-amber-400 font-medium">
            {bolsaFamilia.toLocaleString("pt-BR")}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-400">Trabalhadores</span>
          <span className="text-blue-400 font-medium">
            {workers.toLocaleString("pt-BR")}
          </span>
        </div>
        <div className="border-t border-slate-600 pt-1 sm:pt-1.5 flex justify-between gap-3">
          <span className="text-slate-400">BF/Trabalhador</span>
          <span className="font-semibold" style={{ color: getColorForRatio(ratio) }}>
            {(ratio * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}
