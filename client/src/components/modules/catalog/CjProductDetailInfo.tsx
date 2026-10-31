import React from 'react';
import { NavLink } from 'react-router-dom';
import { CheckCircle, Copy, Check } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { CjProductDetail } from '../../../types/catalog.types.js';

export interface CjProductDetailInfoProps {
  productDetail: CjProductDetail;
  mainSku: string;
  sellPrice: number;
  retailPrice: number;
  copiedKey: string | null;
  onCopySku: (sku: string, key: string) => void;
}

export const CjProductDetailInfo: React.FC<CjProductDetailInfoProps> = ({
  productDetail,
  mainSku,
  sellPrice,
  retailPrice,
  copiedKey,
  onCopySku,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <span className="text-slate-500 font-medium">Product SKU:</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
              {mainSku}
            </span>
            <button
              type="button"
              onClick={() => onCopySku(mainSku, 'meta')}
              className="p-1 rounded-md text-slate-500 hover:text-teal-700 hover:bg-slate-200/60 transition-colors"
              title="Copy SKU number"
              aria-label="Copy SKU number"
            >
              {copiedKey === 'meta' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Factory Base Price:</span>
          <span className="font-mono font-bold text-slate-900 text-base">
            {formatCurrency(sellPrice)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Store Retail Price:</span>
          <span className="font-mono font-bold text-teal-700 text-base">
            {formatCurrency(retailPrice)}
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <span className="text-slate-500">Category:</span>
          <span className="font-semibold text-slate-800">
            {productDetail.categoryName || 'General'}
          </span>
        </div>
        {productDetail.productWeight && (
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Weight:</span>
            <span className="font-mono text-slate-800">{productDetail.productWeight} g</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <NavLink
          to={`/admin/catalog?newSku=${mainSku}&name=${encodeURIComponent(productDetail.productName)}&cost=${sellPrice}&image=${encodeURIComponent(productDetail.productImage || '')}`}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold transition-all"
        >
          <span>🏷️ Set Custom Store Price & Rules</span>
        </NavLink>

        <NavLink
          to={`/admin/shipping?vid=${productDetail.variants?.[0]?.vid || ''}`}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 hover:border-teal-300 text-xs font-semibold transition-all"
        >
          <span>🚚 Check Live Shipping Freight & Times</span>
        </NavLink>

        <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Automatically Active in Store</span>
        </div>
      </div>
    </div>
  );
};
