import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer.js';
import { OrderTable } from '../components/modules/orders/OrderTable.js';
import { ManualRetryModal } from '../components/modules/orders/ManualRetryModal.js';
import { CancelOrderModal } from '../components/modules/orders/CancelOrderModal.js';
import { useOrders } from '../hooks/useOrders.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { Order } from '../types/order.types.js';
import { Input } from '../components/common/Input.js';
import { Button } from '../components/common/Button.js';
import { orderService } from '../services/orderService.js';
import { useNotification } from '../context/NotificationContext.js';
import { Search, RefreshCw, Zap } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const debouncedSearch = useDebounce(searchInput, 400);

  const { orders, total, page, setPage, totalPages, loading, refresh, setStatus, setSearch, counts } =
    useOrders({ status: activeTab as any, search: debouncedSearch, limit: 20 });

  const [selectedRetryOrder, setSelectedRetryOrder] = useState<Order | null>(null);
  const [selectedCancelOrder, setSelectedCancelOrder] = useState<Order | null>(null);

  const tabs = [
    { id: '', label: 'All Orders', countKey: 'ALL' },
    { id: 'PENDING_HOLD', label: 'On Hold (6h)', countKey: 'PENDING_HOLD' },
    { id: 'DISPATCHED_TO_SUPPLIER', label: 'Processing', countKey: 'PROCESSING' },
    { id: 'SHIPPED', label: 'Shipped', countKey: 'SHIPPED' },
    { id: 'FAILED_BILLING', label: 'Payment Issue', countKey: 'FAILED_BILLING' },
    { id: 'MANUAL_REVIEW', label: 'Needs Review', countKey: 'MANUAL_REVIEW' },
    { id: 'CANCELLED', label: 'Cancelled', countKey: 'CANCELLED' },
  ];

  const handleTabChange = (tabId: string) => { setActiveTab(tabId); setStatus(tabId); setPage(1); };
  const handleSearchChange = (val: string) => { setSearchInput(val); setSearch(val); setPage(1); };

  const handleSyncOrder = async (order: Order) => {
    try {
      const updated = await orderService.syncCjStatus(order.id);
      showToast('success', 'CJ Status Synced', `Order ${updated.shopifyOrderNumber}: ${updated.status}`);
      refresh();
    } catch (err: any) {
      showToast('error', 'Sync Failed', err.message);
    }
  };

  const handleReleaseHold = async (order: Order) => {
    try {
      await orderService.manualOverride({ orderId: order.id, action: 'RELEASE_NOW' });
      showToast('success', 'Hold Released', `Order ${order.shopifyOrderNumber} dispatched to factory.`);
      refresh();
    } catch (err: any) {
      showToast('error', 'Dispatch Failed', err.message);
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
      showToast('success', 'Demo Order Created', `Order #${num} entered 6h hold buffer.`);
      refresh();
    } catch (err: any) {
      showToast('error', 'Simulation Failed', err.message);
    }
  };

  return (
    <PageContainer
      title="Orders"
      subtitle="Track and manage customer orders"
      action={
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleSimulateDemo}>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            + Demo Order
          </Button>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>
      }
    >
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-2">
        {tabs.map((tab) => {
          const count = counts[tab.countKey];
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                isActive ? 'bg-teal-600 text-white shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              {count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Input
            placeholder="Search by order #, email, or name..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 text-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <div className="text-xs text-slate-500 font-semibold self-end sm:self-center">
          Showing <span className="text-slate-900 font-bold">{orders.length}</span> of <span className="text-slate-900 font-bold">{total}</span> orders
        </div>
      </div>

      <OrderTable
        orders={orders}
        loading={loading}
        onRetryOrder={(order) => setSelectedRetryOrder(order)}
        onSyncOrder={handleSyncOrder}
        onReleaseHold={handleReleaseHold}
        onCancelOrder={(order) => setSelectedCancelOrder(order)}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(p - 1, 1))}>
            Previous
          </Button>
          <span className="text-xs text-slate-500">
            Page <strong className="text-slate-900">{page}</strong> of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(p + 1, totalPages))}>
            Next
          </Button>
        </div>
      )}

      {selectedRetryOrder && (
        <ManualRetryModal
          isOpen={!!selectedRetryOrder}
          onClose={() => setSelectedRetryOrder(null)}
          orderId={selectedRetryOrder.id}
          orderNumber={selectedRetryOrder.shopifyOrderNumber}
          orderStatus={selectedRetryOrder.status}
          holdExpiresAt={selectedRetryOrder.holdExpiresAt}
          currentSupplier={selectedRetryOrder.supplierType}
          onSuccess={refresh}
        />
      )}

      {selectedCancelOrder && (
        <CancelOrderModal
          isOpen={!!selectedCancelOrder}
          onClose={() => setSelectedCancelOrder(null)}
          orderId={selectedCancelOrder.id}
          orderNumber={selectedCancelOrder.shopifyOrderNumber}
          supplierOrderId={selectedCancelOrder.supplierOrderId}
          onSuccess={refresh}
        />
      )}
    </PageContainer>
  );
};
