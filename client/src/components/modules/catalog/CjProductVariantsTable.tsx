import React from 'react';
import { Layers, Copy, Check } from 'lucide-react';
import { CjProductVariant } from '../../../types/catalog.types.js';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { FALLBACK_PRODUCT_IMAGE } from '../../../config/constants.js';

export interface CjProductVariantsTableProps {
  variants: CjProductVariant[];
  basePrice: number;
  copiedKey: string | null;
  onCopySku: (sku: string, key: string) => void;
}

export const CjProductVariantsTable: React.FC<CjProductVariantsTableProps> = ({
  variants,
  basePrice,
  copiedKey,
  onCopySku,
}) => {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="space-y-2">
      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
        <Layers className="w-3.5 h-3.5 text-teal-600" />
        Available Factory Variants ({variants.length})
      </h5>
      <div className="border border-slate-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
        <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
          <thead className="bg-slate-50 font-semibold text-slate-700 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2">Variant</th>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2 text-right">Factory Cost</th>
              <th className="px-3 py-2 text-right">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {variants.map((v) => {
              const sku = v.variantSku || '';
              const isCopied = copiedKey === v.vid;

              return (
                <tr key={v.vid} className="hover:bg-slate-50/50">
                  <td className="px-3 py-2 font-medium text-slate-900 flex items-center gap-2">
                    {v.variantImage && (
                      <img
                        src={v.variantImage}
                        alt=""
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
                        }}
                        className="w-6 h-6 rounded object-cover border border-slate-200"
                      />
                    )}
                    <span>{v.variantName}</span>
                  </td>
                  <td className="px-3 py-2 font-mono text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span>{sku || '-'}</span>
                      {sku && (
                        <button
                          type="button"
                          onClick={() => onCopySku(sku, v.vid)}
                          className="p-1 rounded hover:bg-slate-200/70 text-slate-400 hover:text-teal-700 transition-colors"
                          title={`Copy SKU: ${sku}`}
                          aria-label={`Copy SKU: ${sku}`}
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 font-mono font-bold text-teal-700 text-right">
                    {formatCurrency(v.variantPrice || basePrice)}
                  </td>
                  <td className="px-3 py-2 font-mono text-right text-slate-600">
                    {v.inventory || 'In Stock'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
