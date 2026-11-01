import { Order } from '../../../types/order.types.js';
import { DashboardRow } from './dashboard.types.js';

export function mapOrderToDashboardRow(o: Order): DashboardRow {
  let statusLabel: DashboardRow['status'] = 'Issue';
  let actionLabel: DashboardRow['action'] = 'Resolve';

  if (o.status === 'SHIPPED' || o.status === 'DELIVERED') {
    statusLabel = 'Shipped';
    actionLabel = 'Retry';
  } else if (['DISPATCHED_TO_SUPPLIER', 'PROCESSING', 'SUPPLIER_PROCESSING'].includes(o.status)) {
    statusLabel = 'Processing';
    actionLabel = 'Sync';
  } else if (o.status === 'PENDING_HOLD') {
    statusLabel = 'Hold';
    actionLabel = 'Resolve';
  } else if (o.status === 'CANCELLED') {
    statusLabel = 'Cancelled';
    actionLabel = 'Retry';
  } else if (o.status === 'FAILED_BILLING') {
    statusLabel = 'Failed';
    actionLabel = 'Resolve';
  }

  const orderNum = o.shopifyOrderNumber || o.orderNumber || `#${o.id.slice(0, 5)}`;
  return {
    id: o.id,
    orderNumber: orderNum,
    customer: o.shippingName || o.customerEmail || 'Customer',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop&crop=face',
    countryCode: o.shippingCountryCode || 'US',
    status: statusLabel,
    total: `$${Number(o.totalPrice || 0).toFixed(2)}`,
    action: actionLabel,
    rawOrder: o,
  };
}

export function exportOrdersToCsv(rows: DashboardRow[]): void {
  const csvContent =
    'data:text/csv;charset=utf-8,Order,Customer,Country,Status,Total\n' +
    rows.map((r) => `${r.orderNumber},"${r.customer}",${r.countryCode},${r.status},${r.total}`).join('\n');
  const link = document.createElement('a');
  link.href = encodeURI(csvContent);
  link.download = `dropship_orders_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}

