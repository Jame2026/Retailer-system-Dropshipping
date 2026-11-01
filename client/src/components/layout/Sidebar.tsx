import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  Package,
  ShoppingCart,
  Truck,
  Layers,
  Sparkles,
  Settings,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navigationItems = [
    { name: 'Dashboard', path: '/admin', exact: true, icon: LayoutGrid },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Freight', path: '/admin/shipping', icon: Truck },
    { name: 'Sourcing', path: '/admin/sourcing', icon: Layers },
    { name: 'Pricing', path: '/admin/pricing', icon: Sparkles },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-56 bg-[#F4EFE6] border-r border-[#E8E2D6]/70 flex flex-col justify-between p-4 z-20 select-none">
      <nav className="space-y-1.5 pt-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-[#E5DFD3] text-[#1F1C18] font-bold shadow-2xs'
                    : 'text-[#6B655B] hover:text-[#1F1C18] hover:bg-[#ECE5D9]/60 font-medium'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom links */}
      <div className="pt-4 pb-2 px-3 text-xs text-[#857E74] space-y-1.5 border-t border-[#E8E2D6]/60">
        <NavLink
          to="/admin/settings"
          className="block hover:text-[#1F1C18] transition-colors font-medium text-[12px]"
        >
          Order Buffer
        </NavLink>
        <NavLink
          to="/admin/settings"
          className="block hover:text-[#1F1C18] transition-colors font-medium text-[12px]"
        >
          Primary Supplier
        </NavLink>
      </div>
    </aside>
  );
};
