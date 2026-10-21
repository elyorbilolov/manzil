import React, { useState } from 'react';
import regionsData from '../assets/uzbekistan_svg_regions.json';

interface RegionItem {
  name: string;
  code: string;
  count: number;
  countText: string;
  color: string;
  path: string;
  centerX: number;
  centerY: number;
}

interface UzbekistanSvgMapProps {
  onSelectRegion?: (regionName: string) => void;
  selectedRegion?: string | null;
  mode?: 'manzillar' | 'arizalar';
}

export const UzbekistanSvgMap: React.FC<UzbekistanSvgMapProps> = ({
  onSelectRegion,
  selectedRegion,
  mode = 'manzillar',
}) => {
  const [hoveredRegion, setHoveredRegion] = useState<RegionItem | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center select-none"
      onMouseMove={e => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
    >
      <svg
        viewBox="10 10 840 460"
        className="w-full h-auto max-h-[360px] filter drop-shadow-sm transition-all"
      >
        <defs>
          <filter id="regionGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* 14 Real Administrative Regions of Uzbekistan */}
        {regionsData.map((r: RegionItem) => {
          const isSelected = selectedRegion === r.name;
          const isHovered = hoveredRegion?.name === r.name;

          return (
            <path
              key={r.name}
              d={r.path}
              fill={isSelected ? '#0284c7' : r.color}
              stroke="#ffffff"
              strokeWidth={isSelected ? '2.5' : '1.2'}
              strokeLinejoin="round"
              strokeLinecap="round"
              className="cursor-pointer transition-all duration-200 hover:brightness-110"
              style={{
                filter: isHovered || isSelected ? 'url(#regionGlow)' : undefined,
                opacity: hoveredRegion && !isHovered && !isSelected ? 0.85 : 1,
              }}
              onMouseEnter={() => setHoveredRegion(r)}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => onSelectRegion && onSelectRegion(r.name)}
            />
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {hoveredRegion && (
        <div
          className="absolute z-30 pointer-events-none bg-slate-900/95 text-white text-xs px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-700/60 backdrop-blur-sm -translate-x-1/2 -translate-y-full mb-3 transition-opacity"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y - 12}px`,
          }}
        >
          <div className="font-bold text-white text-[13px]">{hoveredRegion.name}</div>
          <div className="text-slate-300 text-[11px] mt-1 flex items-center justify-between gap-4">
            <span>{mode === 'manzillar' ? 'Manzillar soni:' : 'Yangi arizalar:'}</span>
            <span className="font-bold text-blue-400 font-mono text-xs">{hoveredRegion.countText}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center space-x-1">
            <span>👆</span>
            <span>Batafsil ko'rish uchun bosing</span>
          </div>
        </div>
      )}
    </div>
  );
};
