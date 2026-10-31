import React from 'react';
import { Card } from '../../common/Card.js';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { PackageCheck, ShieldCheck, Package } from 'lucide-react';

export interface OrderItemData {
  id: string;
  title: string;
  storeSku: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  skuMapping?: {
    primarySupplierSku: string;
  } | null;
}

export interface OrderItemsCardProps {
  items?: OrderItemData[];
  totalPrice: number;
  currency?: string;
}

export const OrderItemsCard: React.FC<OrderItemsCardProps> = ({
  items = [],
  totalPrice,
  currency = 'USD',
}) => {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <PackageCheck className="w-4 h-4 text-teal-600" />
          Ordered Items ({items.length})
        </h3>
        <span className="text-xs font-mono text-teal-700 font-bold">
          Total: {formatCurrency(totalPrice, currency)}
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="space-y-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate max-w-md">{item.title}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                    SKU: {item.storeSku}
                  </span>
                  {item.skuMapping ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      <ShieldCheck className="w-3 h-3 text-teal-600" />
                      CJ Ref: {item.skuMapping.primarySupplierSku}
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      Auto-Fulfill with CJ
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-slate-900 font-mono">
                {formatCurrency(item.price)}
              </p>
              <p className="text-xs text-slate-500 font-medium">Qty: {item.quantity}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
