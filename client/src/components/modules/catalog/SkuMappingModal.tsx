import React from 'react';
import { Dialog } from '../../common/Dialog.js';
import { Input } from '../../common/Input.js';
import { Button } from '../../common/Button.js';
import { SkuMapping } from '../../../types/catalog.types.js';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { Zap, ShieldCheck, DollarSign } from 'lucide-react';

export interface SkuMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapping: Partial<SkuMapping> | null;
  onChangeMapping: (updated: Partial<SkuMapping>) => void;
  onSave: (e: React.FormEvent) => void;
  saving: boolean;
}

export const SkuMappingModal: React.FC<SkuMappingModalProps> = ({
  isOpen,
  onClose,
  mapping,
  onChangeMapping,
  onSave,
  saving,
}) => {
  if (!isOpen || !mapping) return null;

  const baseCost = Number(mapping.primaryCostPrice || 0);
  const shippingCost = Number(mapping.primaryShippingCost || 0);
  const multiplier = Number(mapping.markupMultiplier || 2.5);
  const buffer = Number(mapping.shippingBufferUsd || 3.0);
  const totalCost = baseCost + shippingCost;
  const rawSelling = totalCost * multiplier + buffer;
  const formulaSelling = rawSelling > 0 ? Math.floor(rawSelling) + 0.99 : 0;
  const currentSelling = mapping.calculatedSellingPrice !== undefined && mapping.calculatedSellingPrice > 0
    ? Number(mapping.calculatedSellingPrice)
    : formulaSelling;
  const estProfit = Math.max(0, currentSelling - totalCost);
  const estMargin = currentSelling > 0 ? Math.round((estProfit / currentSelling) * 100) : 0;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={mapping.id ? 'Edit Product & Supplier Routing' : 'Add Product Routing Rule'}
      description="Connect your store product to CJ Dropshipping for automated order fulfillment."
      maxWidth="xl"
    >
      <form onSubmit={onSave} className="space-y-4 text-slate-800">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Store SKU (Product Code)"
            value={mapping.storeSku || ''}
            onChange={(e) => onChangeMapping({ ...mapping, storeSku: e.target.value })}
            placeholder="e.g. CJ-DEMO-LAMP"
            required
          />
          <Input
            label="Product Title"
            value={mapping.productName || ''}
            onChange={(e) => onChangeMapping({ ...mapping, productName: e.target.value })}
            placeholder="e.g. Wireless RGB Lamp"
            required
          />
        </div>

        <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 uppercase tracking-wide">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            Main Supplier (CJ Dropshipping)
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Supplier SKU / ID"
              value={mapping.primarySupplierSku || ''}
              onChange={(e) => onChangeMapping({ ...mapping, primarySupplierSku: e.target.value })}
              placeholder="e.g. CJ-WATCH-01"
              required
            />
            <Input
              label="Wholesale Cost ($)"
              type="number"
              step="0.01"
              value={mapping.primaryCostPrice ?? ''}
              onChange={(e) => onChangeMapping({ ...mapping, primaryCostPrice: Number(e.target.value) })}
              required
            />
            <Input
              label="Supplier Shipping ($)"
              type="number"
              step="0.01"
              value={mapping.primaryShippingCost ?? ''}
              onChange={(e) => onChangeMapping({ ...mapping, primaryShippingCost: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            Backup Supplier (Failover Protection - Optional)
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Backup SKU"
              value={mapping.backupSupplierSku || ''}
              onChange={(e) => onChangeMapping({ ...mapping, backupSupplierSku: e.target.value })}
              placeholder="ZD-WATCH-01"
            />
            <Input
              label="Backup Cost ($)"
              type="number"
              step="0.01"
              value={mapping.backupCostPrice ?? ''}
              onChange={(e) => onChangeMapping({ ...mapping, backupCostPrice: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Markup Multiplier"
            type="number"
            step="0.1"
            value={mapping.markupMultiplier ?? 2.5}
            onChange={(e) => {
              const m = Number(e.target.value);
              const p = Math.floor(totalCost * m + buffer) + 0.99;
              onChangeMapping({ ...mapping, markupMultiplier: m, calculatedSellingPrice: p });
            }}
          />
          <Input
            label="Shipping Buffer ($)"
            type="number"
            step="0.5"
            value={mapping.shippingBufferUsd ?? 3.0}
            onChange={(e) => {
              const b = Number(e.target.value);
              const p = Math.floor(totalCost * multiplier + b) + 0.99;
              onChangeMapping({ ...mapping, shippingBufferUsd: b, calculatedSellingPrice: p });
            }}
          />
          <Input
            label="Selling Price ($ USD)"
            type="number"
            step="0.01"
            value={mapping.calculatedSellingPrice !== undefined ? mapping.calculatedSellingPrice : formulaSelling}
            onChange={(e) => onChangeMapping({ ...mapping, calculatedSellingPrice: Number(e.target.value) })}
            required
            helperText="Manual retail price"
          />
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-600" />
              Live Retail Price
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-base font-extrabold text-slate-900 font-mono">
                {formatCurrency(currentSelling)}
              </span>
              <button
                type="button"
                onClick={() => onChangeMapping({ ...mapping, calculatedSellingPrice: formulaSelling })}
                className="text-[10px] text-teal-700 hover:text-teal-900 underline font-semibold cursor-pointer"
              >
                Reset to formula ({formatCurrency(formulaSelling)})
              </button>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Net Profit
            </span>
            <p className="text-base font-black text-emerald-700 font-mono">
              +{formatCurrency(estProfit)}{' '}
              <span className="text-xs font-bold text-emerald-800">({estMargin}%)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={saving}>
            Save Product Rule
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
