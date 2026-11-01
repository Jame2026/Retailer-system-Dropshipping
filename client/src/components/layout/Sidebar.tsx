import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  Package,
  ShoppingCart,
  Truck,
  Layers,
  TrendingUp,
  Settings,
  Mail,
  Inbox,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navigationItems = [
    { name: 'Dashboard', path: '/admin', exact: true, icon: LayoutGrid },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Freight', path: '/admin/shipping', icon: Truck },
    { name: 'Sourcing', path: '/admin/sourcing', icon: Layers },
    { name: 'Pricing', path: '/admin/pricing', icon: TrendingUp },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-56 bg-[#F8F9FA] border-r border-[#E5E7EB] flex flex-col justify-between p-4 z-20 select-none">
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
                    ? 'bg-[#D7EFE4] text-[#064E3B] font-bold shadow-2xs'
                    : 'text-[#4B5563] hover:text-[#111827] hover:bg-slate-200/60 font-medium'
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
      <div className="pt-4 pb-2 px-2 text-xs text-[#6B7280] space-y-2 border-t border-[#E5E7EB]">
        <NavLink
          to="/admin/settings"
          className="flex items-center gap-2 hover:text-[#111827] transition-colors font-medium text-[12px]"
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>Order Buffer</span>
        </NavLink>
        <NavLink
          to="/admin/settings"
          className="flex items-center gap-2 hover:text-[#111827] transition-colors font-medium text-[12px]"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Primary Supplier</span>
        </NavLink>
      </div>
    </aside>
  );
};
