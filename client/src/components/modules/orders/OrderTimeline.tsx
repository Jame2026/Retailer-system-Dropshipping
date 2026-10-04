import React, { useState, useEffect } from 'react';
import { Order } from '../../../types/order.types.js';
import { formatTimeRemaining, formatDate } from '../../../utils/formatDate.js';
import { getCarrierTrackingUrl } from '../../../utils/trackingUrl.js';
import { CheckCircle2, Clock, Factory, Truck, AlertCircle, ExternalLink } from 'lucide-react';

export interface OrderTimelineProps {
  order: Order;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ order }) => {
  const [countdown, setCountdown] = useState(formatTimeRemaining(order.holdExpiresAt));

  useEffect(() => {
    if (order.status !== 'PENDING_HOLD') return;

    const timer = setInterval(() => {
      setCountdown(formatTimeRemaining(order.holdExpiresAt));
    }, 1000);

    return () => clearInterval(timer);
  }, [order.holdExpiresAt, order.status]);

  const steps = [
    {
      id: 'paid',
      title: 'Shopify Payment Captured',
      subtitle: formatDate(order.shopifyCreatedAt),
      isCompleted: true,
      icon: CheckCircle2,
      color: 'text-teal-700 bg-teal-50 border-teal-200',
    },
    {
      id: 'hold',
      title: '6-Hour Safety Hold Buffer',
      subtitle:
        order.status === 'PENDING_HOLD'
          ? `Releases in ${countdown.formatted}`
          : order.releasedAt
          ? `Released at ${formatDate(order.releasedAt)}`
          : 'Buffer expired or released',
      isCompleted: order.status !== 'PENDING_HOLD',
      isCurrent: order.status === 'PENDING_HOLD',
      icon: Clock,
      color:
        order.status === 'PENDING_HOLD'
          ? 'text-amber-700 bg-amber-50 border-amber-300'
          : 'text-teal-700 bg-teal-50 border-teal-200',
    },
    {
      id: 'factory',
      title: `${order.supplierType || 'CJ'} Factory Fulfillment`,
      subtitle: order.supplierOrderId
        ? `Supplier Order ID: ${order.supplierOrderId}`
        : order.status === 'FAILED_BILLING'
        ? 'Awaiting balance top-up / retry'
        : 'Waiting for buffer release',
      isCompleted: ['DISPATCHED_TO_SUPPLIER', 'SUPPLIER_PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status),
      isCurrent: ['PROCESSING', 'DISPATCHED_TO_SUPPLIER', 'SUPPLIER_PROCESSING'].includes(order.status),
      icon: Factory,
      color: ['DISPATCHED_TO_SUPPLIER', 'SUPPLIER_PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)
        ? 'text-purple-700 bg-purple-50 border-purple-200'
        : order.status === 'FAILED_BILLING'
        ? 'text-rose-700 bg-rose-50 border-rose-300'
        : 'text-slate-400 bg-slate-100 border-slate-200',
    },
    {
      id: 'tracking',
      title: 'USPS / YunExpress In Transit',
      subtitle: order.fulfillments?.[0]?.trackingNumber ? (
        <a
          href={getCarrierTrackingUrl(
            order.fulfillments[0].trackingNumber,
            order.fulfillments[0].trackingCompany
          )}
          target="_blank"
          rel="noreferrer"
          className="text-teal-600 hover:underline inline-flex items-center gap-1 font-mono text-xs font-semibold"
        >
          {order.fulfillments[0].trackingCompany}: {order.fulfillments[0].trackingNumber}
          <ExternalLink className="w-3 h-3" />
        </a>
      ) : (
        'Tracking will be generated upon dispatch'
      ),
      isCompleted: ['SHIPPED', 'DELIVERED'].includes(order.status),
      isCurrent: order.status === 'SHIPPED',
      icon: Truck,
      color: ['SHIPPED', 'DELIVERED'].includes(order.status)
        ? 'text-teal-700 bg-teal-50 border-teal-200'
        : 'text-slate-400 bg-slate-100 border-slate-200',
    },
  ];

  return (
    <div className="py-2 space-y-6">
      {order.status === 'FAILED_BILLING' && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>
            <strong>Billing Blocked:</strong> {order.lastErrorReason || 'Supplier wallet balance is insufficient.'}
          </span>
        </div>
      )}

      {order.status === 'MANUAL_REVIEW' && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            <strong>Attention Required:</strong> {order.manualReviewNotes || 'Please inspect and correct shipping address or unmapped SKUs.'}
          </span>
        </div>
      )}

      <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="relative flex items-start gap-4 group">
              <div
                className={`absolute -left-6 top-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-all duration-200 ${step.color}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="pt-0.5">
                <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
                <div className="text-xs text-slate-500 mt-0.5">{step.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
