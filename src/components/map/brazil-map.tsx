"use client";

import { useState } from "react";
import { RegionData } from "@/lib/types/region";
import { getColorForRatio } from "@/lib/data/colors";
import { REGION_PATHS } from "./region-paths";

interface BrazilMapProps {
  regions: RegionData[];
}

export function BrazilMap({ regions }: BrazilMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

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
          const isHovered = hoveredRegion === id;

          return (
            <g key={id}>
              <path
                d={d}
                fill={getColorForRatio(region.ratio)}
                stroke="#0f172a"
                strokeWidth={isHovered ? 2.5 : 1.5}
                opacity={isHovered ? 1 : 0.85}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredRegion(id)}
                onMouseLeave={() => setHoveredRegion(null)}
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

      {hoveredRegion && (
        <Tooltip region={regionMap.get(hoveredRegion)!} />
      )}
    </div>
  );
}

function Tooltip({ region }: { region: RegionData }) {
  return (
    <div className="absolute top-4 right-4 bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-xl p-4 min-w-[220px] shadow-2xl">
      <h3 className="text-white font-semibold text-lg mb-2">{region.name}</h3>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Bolsa Fam&iacute;lia</span>
          <span className="text-amber-400 font-medium">
            {formatNumber(region.bolsaFamiliaRecipients)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Trabalhadores</span>
          <span className="text-blue-400 font-medium">
            {formatNumber(region.formalWorkers)}
          </span>
        </div>
        <div className="border-t border-slate-600 pt-1.5 flex justify-between">
          <span className="text-slate-400">Raz&atilde;o</span>
          <span className="text-white font-semibold">
            {region.ratio.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

function formatNumber(n: number): string {
  return n.toLocaleString("pt-BR");
}
