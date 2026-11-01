import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { useOrders } from '../hooks/useOrders.js';
import { useNotification } from '../context/NotificationContext.js';
import { ManualRetryModal } from '../components/modules/orders/ManualRetryModal.js';
import { sourcingService } from '../services/sourcingService.js';
import { orderService } from '../services/orderService.js';
import { Order } from '../types/order.types.js';
import { DashboardRow } from '../components/modules/dashboard/dashboard.types.js';
import { mapOrderToDashboardRow, exportOrdersToCsv } from '../components/modules/dashboard/dashboard.utils.js';
import { PlatformHealthCard } from '../components/modules/dashboard/PlatformHealthCard.js';
import { OverviewSplineChart } from '../components/modules/dashboard/OverviewSplineChart.js';
import { AlertsCard } from '../components/modules/dashboard/AlertsCard.js';
import { RecentOrdersTable } from '../components/modules/dashboard/RecentOrdersTable.js';
import { DashboardFooter } from '../components/modules/dashboard/DashboardFooter.js';

export const DashboardPage: React.FC = () => {
  const { showToast } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const { orders, refresh, counts, totalRevenue, total } = useOrders({
    limit: 10,
    search: searchQuery,
  });

  const [selectedRetryOrder, setSelectedRetryOrder] = useState<Order | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSyncingCj, setIsSyncingCj] = useState(false);
  const [filterOnlyIssues, setFilterOnlyIssues] = useState(false);
  const [cjAccount, setCjAccount] = useState({ connected: true, openId: '59360', balance: { amount: 0.0 } });

  useEffect(() => {
    sourcingService.getCjAccountInfo().then((data) => {
      if (data) {
        setCjAccount({
          connected: data.connected ?? true,
          openId: String(data.openId ?? '59360'),
          balance: { amount: data.balance?.amount ?? 0.0 },
        });
      }
    }).catch(() => {});
  }, []);

  const handleRefreshCj = async () => {
    setIsSyncingCj(true);
    try {
      const data = await sourcingService.getCjAccountInfo(true);
      if (data) {
        setCjAccount({
          connected: data.connected ?? true,
          openId: String(data.openId ?? '59360'),
          balance: { amount: data.balance?.amount ?? 0.0 },
        });
        showToast('success', 'CJ Health Verified', `Ping 200 OK — Supplier ID #${data.openId ?? '59360'}`);
      }
    } catch {
      showToast('error', 'CJ Ping Failed', 'Could not reach CJ Dropshipping API.');
    } finally {
      setIsSyncingCj(false);
    }
  };

  const handleSimulateOrder = async () => {
    try {
      setIsSimulating(true);
      const num = Math.floor(1000 + Math.random() * 9000);
      const names = ['Michael Scott', 'Jessica Davis', 'David Miller', 'Alex Smith', 'Emma Watson'];
      const randomName = names[Math.floor(Math.random() * names.length)];
      await orderService.simulateOrder({
        id: Date.now().toString(),
        order_number: num,
        name: `#${num}`,
        created_at: new Date().toISOString(),
        financial_status: 'paid',
        currency: 'USD',
        total_price: (35 + Math.random() * 80).toFixed(2),
        subtotal_price: '30.00',
        email: `${randomName.toLowerCase().replace(' ', '.')}@example.com`,
        shipping_address: {
          name: randomName,
          address1: '123 Market Street',
          city: 'San Francisco',
          province: 'California',
          province_code: 'CA',
          zip: '94105',
          country: 'United States',
          country_code: 'US',
        },
      });
      showToast('success', 'Order Simulated', `New order #${num} created in database.`);
      refresh();
    } catch (err: any) {
      showToast('error', 'Simulation Failed', err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  const orderRows: DashboardRow[] = orders.map(mapOrderToDashboardRow);
  const displayRows = filterOnlyIssues
    ? orderRows.filter((r) => ['Issue', 'Failed', 'Hold', 'Cancelled'].includes(r.status))
    : orderRows;

  const handleActionClick = async (row: DashboardRow) => {
    if (!row.rawOrder) return;
    if (row.action === 'Retry') {
      setSelectedRetryOrder(row.rawOrder);
      return;
    }
    setActionLoadingId(row.id);
    try {
      if (row.action === 'Sync') {
        await orderService.syncCjStatus(row.rawOrder.id);
        showToast('success', 'Status Synced', `Synced tracking for ${row.orderNumber}`);
      } else {
        await orderService.manualOverride({ orderId: row.rawOrder.id, action: 'RELEASE_NOW' });
        showToast('success', 'Order Released', `Dispatched ${row.orderNumber} to supplier.`);
      }
      refresh();
    } catch (err: any) {
      showToast('error', 'Action Failed', err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleExport = () => {
    exportOrdersToCsv(displayRows);
    showToast('success', 'Exported', 'Downloaded live CSV orders report.');
  };

  const issuesCount = (counts['FAILED_BILLING'] ?? 0) + (counts['MANUAL_REVIEW'] ?? 0) + (counts['CANCELLED'] ?? 0);

  return (
    <div className="p-6 md:p-8 w-full flex-1 flex flex-col justify-between space-y-6 text-[#111827]">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight">Dashboard</h1>
          <p className="text-sm text-[#6B7280] mt-1 font-medium">Store overview and real-time order automation</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-[#4B5563] shadow-2xs transition-all cursor-pointer"
          title="Export Orders CSV"
        >
          <Upload className="w-4 h-4" />
        </button>
      </div>

      <PlatformHealthCard
        balanceAmount={cjAccount.balance?.amount}
        openId={cjAccount.openId}
        isSyncing={isSyncingCj}
        onRefresh={handleRefreshCj}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-1">
        <div className="lg:col-span-5 flex flex-col gap-5 justify-between">
          <OverviewSplineChart
            totalRevenue={totalRevenue}
            ordersCount={total}
            avgFulfillmentHours={3.2}
          />
          <AlertsCard
            countText={`${issuesCount} Alert${issuesCount === 1 ? '' : 's'}`}
            isActiveFilter={filterOnlyIssues}
            onToggleFilter={() => setFilterOnlyIssues(!filterOnlyIssues)}
          />
        </div>

        <div className="lg:col-span-7 flex flex-col">
          <RecentOrdersTable
            rows={displayRows}
            onActionClick={handleActionClick}
            onSimulateOrder={handleSimulateOrder}
            isSimulating={isSimulating}
            actionLoadingId={actionLoadingId}
          />
        </div>
      </div>

      <DashboardFooter searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {selectedRetryOrder && (
        <ManualRetryModal
          isOpen={!!selectedRetryOrder}
          onClose={() => setSelectedRetryOrder(null)}
          orderId={selectedRetryOrder.id}
          orderNumber={selectedRetryOrder.shopifyOrderNumber || selectedRetryOrder.orderNumber}
          orderStatus={selectedRetryOrder.status}
          holdExpiresAt={selectedRetryOrder.holdExpiresAt}
          currentSupplier={selectedRetryOrder.supplierType}
          onSuccess={refresh}
        />
      )}
    </div>
  );
};
