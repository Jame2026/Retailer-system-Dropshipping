import React from 'react';

export const OverviewSplineChart: React.FC = () => {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 shadow-xs">
      <h3 className="text-sm font-bold text-[#111827] mb-2">Overview</h3>
      <div className="flex items-center gap-3 text-xs font-semibold mb-3">
        <span className="text-[#15803D] flex items-center gap-0.5">
          Total Sales <span className="text-[10px]">↑ ↑</span>
        </span>
        <span className="text-[#6B7280] flex items-center gap-0.5">
          Avg. Fulfillment Time <span className="text-[10px]">↓</span>
        </span>
      </div>

      {/* Smooth Spline Chart */}
      <div className="w-full h-32 relative">
        <svg
          className="w-full h-full overflow-visible"
          viewBox="0 0 320 120"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#15803D" stopOpacity="0.22" />
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
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Hollow nodes on Emerald Curve */}
          <circle cx="95" cy="65" r="3.5" fill="#FFFFFF" stroke="#15803D" strokeWidth="2" />
          <circle cx="190" cy="35" r="3.5" fill="#FFFFFF" stroke="#15803D" strokeWidth="2" />
          <circle cx="275" cy="35" r="3.5" fill="#FFFFFF" stroke="#15803D" strokeWidth="2" />

          {/* Ochre/Tan Secondary Curve */}
          <path
            d="M 10 110 C 45 115, 80 85, 120 90 C 155 95, 185 60, 220 70 C 250 80, 280 40, 315 50"
            fill="none"
            stroke="#C59B58"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Hollow nodes on Ochre Curve */}
          <circle cx="120" cy="90" r="3" fill="#FFFFFF" stroke="#C59B58" strokeWidth="1.8" />
          <circle cx="220" cy="70" r="3" fill="#FFFFFF" stroke="#C59B58" strokeWidth="1.8" />
          <circle cx="280" cy="50" r="3" fill="#FFFFFF" stroke="#C59B58" strokeWidth="1.8" />
        </svg>
      </div>
    </div>
  );
};

