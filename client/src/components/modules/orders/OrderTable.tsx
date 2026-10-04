import React from 'react';
import { Order } from '../../../types/order.types.js';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../common/Table.js';
import { Badge } from '../../common/Badge.js';
import { Button } from '../../common/Button.js';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { formatDate, formatTimeRemaining } from '../../../utils/formatDate.js';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, RotateCcw, Clock } from 'lucide-react';

export interface OrderTableProps {
  orders: Order[];
  loading?: boolean;
  onRetryOrder?: (order: Order) => void;
}

export const OrderTable: React.FC<OrderTableProps> = ({ orders, loading, onRetryOrder }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold">Loading Dropship Orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="w-full py-16 border border-slate-800 rounded-2xl bg-slate-900/40 text-center">
        <p className="text-slate-400 text-sm font-medium">No orders found matching the filter criteria.</p>
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
          <TableHead>Hold Countdown</TableHead>
          <TableHead>Supplier</TableHead>
          <TableHead>Total</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const hold = formatTimeRemaining(order.holdExpiresAt);
          return (
            <TableRow key={order.id} onClick={() => navigate(`/orders/${order.id}`)}>
              <TableCell className="font-bold text-white font-mono">
                {order.shopifyOrderNumber}
              </TableCell>
              <TableCell className="text-xs text-slate-400">
                {formatDate(order.shopifyCreatedAt)}
              </TableCell>
              <TableCell>
                <div className="text-xs">
                  <p className="font-semibold text-slate-200">{order.shippingName}</p>
                  <p className="text-slate-400 text-[11px]">{order.customerEmail}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge status={order.status} />
              </TableCell>
              <TableCell>
                {order.status === 'PENDING_HOLD' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    <Clock className="w-3 h-3" />
                    {hold.formatted}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">—</span>
                )}
              </TableCell>
              <TableCell>
                <span className="text-xs font-semibold text-slate-300">
                  {order.supplierType || 'CJ (Auto)'}
                </span>
              </TableCell>
              <TableCell className="font-bold text-teal-400 text-xs font-mono">
                {formatCurrency(order.totalPrice, order.currency)}
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1.5">
                  {(order.status === 'FAILED_BILLING' ||
                    order.status === 'MANUAL_REVIEW' ||
                    order.status === 'PENDING_HOLD') &&
                    onRetryOrder && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onRetryOrder(order)}
                        className="text-xs py-1 px-2.5"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Override
                      </Button>
                    )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="text-xs py-1 px-2 text-slate-400 hover:text-white"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
