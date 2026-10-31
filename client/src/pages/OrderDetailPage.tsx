import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer.js';
import { useOrderDetail } from '../hooks/useOrderDetail.js';
import { OrderTimeline } from '../components/modules/orders/OrderTimeline.js';
import { AddressEditorModal } from '../components/modules/orders/AddressEditorModal.js';
import { ManualRetryModal } from '../components/modules/orders/ManualRetryModal.js';
import { CancelOrderModal } from '../components/modules/orders/CancelOrderModal.js';
import { OrderItemsCard } from '../components/modules/orders/OrderItemsCard.js';
import { OrderShippingAddressCard } from '../components/modules/orders/OrderShippingAddressCard.js';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import { formatDate } from '../utils/formatDate.js';
import { orderService } from '../services/orderService.js';
import { useNotification } from '../context/NotificationContext.js';
import { OrderHoldBanner } from '../components/modules/orders/OrderHoldBanner.js';
import { ArrowLeft, SlidersHorizontal, RefreshCw, Ban } from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const { order, loading, refresh } = useOrderDetail(id);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isRetryModalOpen, setIsRetryModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);

  const handleSyncCj = async () => {
    if (!order) return;
    try {
      setIsSyncing(true);
      const updated = await orderService.syncCjStatus(order.id);
      showToast('success', 'CJ Status Synced', `Live status: ${updated.status}`);
      await refresh();
    } catch (err: any) {
      showToast('error', 'Sync Failed', err.message);
    } finally { setIsSyncing(false); }
  };

  const handleReleaseNow = async () => {
    if (!order) return;
    try {
      setIsReleasing(true);
      await orderService.manualOverride({ orderId: order.id, action: 'RELEASE_NOW' });
      showToast('success', 'Dispatched to Supplier', 'Hold buffer released. Sent to CJ Dropshipping.');
      await refresh();
    } catch (err: any) {
      showToast('error', 'Release Failed', err.message);
    } finally { setIsReleasing(false); }
  };

  if (loading) {
    return (
      <PageContainer title="Loading Order...">
        <div className="py-24 text-center text-slate-500">Loading order details...</div>
      </PageContainer>
    );
  }

  if (!order) {
    return (
      <PageContainer title="Order Not Found">
        <div className="py-24 text-center text-slate-500 space-y-4">
          <p>The requested dropshipping order could not be found.</p>
          <Button variant="secondary" onClick={() => navigate('/admin/orders')}>
            Return to Orders
          </Button>
        </div>
      </PageContainer>
    );
  }

  const isHold = order.status === 'PENDING_HOLD';
  const canSync = ['DISPATCHED_TO_SUPPLIER', 'SUPPLIER_PROCESSING', 'SHIPPED'].includes(order.status);
  const canCancel = !['CANCELLED', 'DELIVERED'].includes(order.status);

  return (
    <PageContainer
      title={`Order ${order.shopifyOrderNumber}`}
      subtitle={`Placed on ${formatDate(order.shopifyCreatedAt)}`}
      action={
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/orders')}>
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Orders
          </Button>
          {canSync && (
            <Button variant="outline" size="sm" isLoading={isSyncing} onClick={handleSyncCj}>
              <RefreshCw className="w-3.5 h-3.5" />
              Sync Tracking
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => setIsRetryModalOpen(true)}>
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Manage Actions
          </Button>
          {canCancel && (
            <Button variant="danger" size="sm" onClick={() => setIsCancelModalOpen(true)}>
              <Ban className="w-3.5 h-3.5" />
              Cancel Order
            </Button>
          )}
        </div>
      }
    >
      {isHold && (
        <OrderHoldBanner
          holdExpiresAt={order.holdExpiresAt}
          onReleaseNow={handleReleaseNow}
          isReleasing={isReleasing}
          onEditAddress={() => setIsAddressModalOpen(true)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <OrderItemsCard items={order.items} totalPrice={order.totalPrice} currency={order.currency} />

          <OrderShippingAddressCard
            shippingName={order.shippingName} customerEmail={order.customerEmail} customerPhone={order.customerPhone}
            shippingAddress1={order.shippingAddress1} shippingAddress2={order.shippingAddress2} shippingCity={order.shippingCity}
            shippingProvince={order.shippingProvince} shippingZip={order.shippingZip}
            shippingCountry={order.shippingCountry} shippingCountryCode={order.shippingCountryCode}
            onEdit={() => setIsAddressModalOpen(true)}
          />
        </div>

        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Order Status</h3>
              <Badge status={order.status} />
            </div>
            <OrderTimeline order={order} />
          </Card>
        </div>
      </div>

      <AddressEditorModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        orderId={order.id}
        initialAddress={{
          shippingName: order.shippingName, shippingAddress1: order.shippingAddress1,
          shippingAddress2: order.shippingAddress2, shippingCity: order.shippingCity,
          shippingProvince: order.shippingProvince, shippingZip: order.shippingZip,
          customerPhone: order.customerPhone,
        }}
        onSave={async (data) => { await orderService.updateAddress(order.id, data); await refresh(); }}
      />

      <ManualRetryModal
        isOpen={isRetryModalOpen}
        onClose={() => setIsRetryModalOpen(false)}
        orderId={order.id}
        orderNumber={order.shopifyOrderNumber}
        orderStatus={order.status}
        holdExpiresAt={order.holdExpiresAt}
        currentSupplier={order.supplierType}
        onSuccess={refresh}
      />

      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        orderId={order.id}
        orderNumber={order.shopifyOrderNumber}
        supplierOrderId={order.supplierOrderId}
        onSuccess={refresh}
      />
    </PageContainer>
  );
};
