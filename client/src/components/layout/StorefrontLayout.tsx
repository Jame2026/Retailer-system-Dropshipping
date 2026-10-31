import React, { createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { StoreHeader } from '../storefront/StoreHeader.js';
import { StoreFooter } from '../storefront/StoreFooter.js';
import { CartDrawer } from '../storefront/CartDrawer.js';

interface StorefrontLayoutContextValue {
  isInsideStorefrontLayout: boolean;
}

export const StorefrontLayoutContext = createContext<StorefrontLayoutContextValue>({
  isInsideStorefrontLayout: false,
});

export const useStorefrontLayout = () => useContext(StorefrontLayoutContext);

export const StorefrontLayout: React.FC = () => {
  return (
    <StorefrontLayoutContext.Provider value={{ isInsideStorefrontLayout: true }}>
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-slate-900">
        <StoreHeader />
        <Outlet />
        <StoreFooter />
        <CartDrawer />
      </div>
    </StorefrontLayoutContext.Provider>
  );
};
