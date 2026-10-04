import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer.js';
import { OrderTable } from '../components/modules/orders/OrderTable.js';
import { ManualRetryModal } from '../components/modules/orders/ManualRetryModal.js';
import { useOrders } from '../hooks/useOrders.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { Order } from '../types/order.types.js';
import { Input } from '../components/common/Input.js';
import { Button } from '../components/common/Button.js';
import { Search, Filter, RefreshCw } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const debouncedSearch = useDebounce(searchInput, 400);

  const { orders, total, page, setPage, totalPages, loading, refresh, setStatus, setSearch } =
    useOrders({ status: activeTab as any, search: debouncedSearch, limit: 20 });

  const [selectedRetryOrder, setSelectedRetryOrder] = useState<Order | null>(null);

  const tabs = [
    { id: '', label: 'All Orders' },
    { id: 'PENDING_HOLD', label: 'Safety Hold (6h)' },
    { id: 'DISPATCHED_TO_SUPPLIER', label: 'Dispatched to Factory' },
    { id: 'SHIPPED', label: 'Shipped (In Transit)' },
    { id: 'FAILED_BILLING', label: 'Failed Billing' },
    { id: 'MANUAL_REVIEW', label: 'Manual Review' },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setStatus(tabId);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    setSearch(val);
    setPage(1);
  };

  return (
    <PageContainer
      title="Master Orders Queue"
      subtitle="Monitor automated order hold timers, supplier routing, and dispatch overrides"
      action={
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      }
    >
      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-800 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Input
            placeholder="Search by Shopify #, Email, Name, or Tracking..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 text-xs"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        </div>

        <div className="text-xs text-slate-400 font-semibold self-end sm:self-center">
          Showing <span className="text-white">{orders.length}</span> of{' '}
          <span className="text-white">{total}</span> orders
        </div>
      </div>

      {/* Order Table */}
      <OrderTable
        orders={orders}
        loading={loading}
        onRetryOrder={(order) => setSelectedRetryOrder(order)}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
          >
            Previous
          </Button>
          <span className="text-xs text-slate-400">
            Page <strong className="text-white">{page}</strong> of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          >
            Next
          </Button>
        </div>
      )}

      {/* Manual Retry & Override Modal */}
      {selectedRetryOrder && (
        <ManualRetryModal
          isOpen={!!selectedRetryOrder}
          onClose={() => setSelectedRetryOrder(null)}
          orderId={selectedRetryOrder.id}
          orderNumber={selectedRetryOrder.shopifyOrderNumber}
          currentSupplier={selectedRetryOrder.supplierType}
          onSuccess={refresh}
        />
      )}
    </PageContainer>
  );
};
