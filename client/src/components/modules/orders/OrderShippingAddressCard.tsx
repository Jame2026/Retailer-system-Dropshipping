import React from 'react';
import { Card } from '../../common/Card.js';
import { Button } from '../../common/Button.js';
import { MapPin, Edit2, Truck } from 'lucide-react';

export interface OrderShippingAddressCardProps {
  shippingName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  shippingAddress1?: string | null;
  shippingAddress2?: string | null;
  shippingCity?: string | null;
  shippingProvince?: string | null;
  shippingZip?: string | null;
  shippingCountry?: string | null;
  shippingCountryCode?: string | null;
  onEdit: () => void;
}

export const OrderShippingAddressCard: React.FC<OrderShippingAddressCardProps> = ({
  shippingName, customerEmail, customerPhone, shippingAddress1, shippingAddress2,
  shippingCity, shippingProvince, shippingZip, shippingCountry, shippingCountryCode, onEdit,
}) => {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-teal-600" />
          Shipping Address
        </h3>
        <Button variant="outline" size="sm" onClick={onEdit} className="text-xs py-1">
          <Edit2 className="w-3 h-3" />
          Edit Address
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <p className="text-slate-500 uppercase font-semibold text-[10px]">Recipient</p>
          <p className="text-sm font-bold text-slate-900 mt-0.5">{shippingName || '—'}</p>
          <p className="text-slate-600 mt-0.5">{customerEmail || 'No Email'}</p>
          <p className="text-slate-500 font-mono mt-0.5">{customerPhone || 'No Phone'}</p>
        </div>

        <div>
          <p className="text-slate-500 uppercase font-semibold text-[10px]">Address</p>
          <p className="text-slate-800 mt-0.5 font-medium">{shippingAddress1 || '—'}</p>
          {shippingAddress2 && <p className="text-slate-500 font-medium">{shippingAddress2}</p>}
          <p className="text-slate-900 mt-0.5 font-bold">{shippingCity}, {shippingProvince} {shippingZip}</p>
          <p className="text-slate-500">{shippingCountry}</p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-500">Destination: <strong className="text-slate-800">{shippingCountry || 'US'}</strong></span>
        <a
          href={`/admin/shipping?country=${shippingCountryCode || 'US'}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg border border-teal-200 transition-colors"
        >
          <Truck className="w-3.5 h-3.5" />
          Check Live Shipping Rates →
        </a>
      </div>
    </Card>
  );
};
