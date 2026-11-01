import React, { createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.js';
import { Header } from './Header.js';

interface LayoutContextValue {
  isInsideAdminLayout: boolean;
}

export const LayoutContext = createContext<LayoutContextValue>({
  isInsideAdminLayout: false,
});

export const useLayoutContext = () => useContext(LayoutContext);

export const AdminLayout: React.FC = () => {
  return (
    <LayoutContext.Provider value={{ isInsideAdminLayout: true }}>
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col text-[#111827]">
        <Header />
        <div className="flex-1 flex min-w-0">
          <Sidebar />
          <div className="flex-1 ml-56 flex flex-col min-w-0 overflow-x-hidden min-h-[calc(100vh-4rem)]">
            <Outlet />
          </div>
        </div>
      </div>
    </LayoutContext.Provider>
  );
};
