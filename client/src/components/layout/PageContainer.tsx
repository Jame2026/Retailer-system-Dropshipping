import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar.js';
import { Header } from './Header.js';

export interface PageContainerProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  onSyncAll?: () => void;
  isSyncing?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  subtitle,
  action,
  onSyncAll,
  isSyncing,
}) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <Header onSyncAll={onSyncAll} isSyncing={isSyncing} />
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Page Heading Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
              {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
            </div>
            {action && <div className="flex items-center gap-3">{action}</div>}
          </div>

          {/* Page Content */}
          {children}
        </main>
      </div>
    </div>
  );
};
