import React, { useState } from 'react';

interface MonthlyData {
  month: string;
  received: number; // Kelib tushgan
  processed: number; // Ko'rib chiqilgan
}

const data12Months: MonthlyData[] = [
  { month: 'Noy', received: 1400, processed: 1350 },
  { month: 'Dek', received: 1550, processed: 1480 },
  { month: 'Yan', received: 1680, processed: 1590 },
  { month: 'Fev', received: 1650, processed: 1620 },
  { month: 'Mar', received: 1780, processed: 1710 },
  { month: 'Apr', received: 1850, processed: 1800 },
  { month: 'May', received: 1880, processed: 1850 },
  { month: 'Iyun', received: 1950, processed: 1890 },
  { month: 'Iyul', received: 2020, processed: 1980 },
  { month: 'Avg', received: 1980, processed: 2010 },
  { month: 'Sen', received: 2110, processed: 2060 },
  { month: 'Okt', received: 2230, processed: 2160 },
];

export const ApplicationsTrendChart: React.FC = () => {
  const [period, setPeriod] = useState<'6' | '12'>('12');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(2); // Default hover on 'Yan' like in screenshot!

  const currentData = period === '6' ? data12Months.slice(6) : data12Months;

  // SVG Chart Dimensions
  const width = 640;
  const height = 240;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const maxY = 2500;

  const getX = (index: number) => paddingLeft + (index / (currentData.length - 1)) * chartWidth;
  const getY = (val: number) => paddingTop + chartHeight - (val / maxY) * chartHeight;

  // Generate smooth SVG path (Cubic Bezier curve)
  const generatePath = (getter: (d: MonthlyData) => number) => {
    const points = currentData.map((d, i) => [getX(i), getY(getter(d))]);
    let path = `M ${points[0][0]},${points[0][1]}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
      const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
      const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
      const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
    }
    return path;
  };

  const pathReceived = generatePath(d => d.received);
  const pathProcessed = generatePath(d => d.processed);

  const activePoint = hoveredIndex !== null && hoveredIndex < currentData.length ? currentData[hoveredIndex] : null;

  return (
    <div className="relative w-full">
      {/* Top Header of Chart */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Arizalar dinamikasi</h3>
          <div className="flex items-center space-x-5 text-xs mt-1.5 font-medium">
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-[2.5px] bg-[#2563eb] rounded-full inline-block"></span>
              <span className="text-slate-600">Kelib tushgan</span>
              <strong className="text-slate-900 font-bold ml-1">2 230</strong>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-[2.5px] bg-[#f97316] rounded-full inline-block"></span>
              <span className="text-slate-600">Ko'rib chiqilgan</span>
              <strong className="text-slate-900 font-bold ml-1">2 160</strong>
            </div>
          </div>
        </div>

        {/* 6 oy / 12 oy switch */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setPeriod('6')}
            className={`px-3 py-1 rounded-md transition-all ${
              period === '6' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            6 oy
          </button>
          <button
            onClick={() => setPeriod('12')}
            className={`px-3 py-1 rounded-md transition-all ${
              period === '12' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            12 oy
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative overflow-visible">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines & Y Axis labels */}
          {[0, 500, 1000, 1500, 2000, 2500].map(val => {
            const y = getY(val);
            const label = val === 0 ? '0' : val >= 1000 ? `${val / 1000}K`.replace('.', ',') : `${val}`;
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1.5"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="11"
                  fontFamily="sans-serif"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Area under Received line */}
          <path
            d={`${pathReceived} L ${getX(currentData.length - 1)},${getY(0)} L ${getX(0)},${getY(0)} Z`}
            fill="url(#blueGradient)"
          />

          {/* Blue Line: Kelib tushgan */}
          <path
            d={pathReceived}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Orange Line: Ko'rib chiqilgan */}
          <path
            d={pathProcessed}
            fill="none"
            stroke="#f97316"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Vertical Guide Line on Hover */}
          {hoveredIndex !== null && (
            <line
              x1={getX(hoveredIndex)}
              y1={paddingTop}
              x2={getX(hoveredIndex)}
              y2={height - paddingBottom}
              stroke="#cbd5e1"
              strokeDasharray="3 3"
              strokeWidth="1.5"
            />
          )}

          {/* Data Points on Hover */}
          {hoveredIndex !== null && activePoint && (
            <>
              <circle
                cx={getX(hoveredIndex)}
                cy={getY(activePoint.received)}
                r="5"
                fill="#2563eb"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <circle
                cx={getX(hoveredIndex)}
                cy={getY(activePoint.processed)}
                r="5"
                fill="#f97316"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </>
          )}

          {/* X Axis Labels */}
          {currentData.map((d, i) => (
            <g key={d.month}>
              <text
                x={getX(i)}
                y={height - paddingBottom + 20}
                textAnchor="middle"
                fill="#64748b"
                fontSize="11"
                fontWeight={hoveredIndex === i ? 'bold' : 'normal'}
                fontFamily="sans-serif"
              >
                {d.month}
              </text>

              {/* Invisible overlay area for hovering */}
              <rect
                x={getX(i) - chartWidth / (currentData.length * 2)}
                y={paddingTop}
                width={chartWidth / currentData.length}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
              />
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Box */}
        {activePoint && hoveredIndex !== null && (
          <div
            className="absolute z-20 pointer-events-none bg-white rounded-xl shadow-xl border border-slate-100 p-3 text-xs -translate-x-1/2 -translate-y-full transition-all duration-150"
            style={{
              left: `${(getX(hoveredIndex) / width) * 100}%`,
              top: '42%',
            }}
          >
            <div className="font-bold text-slate-800 text-[13px] mb-1.5">{activePoint.month}</div>
            <div className="space-y-1.5 min-w-[150px]">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2563eb] inline-block"></span>
                  <span>Kelib tushgan</span>
                </span>
                <span className="font-bold text-slate-900 font-mono">
                  {activePoint.received.toLocaleString('uz-UZ')} ta
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#f97316] inline-block"></span>
                  <span>Ko'rib chiqilgan</span>
                </span>
                <span className="font-bold text-slate-900 font-mono">
                  {activePoint.processed.toLocaleString('uz-UZ')} ta
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
