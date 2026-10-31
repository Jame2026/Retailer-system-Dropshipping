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
      <div className="min-h-screen bg-[#F8FAFC] flex">
        <Sidebar />
        <div className="flex-1 ml-64 flex flex-col min-w-0">
          <Header />
          <Outlet />
        </div>
      </div>
    </LayoutContext.Provider>
  );
};
