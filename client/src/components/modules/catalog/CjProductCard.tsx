import React from 'react';
import { Card } from '../../common/Card.js';
import { Button } from '../../common/Button.js';
import { CheckCircle, Eye } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { calculateRetailPrice } from '../../../utils/pricing.js';
import { FALLBACK_PRODUCT_IMAGE } from '../../../config/constants.js';
import { CjProductListItem } from '../../../types/catalog.types.js';

export interface CjProductCardProps {
  product: CjProductListItem;
  onOpenDetail: (id: string) => void;
  badgeText?: string;
  className?: string;
}

export const CjProductCard: React.FC<CjProductCardProps> = ({
  product,
  onOpenDetail,
  badgeText = 'In Store',
  className = '',
}) => {
  const productId = product.id || product.pid || '';
  const wholesaleCost = product.wholesaleCost ?? product.sellPrice ?? 10.0;
  const retailPrice = product.price ?? product.retailPrice ?? calculateRetailPrice(wholesaleCost);
  const imageUrl = product.image || product.productImage || FALLBACK_PRODUCT_IMAGE;
  const title = product.title || product.productName || 'Unnamed Product';

  return (
    <Card
      hoverEffect
      className={`flex flex-col justify-between p-3.5 border-slate-200 hover:border-teal-400 transition-all rounded-2xl group shadow-sm ${className}`}
    >
      <div className="space-y-2.5">
        <div
          className="h-44 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-2 relative cursor-pointer"
          onClick={() => onOpenDetail(productId)}
        >
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
            }}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
          />
          {product.tag && (
            <span
              className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm flex items-center gap-1 ${
                product.tag.includes('Trending')
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white'
                  : product.tag.includes('Popular')
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : 'bg-teal-600 text-white'
              }`}
            >
              {product.tag}
            </span>
          )}
          {product.pid && (
            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-white/90 border border-slate-200 text-[10px] font-mono font-bold text-slate-700 shadow-xs">
              PID: {String(product.pid).slice(-6)}
            </div>
          )}
        </div>

        <div>
          {product.category && (
            <span
              className="text-[10px] uppercase font-bold text-teal-700 tracking-wider block mb-1 truncate"
              title={product.category}
            >
              {product.category}
            </span>
          )}
          <h4
            className="text-xs font-semibold text-slate-900 line-clamp-2 leading-relaxed cursor-pointer hover:text-teal-700"
            onClick={() => onOpenDetail(productId)}
            title={title}
          >
            {title}
          </h4>

          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-base font-bold text-teal-700 font-mono">
              {formatCurrency(retailPrice)}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Cost: {formatCurrency(wholesaleCost)}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>{badgeText}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="text-xs h-8 px-3 text-slate-700 hover:bg-slate-50"
          onClick={() => onOpenDetail(productId)}
        >
          <Eye className="w-3.5 h-3.5 mr-1 text-slate-400" />
          Details
        </Button>
      </div>
    </Card>
  );
};
