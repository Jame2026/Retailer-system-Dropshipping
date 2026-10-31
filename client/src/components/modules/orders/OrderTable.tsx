import React, { useState } from 'react';
import { Order } from '../../../types/order.types.js';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../common/Table.js';
import { Badge } from '../../common/Badge.js';
import { Button } from '../../common/Button.js';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { formatDate, formatTimeRemaining } from '../../../utils/formatDate.js';
import { useNavigate } from 'react-router-dom';
import { Clock, RefreshCw, Zap, SlidersHorizontal, ChevronRight, RotateCcw } from 'lucide-react';

export interface OrderTableProps {
  orders: Order[];
  loading?: boolean;
  onRetryOrder?: (order: Order) => void;
  onSyncOrder?: (order: Order) => Promise<void>;
  onReleaseHold?: (order: Order) => Promise<void>;
  onCancelOrder?: (order: Order) => void;
}

export const OrderTable: React.FC<OrderTableProps> = ({
  orders, loading, onRetryOrder, onSyncOrder, onReleaseHold, onCancelOrder,
}) => {
  const navigate = useNavigate();
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [releasingId, setReleasingId] = useState<string | null>(null);

  const handleSync = async (order: Order) => {
    if (!onSyncOrder) return;
    try {
      setSyncingId(order.id);
      await onSyncOrder(order);
    } finally { setSyncingId(null); }
  };

  const handleRelease = async (order: Order) => {
    if (!onReleaseHold) return;
    try {
      setReleasingId(order.id);
      await onReleaseHold(order);
    } finally { setReleasingId(null); }
  };

  if (loading) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-slate-500 gap-3">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold">Loading Dropship Orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="w-full py-16 border border-slate-200 rounded-2xl bg-white text-center shadow-sm">
        <p className="text-slate-500 text-sm font-medium">No orders found matching the filter criteria.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order #</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Hold Time</TableHead>
          <TableHead>Supplier</TableHead>
          <TableHead>Total</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const hold = formatTimeRemaining(order.holdExpiresAt);
          const isHold = order.status === 'PENDING_HOLD';
          const isIssue = order.status === 'FAILED_BILLING' || order.status === 'MANUAL_REVIEW';
          const canSync = ['DISPATCHED_TO_SUPPLIER', 'SUPPLIER_PROCESSING', 'SHIPPED'].includes(order.status);

          return (
            <TableRow key={order.id} onClick={() => navigate(`/admin/orders/${order.id}`)}>
              <TableCell>
                <div className="font-bold text-slate-900 font-mono">{order.shopifyOrderNumber}</div>
                {order.items && order.items.length > 0 && (
                  <p className="text-[11px] text-slate-500 font-normal">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </p>
                )}
              </TableCell>
              <TableCell className="text-xs text-slate-500">{formatDate(order.shopifyCreatedAt)}</TableCell>
              <TableCell>
                <div className="text-xs">
                  <p className="font-semibold text-slate-900">{order.shippingName}</p>
                  <p className="text-slate-500 text-[11px]">{order.customerEmail}</p>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <Badge status={order.status} />
                  {order.lastErrorReason && (
                    <p className="text-[10px] text-rose-600 font-semibold truncate max-w-[130px] mt-0.5" title={order.lastErrorReason}>
                      {order.lastErrorReason}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {isHold ? (
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <Clock className="w-3 h-3 text-amber-600" />
                    {hold.formatted}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </TableCell>
              <TableCell>
                <div className="text-xs">
                  <span className="font-semibold text-slate-700">{order.supplierType || 'CJ'}</span>
                  {(order.supplierOrderNumber || order.supplierOrderId) && (
                    <p className="font-mono text-[10px] text-teal-600 truncate max-w-[110px]" title={order.supplierOrderNumber || order.supplierOrderId || ''}>
                      {order.supplierOrderNumber || order.supplierOrderId}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className="font-bold text-teal-700 text-xs font-mono">
                {formatCurrency(order.totalPrice, order.currency)}
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1.5">
                  {isHold && onReleaseHold && (
                    <button
                      onClick={() => handleRelease(order)}
                      disabled={releasingId === order.id}
                      title="Skip 6-hour hold and dispatch immediately to factory"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition-colors shadow-xs"
                    >
                      <Zap className={`w-3 h-3 text-teal-600 ${releasingId === order.id ? 'animate-bounce' : ''}`} />
                      {releasingId === order.id ? 'Shipping...' : 'Ship Now'}
                    </button>
                  )}
                  {isIssue && onRetryOrder && (
                    <button
                      onClick={() => onRetryOrder(order)}
                      title="Retry factory dispatch"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors shadow-xs"
                    >
                      <RotateCcw className="w-3 h-3 text-amber-600" />
                      Retry
                    </button>
                  )}
                  {canSync && onSyncOrder && (
                    <button
                      onClick={() => handleSync(order)}
                      disabled={syncingId === order.id}
                      title="Sync live status and tracking from CJ Dropshipping"
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors"
                    >
                      <RefreshCw className={`w-3 h-3 text-slate-500 ${syncingId === order.id ? 'animate-spin' : ''}`} />
                      Sync CJ
                    </button>
                  )}
                  {onRetryOrder && (
                    <button
                      onClick={() => onRetryOrder(order)}
                      title="Open order actions & fulfillment routing"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
                    >
                      <SlidersHorizontal className="w-3 h-3 text-slate-500" />
                      Actions
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                    className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                    title="View order details"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
