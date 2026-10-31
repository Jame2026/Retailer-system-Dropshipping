import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer.js';
import { StatsCard } from '../components/modules/dashboard/StatsCard.js';
import { BillingBalanceAlert } from '../components/modules/dashboard/BillingBalanceAlert.js';
import { OrderTable } from '../components/modules/orders/OrderTable.js';
import { useOrders } from '../hooks/useOrders.js';
import { useNotification } from '../context/NotificationContext.js';
import { ManualRetryModal } from '../components/modules/orders/ManualRetryModal.js';
import { sourcingService } from '../services/sourcingService.js';
import { orderService } from '../services/orderService.js';
import { Order } from '../types/order.types.js';
import { DollarSign, Clock, Truck, AlertTriangle, ArrowRight, Zap } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from '../components/common/Button.js';

export const DashboardPage: React.FC = () => {
  const { showToast } = useNotification();
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const { orders, loading, refresh, counts, totalRevenue } = useOrders({ limit: 8, status: selectedFilter as any });
  const [selectedRetryOrder, setSelectedRetryOrder] = useState<Order | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cjAccount, setCjAccount] = useState<{
    connected: boolean;
    openId: number | string | null;
    balance: { amount: number };
  }>({ connected: true, openId: '59360', balance: { amount: 0 } });

  useEffect(() => {
    sourcingService.getCjAccountInfo()
      .then((data) => { if (data) setCjAccount(data); })
      .catch(() => {});
  }, []);

  const handleSyncCarriers = async () => {
    setIsSyncing(true);
    try {
      showToast('info', 'Syncing Carriers', 'Checking CJ and USPS tracking numbers...');
      const active = orders.filter((o) => ['DISPATCHED_TO_SUPPLIER', 'SUPPLIER_PROCESSING', 'SHIPPED'].includes(o.status));
      if (active.length > 0) {
        await Promise.allSettled(active.map((o) => orderService.syncCjStatus(o.id)));
        showToast('success', 'Carriers Synced', `Synchronized ${active.length} active orders with CJ.`);
      } else {
        await new Promise((r) => setTimeout(r, 600));
        showToast('success', 'Carriers Synced', 'All active orders are up to date.');
      }
      refresh();
    } catch (err: any) {
      showToast('error', 'Sync Failed', err.message || 'Carrier check failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleReleaseHold = async (order: Order) => {
    try {
      await orderService.manualOverride({ orderId: order.id, action: 'RELEASE_NOW' });
      showToast('success', 'Hold Released', `Order ${order.shopifyOrderNumber} dispatched immediately.`);
      refresh();
    } catch (err: any) {
      showToast('error', 'Release Failed', err.message);
    }
  };

  const handleSyncOrder = async (order: Order) => {
    try {
      const updated = await orderService.syncCjStatus(order.id);
      showToast('success', 'CJ Synced', `Order ${updated.shopifyOrderNumber}: ${updated.status}`);
      refresh();
    } catch (err: any) {
      showToast('error', 'Sync Failed', err.message);
    }
  };

  const handleSimulateDemo = async () => {
    try {
      const num = Math.floor(1000 + Math.random() * 9000);
      await orderService.simulateOrder({
        id: Date.now().toString(), order_number: num, name: `#${num}`, created_at: new Date().toISOString(),
        financial_status: 'paid', currency: 'USD', total_price: '49.99', subtotal_price: '44.99',
        email: 'alex.smith@example.com', phone: '+1 555-0199',
        shipping_address: {
          name: 'Alex Smith', address1: '123 Market Street', city: 'San Francisco', province: 'California',
          province_code: 'CA', zip: '94105', country: 'United States', country_code: 'US',
        },
        line_items: [{
          id: Date.now().toString(), title: 'Multifunctional Wireless Charger RGB Lamp',
          sku: 'CJ-DEMO-LAMP', quantity: 1, price: '49.99', variant_id: '2610300340461623900',
        }],
      });
      showToast('success', 'Demo Order Placed', `Order #${num} created! Stats and counters updated.`);
      refresh();
    } catch (err: any) { showToast('error', 'Simulation Failed', err.message); }
  };

  const heldCount = counts['PENDING_HOLD'] ?? 0;
  const inTransitCount = (counts['PROCESSING'] ?? 0) + (counts['SHIPPED'] ?? 0);
  const issuesCount = (counts['FAILED_BILLING'] ?? 0) + (counts['MANUAL_REVIEW'] ?? 0);

  return (
    <PageContainer
      title="Dashboard" subtitle="Store overview and real-time order automation"
      onSyncAll={handleSyncCarriers} isSyncing={isSyncing}
      action={
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleSimulateDemo} className="font-semibold text-xs">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> + Demo Order
          </Button>
          <NavLink to="/admin/orders">
            <Button variant="primary" size="sm" className="font-semibold text-xs">
              All Orders <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </NavLink>
        </div>
      }
    >
      <BillingBalanceAlert
        cjBalanceUsd={cjAccount.balance?.amount || 0}
        openId={cjAccount.openId} connected={cjAccount.connected}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Sales" numericValue={totalRevenue} prefix="$" decimals={2}
          change="14.2%" isPositive={true} icon={<DollarSign className="w-5 h-5 text-teal-600" />}
          subtitle="All customer orders"
        />
        <StatsCard
          title="Waiting (6h)" numericValue={heldCount}
          change={heldCount > 0 ? `${heldCount} on hold` : '0 on hold'}
          isPositive={true} icon={<Clock className="w-5 h-5 text-amber-600" />}
          subtitle="Safety hold before dispatch"
        />
        <StatsCard
          title="Dispatched" numericValue={inTransitCount} change="8.5%" isPositive={true}
          icon={<Truck className="w-5 h-5 text-purple-600" />} subtitle="Processing with CJ"
        />
        <StatsCard
          title="Needs Review" numericValue={issuesCount}
          change={issuesCount > 0 ? 'Action Needed' : 'All Clear'} isPositive={issuesCount === 0}
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />} subtitle="Payment or address issues"
        />
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Recent Orders</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
              {orders.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {[
              { id: '', label: 'All' },
              { id: 'PENDING_HOLD', label: 'Waiting (6h)' },
              { id: 'DISPATCHED_TO_SUPPLIER', label: 'Dispatched' },
              { id: 'FAILED_BILLING', label: 'Issues' },
            ].map((f) => (
              <button
                key={f.id} onClick={() => setSelectedFilter(f.id)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                  selectedFilter === f.id
                    ? 'bg-teal-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <OrderTable
          orders={orders} loading={loading}
          onRetryOrder={(order) => setSelectedRetryOrder(order)}
          onReleaseHold={handleReleaseHold} onSyncOrder={handleSyncOrder}
        />
      </div>

      {selectedRetryOrder && (
        <ManualRetryModal
          isOpen={!!selectedRetryOrder} onClose={() => setSelectedRetryOrder(null)}
          orderId={selectedRetryOrder.id} orderNumber={selectedRetryOrder.shopifyOrderNumber}
          orderStatus={selectedRetryOrder.status} holdExpiresAt={selectedRetryOrder.holdExpiresAt}
          currentSupplier={selectedRetryOrder.supplierType} onSuccess={refresh}
        />
      )}
    </PageContainer>
  );
};
