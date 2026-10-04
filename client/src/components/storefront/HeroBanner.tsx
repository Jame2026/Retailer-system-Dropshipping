import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500 p-8 sm:p-14 text-white shadow-2xl flex flex-col justify-center min-h-[300px]">
      {/* Decorative Glow Circles */}
      <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-pink-400/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute left-1/3 -top-10 w-60 h-60 bg-blue-400/20 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 max-w-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white border border-white/30">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>New Summer 2026 Collection</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-none uppercase drop-shadow-sm font-sans">
          GREAT BANNER
        </h2>

        <p className="text-sm sm:text-base text-white/90 font-medium">
          Premium trending fashion, waterproof bags, and minimalist watches fulfilled with automated 6-hour safety checks.
        </p>

        <div className="pt-2 flex items-center gap-4">
          <NavLink
            to="/shop"
            className="px-6 py-3 bg-white text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all shadow-xl hover:scale-105 inline-flex items-center gap-2"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4" />
          </NavLink>
        </div>
      </div>
    </div>
  );
};
