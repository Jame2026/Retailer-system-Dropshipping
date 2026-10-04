import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Layers,
  Calculator,
  Compass,
  Settings,
  Zap,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Orders Queue', path: '/orders', icon: ShoppingCart },
    { name: 'SKU Catalog', path: '/catalog', icon: Layers },
    { name: 'Pricing Rules', path: '/pricing', icon: Calculator },
    { name: '1-Click Sourcing', path: '/sourcing', icon: Compass },
    { name: 'Settings & APIs', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-slate-800/80 bg-[#0B0F17] flex flex-col z-40">
      {/* Brand logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-teal-300 flex items-center justify-center shadow-lg shadow-teal-500/20">
          <Zap className="w-5 h-5 text-slate-950 fill-current" />
        </div>
        <div>
          <h1 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
            DROPSHIP <span className="text-teal-400 font-semibold">CORE</span>
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Automation Engine</p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Management
        </div>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30 shadow-sm shadow-teal-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Status Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 m-3 rounded-2xl">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium">Hold Buffer</span>
          <span className="text-teal-400 font-bold">6 Hours</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium">Primary Supplier</span>
          <span className="text-slate-200 font-bold">CJ Dropshipping</span>
        </div>
      </div>
    </aside>
  );
};
