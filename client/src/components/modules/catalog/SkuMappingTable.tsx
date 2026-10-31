import React from 'react';
import { SkuMapping } from '../../../types/catalog.types.js';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../common/Table.js';
import { Button } from '../../common/Button.js';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { Edit2, Trash2, ShieldCheck, Zap, Package, ExternalLink } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export interface SkuMappingTableProps {
  mappings: SkuMapping[];
  loading?: boolean;
  onEditMapping?: (mapping: SkuMapping) => void;
  onDeleteMapping?: (id: string) => void;
}

export const SkuMappingTable: React.FC<SkuMappingTableProps> = ({
  mappings,
  loading,
  onEditMapping,
  onDeleteMapping,
}) => {
  if (loading) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-slate-500 gap-3">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold">Loading Store Products...</p>
      </div>
    );
  }

  if (mappings.length === 0) {
    return (
      <div className="w-full py-16 border border-slate-200 rounded-2xl bg-white text-center shadow-xs p-6 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 mx-auto flex items-center justify-center">
          <Package className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">No Store Products Found</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          All CJ Dropshipping products automatically sync to your store. Browse CJ marketplace or add custom product rules.
        </p>
        <NavLink to="/admin/cj-products">
          <Button variant="primary" size="sm" className="mt-2 text-xs">
            Browse CJ Products <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </Button>
        </NavLink>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[28%] min-w-[210px]">Store Product</TableHead>
            <TableHead className="w-[18%] min-w-[150px]">Connected Supplier</TableHead>
            <TableHead className="w-[14%] min-w-[120px]">Backup Protection</TableHead>
            <TableHead className="w-[18%] min-w-[140px]">Pricing & Profit</TableHead>
            <TableHead className="w-[16%] min-w-[140px]">Fulfillment Status</TableHead>
            <TableHead className="w-[6%] min-w-[70px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mappings.map((mapping) => {
            const totalCost = (mapping.primaryCostPrice || 0) + (mapping.primaryShippingCost || 0);
            const profit = Math.max(0, mapping.calculatedSellingPrice - totalCost);
            const margin = mapping.calculatedSellingPrice > 0 ? Math.round((profit / mapping.calculatedSellingPrice) * 100) : 0;

            return (
              <TableRow key={mapping.id}>
                <TableCell className="max-w-[220px]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {mapping.productImage ? (
                        <img src={mapping.productImage} alt={mapping.productName} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-900 font-bold truncate max-w-[170px]" title={mapping.productName}>
                        {mapping.productName}
                      </p>
                      <span className="font-mono text-[10px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200/60 inline-block mt-0.5">
                        SKU: {mapping.storeSku}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="text-xs space-y-0.5 whitespace-nowrap">
                    <div className="flex items-center gap-1 font-bold text-slate-900">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                      <span>{mapping.primarySupplier === 'CJ' ? 'CJ Dropshipping' : mapping.primarySupplier}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono truncate max-w-[140px]" title={mapping.primarySupplierSku}>
                      Ref: {mapping.primarySupplierSku || 'Auto-Sync'}
                    </p>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Wholesale: <strong className="text-slate-900 font-semibold">{formatCurrency(mapping.primaryCostPrice)}</strong>
                    </p>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="whitespace-nowrap">
                    {mapping.backupSupplier ? (
                      <div className="text-xs space-y-0.5">
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          {mapping.backupSupplier}
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Cost: {formatCurrency(mapping.backupCostPrice || mapping.primaryCostPrice)}
                        </p>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200 text-[11px] font-medium">
                        Direct CJ
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="text-xs space-y-1 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-slate-900 font-mono text-sm">
                        {formatCurrency(mapping.calculatedSellingPrice)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({mapping.markupMultiplier}x)
                      </span>
                    </div>
                    <div className="whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        +{formatCurrency(profit)} ({margin}%)
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      mapping.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${mapping.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                      {mapping.isActive ? 'Auto-Dispatch Ready' : 'Paused'}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {onEditMapping && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditMapping(mapping)}
                        title="Edit product rule & supplier"
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {onDeleteMapping && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteMapping(mapping.id)}
                        title="Remove custom rule"
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
