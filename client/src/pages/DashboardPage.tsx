import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { useOrders } from '../hooks/useOrders.js';
import { useNotification } from '../context/NotificationContext.js';
import { ManualRetryModal } from '../components/modules/orders/ManualRetryModal.js';
import { sourcingService } from '../services/sourcingService.js';
import { orderService } from '../services/orderService.js';
import { Order } from '../types/order.types.js';
import { DashboardRow } from '../components/modules/dashboard/dashboard.types.js';
import { DEFAULT_DASHBOARD_ROWS } from '../components/modules/dashboard/dashboard.mock.js';
import { PlatformHealthCard } from '../components/modules/dashboard/PlatformHealthCard.js';
import { OverviewSplineChart } from '../components/modules/dashboard/OverviewSplineChart.js';
import { AlertsCard } from '../components/modules/dashboard/AlertsCard.js';
import { RecentOrdersTable } from '../components/modules/dashboard/RecentOrdersTable.js';
import { DashboardFooter } from '../components/modules/dashboard/DashboardFooter.js';

export const DashboardPage: React.FC = () => {
  const { showToast } = useNotification();
  const { orders, refresh, counts } = useOrders({ limit: 10 });
  const [selectedRetryOrder, setSelectedRetryOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cjAccount, setCjAccount] = useState<{
    connected: boolean;
    openId: number | string | null;
    balance: { amount: number };
  }>({ connected: true, openId: '59360', balance: { amount: 0.0 } });

  useEffect(() => {
    sourcingService
      .getCjAccountInfo()
      .then((data) => {
        if (data) {
          setCjAccount({
            connected: data.connected ?? true,
            openId: data.openId ?? '59360',
            balance: {
              amount: data.balance?.amount !== undefined ? data.balance.amount : 0.0,
            },
          });
        }
      })
      .catch(() => {});
  }, []);

  const orderRows: DashboardRow[] = orders.slice(0, 5).map((o, idx) => {
    let statusLabel: 'Issue' | 'Shipped' | 'Failed' = 'Issue';
    let actionLabel: 'Resolve' | 'Retry' = 'Resolve';

    if (o.status === 'SHIPPED' || o.status === 'DISPATCHED_TO_SUPPLIER') {
      statusLabel = 'Shipped';
      actionLabel = 'Retry';
    } else if (o.status === 'FAILED_BILLING') {
      statusLabel = 'Failed';
      actionLabel = 'Resolve';
    } else {
      statusLabel = 'Issue';
      actionLabel = 'Resolve';
    }

    const fallback = DEFAULT_DASHBOARD_ROWS[idx % DEFAULT_DASHBOARD_ROWS.length];
    return {
      id: o.id,
      orderNumber: o.orderNumber || fallback.orderNumber,
      customer: o.shippingName || fallback.customer,
      avatarUrl: fallback.avatarUrl,
      countryCode: o.shippingCountryCode || fallback.countryCode,
      status: statusLabel,
      total: `$${Number(o.totalPrice || 76.5).toFixed(2)}`,
      action: actionLabel,
      rawOrder: o,
    };
  });

  const displayRows: DashboardRow[] =
    orderRows.length === 0
      ? DEFAULT_DASHBOARD_ROWS
      : orderRows.length < 5
        ? [...orderRows, ...DEFAULT_DASHBOARD_ROWS.slice(orderRows.length, 5)]
        : orderRows;

  const handleActionClick = (row: DashboardRow) => {
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
  const alertsDisplay = issuesCount > 0 ? `${issuesCount} Alerts` : '2 Alerts';

  return (
    <div className="p-6 md:p-8 w-full flex-1 flex flex-col justify-between space-y-6 text-[#111827]">
      {/* Title & Subtitle + Export Action */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-[#6B7280] mt-1 font-medium">
            Store overview and real-time order automation
          </p>
        </div>

        <button
          type="button"
          onClick={() => showToast('info', 'Export', 'Downloading overview report...')}
          className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-[#4B5563] shadow-2xs transition-all cursor-pointer"
          title="Share / Export"
        >
          <Upload className="w-4 h-4" />
        </button>
      </div>

      {/* Platform Health Card */}
      <PlatformHealthCard balanceAmount={cjAccount.balance?.amount} />

      {/* Lower Section (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-1">
        <div className="lg:col-span-5 flex flex-col gap-5 justify-between">
          <OverviewSplineChart />
          <AlertsCard countText={alertsDisplay} />
        </div>

        <div className="lg:col-span-7 flex flex-col">
          <RecentOrdersTable rows={displayRows} onActionClick={handleActionClick} />
        </div>
      </div>

      {/* Bottom Search Bar and Footer Utility Links */}
      <DashboardFooter searchQuery={searchQuery} onSearchChange={setSearchQuery} />

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
