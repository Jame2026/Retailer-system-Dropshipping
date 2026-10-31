import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { Trash2, Plus, Minus } from 'lucide-react';
import { CartItem } from '../../context/CartContext.js';

export interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  return (
    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3.5 shadow-sm">
      <img
        src={item.image}
        alt={item.title}
        className="w-16 h-16 rounded-xl object-contain bg-white border border-slate-200 p-1 shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h4>
        <p className="text-[11px] font-mono text-slate-500 mt-0.5">SKU: {item.sku}</p>
        <p className="text-xs font-black text-teal-700 font-mono mt-1">
          {formatCurrency(item.price)}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <button
          onClick={() => onRemove(item.id)}
          className="text-slate-400 hover:text-rose-600 p-1"
          title="Remove item"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-2 py-0.5 text-xs font-mono">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="text-slate-500 hover:text-slate-900"
            title="Decrease quantity"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="font-bold text-slate-800">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="text-slate-500 hover:text-slate-900"
            title="Increase quantity"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
