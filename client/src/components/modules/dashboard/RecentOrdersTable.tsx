import React, { useState } from 'react';
import { ArrowUpDown, RotateCcw, Plus } from 'lucide-react';
import { DashboardRow } from './dashboard.types.js';

export interface RecentOrdersTableProps {
  rows: DashboardRow[];
  onActionClick: (row: DashboardRow) => void;
  onSimulateOrder?: () => void;
  isSimulating?: boolean;
  actionLoadingId?: string | null;
}

export const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({
  rows,
  onActionClick,
  onSimulateOrder,
  isSimulating = false,
  actionLoadingId,
}) => {
  const [sortAsc, setSortAsc] = useState(false);

  const sortedRows = [...rows].sort((a, b) => {
    return sortAsc
      ? a.orderNumber.localeCompare(b.orderNumber)
      : b.orderNumber.localeCompare(a.orderNumber);
  });

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 md:p-6 shadow-xs h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#111827]">Recent Orders</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-[#4B5563] font-mono font-semibold">
              {rows.length} active
            </span>
          </div>

          {onSimulateOrder && (
            <button
              type="button"
              onClick={onSimulateOrder}
              disabled={isSimulating}
              className="text-xs font-semibold text-[#15803D] hover:text-[#064E3B] bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title="Inject a real simulated store order to test live dropship dispatch"
            >
              <Plus className="w-3 h-3" />
              <span>{isSimulating ? 'Adding...' : 'Test Order'}</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-xs font-bold text-[#111827]">
                <th
                  onClick={() => setSortAsc(!sortAsc)}
                  className="py-2.5 pr-2 font-bold cursor-pointer select-none group"
                >
                  <span className="inline-flex items-center gap-1">
                    Order
                    <ArrowUpDown className="w-3 h-3 text-[#6B7280] group-hover:text-[#111827]" />
                  </span>
                </th>
                <th className="py-2.5 px-3 font-bold">Customer</th>
                <th className="py-2.5 px-2 font-bold w-16"></th>
                <th className="py-2.5 px-3 font-bold">Status</th>
                <th className="py-2.5 px-3 font-bold">Total</th>
                <th className="py-2.5 pl-3 pr-1 text-right font-bold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6] text-sm">
              {sortedRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#6B7280]">
                    No matching orders found. Try clearing your search query.
                  </td>
                </tr>
              ) : (
                sortedRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Order */}
                    <td className="py-3.5 pr-2 font-semibold text-[#111827] text-xs font-mono">
                      {row.orderNumber}
                    </td>

                    {/* Customer Name */}
                    <td className="py-3.5 px-3 font-semibold text-[#111827] text-sm">
                      {row.customer}
                    </td>

                    {/* Avatar + Country Code */}
                    <td className="py-3.5 px-2">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={row.avatarUrl}
                          alt={row.customer}
                          className="w-6 h-6 rounded-full object-cover shadow-2xs border border-slate-200"
                        />
                        <span className="text-xs text-[#6B7280] font-medium">
                          {row.countryCode}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-3.5 py-1 rounded-full text-xs font-semibold text-white shadow-2xs ${
                          row.status === 'Shipped'
                            ? 'bg-[#15803D]'
                            : row.status === 'Hold'
                              ? 'bg-[#D97706]'
                              : row.status === 'Processing'
                                ? 'bg-[#0284C7]'
                                : row.status === 'Cancelled'
                                  ? 'bg-[#475569]'
                                  : row.status === 'Failed'
                                    ? 'bg-[#DC2626]'
                                    : 'bg-[#9CA3AF]'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-3 font-semibold text-[#111827] text-sm font-mono">
                      {row.total}
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 pl-3 pr-1 text-right">
                      <button
                        type="button"
                        onClick={() => onActionClick(row)}
                        disabled={actionLoadingId === row.id}
                        className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold border border-[#E5E7EB] bg-[#F9FAFB] hover:bg-[#F3F4F6] text-[#374151] shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        {actionLoadingId === row.id ? (
                          <RotateCcw className="w-3 h-3 text-[#4B5563] animate-spin mr-1" />
                        ) : row.action === 'Retry' ? (
                          <RotateCcw className="w-3 h-3 text-[#4B5563] mr-1" />
                        ) : null}
                        <span>
                          {actionLoadingId === row.id ? 'Updating...' : row.action}
                        </span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
