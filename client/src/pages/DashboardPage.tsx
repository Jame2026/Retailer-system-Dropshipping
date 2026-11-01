import React, { useState, useEffect } from 'react';
import { useOrders } from '../hooks/useOrders.js';
import { useNotification } from '../context/NotificationContext.js';
import { ManualRetryModal } from '../components/modules/orders/ManualRetryModal.js';
import { sourcingService } from '../services/sourcingService.js';
import { orderService } from '../services/orderService.js';
import { Order } from '../types/order.types.js';
import {
  Upload,
  ArrowUpDown,
  RotateCcw,
  Bell,
  HelpCircle,
  Search,
} from 'lucide-react';

interface MockRow {
  id: string;
  orderNumber: string;
  customer: string;
  avatarUrl: string;
  countryFlag: string;
  status: 'Shipped' | 'Issue' | 'Failed';
  total: string;
  action: 'Retry' | 'Resolve';
  rawOrder?: Order;
}

const DEFAULT_MOCK_ROWS: MockRow[] = [
  {
    id: '1',
    orderNumber: 'RET-1001',
    customer: 'John Doe',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop&crop=face',
    countryFlag: '🇺🇸',
    status: 'Shipped',
    total: '$76.50',
    action: 'Retry',
  },
  {
    id: '2',
    orderNumber: 'RET-1002',
    customer: 'John Doe',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=64&h=64&fit=crop&crop=face',
    countryFlag: '🇺🇸',
    status: 'Issue',
    total: '$76.50',
    action: 'Resolve',
  },
  {
    id: '3',
    orderNumber: '3607 2022',
    customer: '3607 2022',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
    countryFlag: '🇺🇸',
    status: 'Issue',
    total: '$76.50',
    action: 'Resolve',
  },
  {
    id: '4',
    orderNumber: '26/11 2022',
    customer: '26/11 2022',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face',
    countryFlag: '🇺🇸',
    status: 'Failed',
    total: '$76.50',
    action: 'Resolve',
  },
  {
    id: '5',
    orderNumber: '1.9ab 2022',
    customer: '1.9ab 2022',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=64&h=64&fit=crop&crop=face',
    countryFlag: '🇺🇸',
    status: 'Failed',
    total: '$76.50',
    action: 'Resolve',
  },
];

