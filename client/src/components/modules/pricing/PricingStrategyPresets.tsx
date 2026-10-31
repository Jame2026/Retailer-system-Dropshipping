import React from 'react';
import { Rocket, Zap, Gem, Check } from 'lucide-react';

export interface PricingStrategy {
  id: string;
  name: string;
  badge: string;
  multiplier: number;
  buffer: number;
  minMargin: number;
  description: string;
  icon: React.FC<{ className?: string }>;
}

export const PRICING_STRATEGIES: PricingStrategy[] = [
  {
    id: 'standard',
    name: 'Standard Growth',
    badge: 'Recommended',
    multiplier: 2.5,
    buffer: 3.0,
    minMargin: 40.0,
    description: 'Balanced 50–60% margins to cover ad spend and profit.',
    icon: Rocket,
  },
  {
    id: 'volume',
    name: 'High Volume / Scaling',
    badge: 'Competitive',
    multiplier: 1.8,
    buffer: 2.0,
    minMargin: 30.0,
    description: 'Lower prices to drive maximum order volume and market share.',
    icon: Zap,
  },
  {
    id: 'premium',
    name: 'Premium / High Margin',
    badge: 'Max Profit',
    multiplier: 3.2,
    buffer: 5.0,
    minMargin: 55.0,
    description: 'High 65–75% margins for viral TikTok, unique, or niche goods.',
    icon: Gem,
  },
];

interface PricingStrategyPresetsProps {
  currentMultiplier: number;
  currentBuffer: number;
  onApplyStrategy: (strategy: PricingStrategy) => void;
}

export const PricingStrategyPresets: React.FC<PricingStrategyPresetsProps> = ({
  currentMultiplier,
  currentBuffer,
  onApplyStrategy,
}) => {
  return (
    <div className="space-y-2 mb-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
          1-Click Pricing Strategies
        </span>
        <span className="text-[11px] text-slate-500 font-medium">Click to apply standard rules</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PRICING_STRATEGIES.map((strat) => {
          const Icon = strat.icon;
          const isActive = strat.multiplier === currentMultiplier && strat.buffer === currentBuffer;

          return (
            <div
              key={strat.id}
              onClick={() => onApplyStrategy(strat)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                isActive
                  ? 'border-teal-500 bg-teal-50/20 ring-2 ring-teal-500/20 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-teal-600" />
                    <span className="text-xs font-bold text-slate-900">{strat.name}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border ${
                    isActive ? 'bg-teal-100 text-teal-800 border-teal-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {strat.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug mb-2">{strat.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-teal-700">{strat.multiplier}x + ${strat.buffer.toFixed(2)}</span>
                {isActive && <Check className="w-3.5 h-3.5 text-teal-600 font-bold" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
