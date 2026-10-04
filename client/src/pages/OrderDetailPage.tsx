import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer.js';
import { useOrderDetail } from '../hooks/useOrderDetail.js';
import { OrderTimeline } from '../components/modules/orders/OrderTimeline.js';
import { AddressEditorModal } from '../components/modules/orders/AddressEditorModal.js';
import { ManualRetryModal } from '../components/modules/orders/ManualRetryModal.js';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatDate } from '../utils/formatDate.js';
import { getCarrierTrackingUrl } from '../utils/trackingUrl.js';
import { useNotification } from '../context/NotificationContext.js';
import {
  ArrowLeft,
  MapPin,
  Edit2,
  Send,
  RotateCcw,
  ExternalLink,
  Code,
  PackageCheck,
  ShieldCheck,
} from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const { order, loading, refresh } = useOrderDetail(id);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isRetryModalOpen, setIsRetryModalOpen] = useState(false);
  const [showRawPayload, setShowRawPayload] = useState(false);

  if (loading) {
    return (
      <PageContainer title="Loading Order...">
        <div className="py-24 text-center text-slate-400">Loading order details...</div>
      </PageContainer>
    );
  }

  if (!order) {
    return (
      <PageContainer title="Order Not Found">
        <div className="py-24 text-center text-slate-400 space-y-4">
          <p>The requested dropshipping order could not be found.</p>
          <Button variant="secondary" onClick={() => navigate('/orders')}>
            Return to Orders
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={`Order ${order.shopifyOrderNumber}`}
      subtitle={`Created ${formatDate(order.shopifyCreatedAt)} • Shopify ID: ${order.shopifyOrderId}`}
      action={
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Queue
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsRetryModalOpen(true)}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Manual Override
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order Items & Delivery Address */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Table */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-teal-400" />
                Line Items & SKU Mappings ({order.items?.length || 0})
              </h3>
              <span className="text-xs font-mono text-teal-400 font-bold">
                Total: {formatCurrency(order.totalPrice, order.currency)}
              </span>
            </div>

            <div className="divide-y divide-slate-800/60">
              {order.items?.map((item) => (
                <div key={item.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">{item.title}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-slate-400">Store SKU: {item.storeSku}</span>
                      {item.skuMapping ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                          <ShieldCheck className="w-3 h-3" />
                          Mapped: {item.skuMapping.primarySupplierSku}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          Unmapped SKU
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-white font-mono">
                      {formatCurrency(item.price)}
                    </p>
                    <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Customer Shipping Address */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400" />
                US Customer Shipping Address
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddressModalOpen(true)}
                className="text-xs py-1"
              >
                <Edit2 className="w-3 h-3" />
                Edit Address
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px]">Recipient</p>
                <p className="text-sm font-bold text-white mt-0.5">{order.shippingName}</p>
                <p className="text-slate-300 mt-0.5">{order.customerEmail}</p>
                <p className="text-slate-400 font-mono mt-0.5">{order.customerPhone || 'No Phone'}</p>
              </div>

              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px]">Street & City</p>
                <p className="text-slate-200 mt-0.5 font-medium">{order.shippingAddress1}</p>
                {order.shippingAddress2 && (
                  <p className="text-slate-400 font-medium">{order.shippingAddress2}</p>
                )}
                <p className="text-slate-200 mt-0.5 font-bold">
                  {order.shippingCity}, {order.shippingProvince} {order.shippingZip}
                </p>
                <p className="text-slate-400">{order.shippingCountry} ({order.shippingCountryCode})</p>
              </div>
            </div>
          </Card>

          {/* Raw Payload Inspector toggle */}
          <div className="pt-2">
            <button
              onClick={() => setShowRawPayload(!showRawPayload)}
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5"
            >
              <Code className="w-4 h-4" />
              {showRawPayload ? 'Hide' : 'Inspect'} Raw Backend Record JSON
            </button>
            {showRawPayload && (
              <pre className="mt-2 p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-teal-300 overflow-x-auto max-h-96">
                {JSON.stringify(order, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* Right Column: Automated Lifecycle Timeline */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Order Pipeline State</h3>
              <Badge status={order.status} />
            </div>

            <OrderTimeline order={order} />
          </Card>
        </div>
      </div>

      {/* Address Editor Modal */}
      <AddressEditorModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        orderId={order.id}
        initialAddress={{
          shippingName: order.shippingName,
          shippingAddress1: order.shippingAddress1,
          shippingAddress2: order.shippingAddress2,
          shippingCity: order.shippingCity,
          shippingProvince: order.shippingProvince,
          shippingZip: order.shippingZip,
          customerPhone: order.customerPhone,
        }}
        onSave={async (data) => {
          // Address update logic
          refresh();
        }}
      />

      {/* Manual Retry Modal */}
      <ManualRetryModal
        isOpen={isRetryModalOpen}
        onClose={() => setIsRetryModalOpen(false)}
        orderId={order.id}
        orderNumber={order.shopifyOrderNumber}
        currentSupplier={order.supplierType}
        onSuccess={refresh}
      />
    </PageContainer>
  );
};
