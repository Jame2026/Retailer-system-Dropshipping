import { Order } from '../../../types/order.types.js';

export interface DashboardRow {
  id: string;
  orderNumber: string;
  customer: string;
  avatarUrl: string;
  countryCode: string;
  status: 'Issue' | 'Shipped' | 'Failed';
  total: string;
  action: 'Resolve' | 'Retry';
  rawOrder?: Order;
}
