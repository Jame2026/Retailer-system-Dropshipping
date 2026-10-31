import React, { useState, useEffect } from 'react';
import { Order } from '../../../types/order.types.js';
import { formatTimeRemaining, formatDate } from '../../../utils/formatDate.js';
import { getCarrierTrackingUrl } from '../../../utils/trackingUrl.js';
import { CheckCircle2, Clock, Factory, Truck, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';

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
      description: 'Order placed by customer and payment verified.',
      subtitle: formatDate(order.shopifyCreatedAt),
      isCompleted: true,
      icon: CheckCircle2,
      activeColor: 'text-teal-700 bg-teal-50 border-teal-300 ring-4 ring-teal-50',
    },
    {
      id: 'hold',
      title: '6-Hour Safety Hold',
      description: 'Buffer period for customer address updates and cancellation requests.',
      subtitle:
        order.status === 'PENDING_HOLD'
          ? (countdown.isExpired ? 'Hold window ended (Ready)' : `Releases in ${countdown.formatted}`)
          : order.releasedAt
          ? `Released at ${formatDate(order.releasedAt)}`
          : 'Hold completed',
      isCompleted: order.status !== 'PENDING_HOLD',
      isCurrent: order.status === 'PENDING_HOLD',
      icon: Clock,
      activeColor: 'text-amber-700 bg-amber-50 border-amber-400 ring-4 ring-amber-50',
    },
    {
      id: 'factory',
      title: 'CJ Factory Fulfillment',
      description: 'Order routed to CJ warehouse for product picking and packaging.',
      subtitle: order.supplierOrderId
        ? `CJ Order ID: ${order.supplierOrderId}`
        : order.status === 'FAILED_BILLING'
        ? 'Billing failed — top-up required'
        : 'Dispatches when hold expires',
      isCompleted: ['DISPATCHED_TO_SUPPLIER', 'SUPPLIER_PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status),
      isCurrent: ['PROCESSING', 'DISPATCHED_TO_SUPPLIER', 'SUPPLIER_PROCESSING'].includes(order.status),
      icon: Factory,
      activeColor: 'text-purple-700 bg-purple-50 border-purple-300 ring-4 ring-purple-50',
    },
    {
      id: 'tracking',
      title: 'Carrier Shipping & Tracking',
      description: 'Package in transit with USPS / YunExpress tracking to customer.',
      subtitle: order.fulfillments?.[0]?.trackingNumber ? (
        <a
          href={getCarrierTrackingUrl(
            order.fulfillments[0].trackingNumber,
            order.fulfillments[0].trackingCompany
          )}
          target="_blank"
          rel="noreferrer"
          className="text-teal-700 hover:underline inline-flex items-center gap-1 font-mono text-xs font-bold"
        >
          {order.fulfillments[0].trackingCompany}: {order.fulfillments[0].trackingNumber}
          <ExternalLink className="w-3 h-3" />
        </a>
      ) : (
        'Generated automatically upon CJ dispatch'
      ),
      isCompleted: ['SHIPPED', 'DELIVERED'].includes(order.status),
      isCurrent: order.status === 'SHIPPED',
      icon: Truck,
      activeColor: 'text-teal-700 bg-teal-50 border-teal-300 ring-4 ring-teal-50',
    },
  ];

  return (
    <div className="space-y-5">
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
            <strong>Attention Required:</strong> {order.manualReviewNotes || 'Please inspect shipping address or unmapped SKUs.'}
          </span>
        </div>
      )}

      <div className="space-y-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isComplete = step.isCompleted;
          const isCurrent = step.isCurrent;
          const isLast = idx === steps.length - 1;

          let badgeColor = 'text-slate-400 bg-slate-50 border-slate-200';
          if (isCurrent) {
            badgeColor = 'text-amber-700 bg-amber-50 border-amber-400 ring-4 ring-amber-100/80 shadow-xs';
          } else if (isComplete) {
            badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-300';
          }

          return (
            <div key={step.id} className="flex items-start gap-3">
              <div className="flex flex-col items-center self-stretch shrink-0">
                <div
                  className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs shrink-0 z-10 transition-all ${badgeColor}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {!isLast && <div className="w-0.5 flex-1 bg-slate-200 my-1 min-h-[20px]"></div>}
              </div>

              <div className="pb-3 min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      Current Stage
                    </span>
                  )}
                  {isComplete && !isCurrent && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Done
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">{step.description}</p>
                <div className="text-xs text-slate-700 font-semibold pt-0.5">{step.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
