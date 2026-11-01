import React, { useState } from 'react';

export interface OverviewSplineChartProps {
  totalRevenue?: number;
  ordersCount?: number;
  avgFulfillmentHours?: number;
}

export const OverviewSplineChart: React.FC<OverviewSplineChartProps> = ({
  totalRevenue = 207.98,
  ordersCount = 2,
  avgFulfillmentHours = 3.6,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ day: string; value: string } | null>(null);

  const points = [
    { x: 95, y: 65, day: 'Wed', value: '$84.20' },
    { x: 190, y: 35, day: 'Fri', value: '$131.48' },
    { x: 275, y: 35, day: 'Today', value: `$${Number(totalRevenue).toFixed(2)}` },
  ];

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-[#111827]">Overview</h3>
        {hoveredPoint ? (
          <span className="text-xs font-semibold text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded-md animate-fade-in">
            {hoveredPoint.day}: {hoveredPoint.value}
          </span>
        ) : (
          <span className="text-[11px] font-medium text-[#6B7280]">
            {ordersCount} Orders Processed
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 mb-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-extrabold text-[#111827] font-mono tracking-tight">
            ${Number(totalRevenue).toFixed(2)}
          </span>
          <span className="text-xs font-semibold text-[#15803D]">
            Total Sales ↑
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs font-bold text-[#6B7280] font-mono">
            {avgFulfillmentHours}h
          </span>
          <span className="text-[11px] text-[#6B7280]">
            Avg. Fulfillment ↓
          </span>
        </div>
      </div>

      {/* Smooth Spline Chart */}
      <div className="w-full h-28 relative">
        <svg
          className="w-full h-full overflow-visible"
          viewBox="0 0 320 120"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#15803D" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#15803D" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Translucent area fill under emerald line */}
          <path
            d="M 10 95 C 40 20, 65 110, 95 65 C 125 20, 155 100, 190 35 C 220 -5, 245 75, 275 35 C 295 15, 310 40, 315 45 L 315 120 L 10 120 Z"
            fill="url(#emeraldGrad)"
          />

          {/* Emerald Main Curve */}
          <path
            d="M 10 95 C 40 20, 65 110, 95 65 C 125 20, 155 100, 190 35 C 220 -5, 245 75, 275 35 C 295 15, 310 40, 315 45"
            fill="none"
            stroke="#15803D"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {/* Ochre/Tan Secondary Curve */}
          <path
            d="M 10 110 C 45 115, 80 85, 120 90 C 155 95, 185 60, 220 70 C 250 80, 280 40, 315 50"
            fill="none"
            stroke="#C59B58"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray="4 2"
          />

          {/* Interactive Nodes */}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint?.day === pt.day ? '5' : '3.5'}
              fill={hoveredPoint?.day === pt.day ? '#15803D' : '#FFFFFF'}
              stroke="#15803D"
              strokeWidth="2.5"
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoveredPoint({ day: pt.day, value: pt.value })}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>
      </div>

      {/* Day Axis */}
      <div className="flex justify-between items-center text-[10px] font-semibold text-[#9CA3AF] px-2 pt-2 border-t border-slate-100 mt-1 select-none">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span className="text-[#15803D] font-bold">Today</span>
      </div>
    </div>
  );
};
