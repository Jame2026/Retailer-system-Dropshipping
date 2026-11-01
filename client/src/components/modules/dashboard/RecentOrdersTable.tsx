import React from 'react';
import { ArrowUpDown, RotateCcw } from 'lucide-react';
import { DashboardRow } from './dashboard.types.js';

export interface RecentOrdersTableProps {
  rows: DashboardRow[];
  onActionClick: (row: DashboardRow) => void;
}

export const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({
  rows,
  onActionClick,
}) => {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 md:p-6 shadow-xs h-full flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-[#111827] mb-4">Recent Orders</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E5E7EB] text-xs font-bold text-[#111827]">
              <th className="py-2.5 pr-2 font-bold flex items-center gap-1">
                <span>Order</span>
                <ArrowUpDown className="w-3 h-3 text-[#6B7280]" />
              </th>
              <th className="py-2.5 px-3 font-bold">Customer</th>
              <th className="py-2.5 px-2 font-bold w-16"></th>
              <th className="py-2.5 px-3 font-bold">Status</th>
              <th className="py-2.5 px-3 font-bold">Total</th>
              <th className="py-2.5 pl-3 pr-1 text-right font-bold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6] text-sm">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                {/* Order */}
                <td className="py-3.5 pr-2 font-medium text-[#6B7280] text-xs font-mono">
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
                  {row.status === 'Issue' && (
                    <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-[#9CA3AF] text-white shadow-2xs">
                      Issue
                    </span>
                  )}
                  {row.status === 'Shipped' && (
                    <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-[#15803D] text-white shadow-2xs">
                      Shipped
                    </span>
                  )}
                  {row.status === 'Failed' && (
                    <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-[#6B7280] text-white shadow-2xs">
                      Failed
                    </span>
                  )}
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
                    className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold border border-[#E5E7EB] bg-[#F9FAFB] hover:bg-[#F3F4F6] text-[#374151] shadow-2xs transition-all cursor-pointer"
                  >
                    {row.action === 'Retry' ? (
                      <>
                        <RotateCcw className="w-3 h-3 text-[#4B5563] mr-1" />
                        <span>Retry</span>
                      </>
                    ) : (
                      <span>Resolve</span>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
};