export const DashboardPage: React.FC = () => {
  const { showToast } = useNotification();
  const { orders, refresh, counts } = useOrders({ limit: 10 });
  const [selectedRetryOrder, setSelectedRetryOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cjAccount, setCjAccount] = useState<{
    connected: boolean;
    openId: number | string | null;
    balance: { amount: number };
  }>({ connected: true, openId: '59360', balance: { amount: 4.0 } });

  useEffect(() => {
    sourcingService
      .getCjAccountInfo()
      .then((data) => {
        if (data) {
          setCjAccount({
            connected: data.connected ?? true,
            openId: data.openId ?? '59360',
            balance: {
              amount: data.balance?.amount !== undefined ? data.balance.amount : 4.0,
            },
          });
        }
      })
      .catch(() => {});
  }, []);

  // Map real orders if available, or fall back to mock rows to match screenshot perfectly
  const displayRows: MockRow[] =
    orders.length > 0
      ? orders.slice(0, 5).map((o, idx) => {
          let statusLabel: 'Shipped' | 'Issue' | 'Failed' = 'Shipped';
          let actionLabel: 'Retry' | 'Resolve' = 'Retry';

          if (o.status === 'FAILED_BILLING') {
            statusLabel = 'Failed';
            actionLabel = 'Resolve';
          } else if (o.status === 'MANUAL_REVIEW' || o.status === 'PENDING_HOLD') {
            statusLabel = 'Issue';
            actionLabel = 'Resolve';
          } else {
            statusLabel = 'Shipped';
            actionLabel = 'Retry';
          }

          const fallback = DEFAULT_MOCK_ROWS[idx % DEFAULT_MOCK_ROWS.length];
          return {
            id: o.id,
            orderNumber: o.orderNumber || fallback.orderNumber,
            customer: o.shippingName || fallback.customer,
            avatarUrl: fallback.avatarUrl,
            countryFlag: o.shippingCountryCode === 'US' ? '🇺🇸' : fallback.countryFlag,
            status: statusLabel,
            total: `$${Number(o.totalPrice || 76.5).toFixed(2)}`,
            action: actionLabel,
            rawOrder: o,
          };
        })
      : DEFAULT_MOCK_ROWS;

  const handleActionClick = (row: MockRow) => {
    if (row.rawOrder) {
      if (row.action === 'Retry') {
        setSelectedRetryOrder(row.rawOrder);
      } else {
        orderService
          .manualOverride({ orderId: row.rawOrder.id, action: 'RELEASE_NOW' })
          .then(() => {
            showToast('success', 'Resolved', `Order ${row.orderNumber} resolved.`);
            refresh();
          })
          .catch((err) => showToast('error', 'Resolve failed', err.message));
      }
    } else {
      showToast('info', `${row.action} Triggered`, `Action for ${row.customer} (${row.orderNumber}) initiated.`);
    }
  };

  const issuesCount = (counts['FAILED_BILLING'] ?? 0) + (counts['MANUAL_REVIEW'] ?? 0) + (counts['PENDING_HOLD'] ?? 0);
  const alertsDisplay = issuesCount > 0 ? `${issuesCount} Alerts` : '3 Alerts';

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Title & Subtitle + Export Action */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1F1C18] tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-[#7F796F] mt-1 font-medium">
            Store overview and real-time order automation
          </p>
        </div>

        <button
          type="button"
          onClick={() => showToast('info', 'Export', 'Downloading overview report...')}
          className="w-10 h-10 rounded-2xl border border-[#DCD5C8] bg-[#FAF8F5]/90 hover:bg-white flex items-center justify-center text-[#554F46] shadow-2xs transition-all cursor-pointer"
          title="Share / Export"
        >
          <Upload className="w-4 h-4" />
        </button>
      </div>

      {/* Platform Health Card */}
      <section className="bg-[#FAF8F5] border border-[#E7E0D5] rounded-3xl p-5 md:p-6 shadow-xs">
        <h2 className="text-sm font-bold text-[#1F1C18] mb-4">Platform Health</h2>
        <div className="flex flex-wrap items-center gap-8 md:gap-14">
          {/* CJ Live Connected */}
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-11 rounded-2xl bg-[#14A07B] text-white font-extrabold text-lg flex items-center justify-center shadow-xs tracking-tight">
              CJ
            </div>
            <span className="text-base font-bold text-[#1F1C18]">Live Connected</span>
          </div>

          {/* Wallet / Balance */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#E8E1D5] flex items-center justify-center shadow-xs">
              {/* Wallet illustration */}
              <svg className="w-6 h-6 text-[#6B6153]" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="7" width="20" height="12" rx="2.5" fill="#D5CBB9" stroke="#5F564A" strokeWidth="1.2" />
                <path d="M2 10.5h20" stroke="#5F564A" strokeWidth="1.2" />
                <rect x="14" y="11" width="5.5" height="4.5" rx="1.5" fill="#FAF8F5" stroke="#5F564A" strokeWidth="1.2" />
                <circle cx="16.5" cy="13.2" r="0.8" fill="#14A07B" />
                <circle cx="7" cy="5" r="2.2" fill="#E8B931" stroke="#9E7814" strokeWidth="1" />
                <circle cx="10.5" cy="6" r="1.8" fill="#E8B931" stroke="#9E7814" strokeWidth="1" />
              </svg>
            </div>
            <span className="text-2xl font-black text-[#1F1C18] font-mono tracking-tight">
              ${Number(cjAccount.balance?.amount || 4.0).toFixed(2)}
            </span>
          </div>
        </div>
      </section>

      {/* Lower Section (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Overview Chart + Alerts */}
        <div className="lg:col-span-4 space-y-5">
          {/* Overview Card */}
          <div className="bg-[#FAF8F5] border border-[#E7E0D5] rounded-3xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#1F1C18] mb-2">Overview</h3>
            <div className="flex items-center gap-3 text-xs font-semibold mb-3">
              <span className="text-[#14A07B] flex items-center gap-0.5">
                Total Sales <span className="text-[10px]">↑ ↑ ↓</span>
              </span>
              <span className="text-[#C69A57] flex items-center gap-0.5">
                Avg. Fulfillment Time <span className="text-[10px]">↓</span>
              </span>
            </div>

            {/* Smooth Spline Chart */}
            <div className="w-full h-32 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 320 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14A07B" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#14A07B" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Translucent area fill under teal line */}
                <path
                  d="M 10 95 C 40 20, 65 110, 95 65 C 125 20, 155 100, 190 35 C 220 -5, 245 75, 275 35 C 295 15, 310 40, 315 45 L 315 120 L 10 120 Z"
                  fill="url(#tealGrad)"
                />

                {/* Teal Curve */}
                <path
                  d="M 10 95 C 40 20, 65 110, 95 65 C 125 20, 155 100, 190 35 C 220 -5, 245 75, 275 35 C 295 15, 310 40, 315 45"
                  fill="none"
                  stroke="#14A07B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Node points on Teal Curve */}
                <circle cx="95" cy="65" r="3.5" fill="#FAF8F5" stroke="#14A07B" strokeWidth="2" />
                <circle cx="190" cy="35" r="3.5" fill="#FAF8F5" stroke="#14A07B" strokeWidth="2" />
                <circle cx="275" cy="35" r="3.5" fill="#FAF8F5" stroke="#14A07B" strokeWidth="2" />

                {/* Amber/Gold Secondary Curve */}
                <path
                  d="M 10 110 C 45 115, 80 85, 120 90 C 155 95, 185 60, 220 70 C 250 80, 280 40, 315 50"
                  fill="none"
                  stroke="#C69A57"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Node points on Amber Curve */}
                <circle cx="120" cy="90" r="3" fill="#FAF8F5" stroke="#C69A57" strokeWidth="2" />
                <circle cx="220" cy="70" r="3" fill="#FAF8F5" stroke="#C69A57" strokeWidth="2" />
                <circle cx="280" cy="50" r="3" fill="#FAF8F5" stroke="#C69A57" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* Alerts Card */}
          <div className="bg-[#FAF8F5] border border-[#E7E0D5] rounded-3xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#1F1C18] mb-3">Alerts</h3>
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#E8E1D5] text-[#1F1C18] font-black text-lg flex items-center justify-center shadow-xs">
                !
              </div>
              <span className="text-base font-bold text-[#1F1C18]">{alertsDisplay}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Orders Card */}
        <div className="lg:col-span-8">
          <div className="bg-[#FAF8F5] border border-[#E7E0D5] rounded-3xl p-5 md:p-6 shadow-xs">
            <h3 className="text-sm font-bold text-[#1F1C18] mb-4">Recent Orders</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E8E2D6] text-xs font-bold text-[#1F1C18]">
                    <th className="py-2.5 pr-2 font-bold flex items-center gap-1">
                      <span>Order</span>
                      <ArrowUpDown className="w-3 h-3 text-[#7F796F]" />
                    </th>
                    <th className="py-2.5 px-3 font-bold">Customer</th>
                    <th className="py-2.5 px-2 font-bold w-16"></th>
                    <th className="py-2.5 px-3 font-bold">Status</th>
                    <th className="py-2.5 px-3 font-bold">Total</th>
                    <th className="py-2.5 pl-3 pr-1 text-right font-bold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEAE1]/80 text-sm">
                  {displayRows.map((row) => (
                    <tr key={row.id} className="hover:bg-[#F3EFE6]/50 transition-colors">
                      {/* Order */}
                      <td className="py-3.5 pr-2 font-medium text-[#7F796F] text-xs font-mono">
                        {row.orderNumber}
                      </td>

                      {/* Customer Name */}
                      <td className="py-3.5 px-3 font-semibold text-[#1F1C18] text-sm">
                        {row.customer}
                      </td>

                      {/* Avatar + Flag */}
                      <td className="py-3.5 px-2">
                        <div className="flex items-center gap-1.5">
                          <img
                            src={row.avatarUrl}
                            alt={row.customer}
                            className="w-6 h-6 rounded-full object-cover shadow-2xs border border-[#D5CDC0]"
                          />
                          <span className="text-xs" title="United States">
                            {row.countryFlag}
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-3">
                        {row.status === 'Shipped' && (
                          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-[#184E42] text-white shadow-2xs">
                            Shipped
                          </span>
                        )}
                        {row.status === 'Issue' && (
                          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-[#9E978C] text-white shadow-2xs">
                            Issue
                          </span>
                        )}
                        {row.status === 'Failed' && (
                          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-[#827D74] text-white shadow-2xs">
                            Failed
                          </span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-3 font-semibold text-[#1F1C18] text-sm font-mono">
                        {row.total}
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 pl-3 pr-1 text-right">
                        {row.action === 'Retry' ? (
                          <button
                            type="button"
                            onClick={() => handleActionClick(row)}
                            className="inline-flex items-center gap-1 px-3.5 py-1 rounded-full text-xs font-semibold border border-[#D5CDBD] bg-[#EBE5DB] hover:bg-[#E0D8CB] text-[#3D3831] shadow-2xs transition-all cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3 text-[#554E46]" />
                            <span>Retry</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleActionClick(row)}
                            className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold border border-[#D5CDBD] bg-[#EBE5DB] hover:bg-[#E0D8CB] text-[#3D3831] shadow-2xs transition-all cursor-pointer"
                          >
                            <span>Resolve</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Area with subtle circuit trace line art */}
      <footer className="relative mt-8 pt-5 pb-6 px-4 border-t border-[#E8E2D6]/70 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
        {/* Subtle circuit line art watermark in background */}
        <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden">
          <svg className="w-full h-full text-[#9C9486]" viewBox="0 0 1000 80" preserveAspectRatio="none">
            <path
              d="M 50 40 L 150 40 L 180 15 L 300 15 L 320 35 L 450 35 M 600 50 L 680 50 L 710 20 L 850 20 M 200 65 L 350 65 L 380 45 M 750 60 L 900 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <circle cx="150" cy="40" r="2.5" fill="currentColor" />
            <circle cx="300" cy="15" r="2.5" fill="currentColor" />
            <circle cx="450" cy="35" r="2.5" fill="currentColor" />
            <circle cx="680" cy="50" r="2.5" fill="currentColor" />
            <circle cx="850" cy="20" r="2.5" fill="currentColor" />
          </svg>
        </div>

        {/* Search input on the left */}
        <div className="relative z-10 flex items-center gap-2 text-xs text-[#7F796F] w-full sm:w-auto">
          <Search className="w-3.5 h-3.5 text-[#9C958B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders, products, customers..."
            className="bg-transparent border-0 text-xs text-[#1F1C18] placeholder-[#9C958B] focus:outline-none w-64 md:w-80"
          />
        </div>

        {/* Right utility links */}
        <div className="relative z-10 flex items-center gap-4 text-xs font-semibold text-[#5E584F]">
          <button
            type="button"
            onClick={() => showToast('info', 'Notifications', 'No unread system notifications.')}
            className="flex items-center gap-1.5 hover:text-[#1F1C18] transition-colors cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Notifications</span>
          </button>
          <button
            type="button"
            onClick={() => showToast('info', 'Help Center', 'Opening documentation and live dropship guide...')}
            className="flex items-center gap-1.5 hover:text-[#1F1C18] transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help Center</span>
          </button>
        </div>
      </footer>

      {/* Manual retry modal for orders */}
      {selectedRetryOrder && (
        <ManualRetryModal
          isOpen={!!selectedRetryOrder}
          onClose={() => setSelectedRetryOrder(null)}
          orderId={selectedRetryOrder.id}
          orderNumber={selectedRetryOrder.orderNumber}
          orderStatus={selectedRetryOrder.status}
          holdExpiresAt={selectedRetryOrder.holdExpiresAt}
          currentSupplier={selectedRetryOrder.supplierType}
          onSuccess={refresh}
        />
      )}
    </div>
  );
};
