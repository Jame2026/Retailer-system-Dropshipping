import React from 'react';
import { SkuMapping } from '../../../types/catalog.types.js';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../common/Table.js';
import { Badge } from '../../common/Badge.js';
import { Button } from '../../common/Button.js';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { Edit2, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';

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
      <div className="w-full py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold">Loading SKU Mappings...</p>
      </div>
    );
  }

  if (mappings.length === 0) {
    return (
      <div className="w-full py-16 border border-slate-800 rounded-2xl bg-slate-900/40 text-center">
        <p className="text-slate-400 text-sm font-medium">No SKU mappings created yet.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Store SKU & Product</TableHead>
          <TableHead>Primary Supplier (P1)</TableHead>
          <TableHead>Backup Supplier (P2)</TableHead>
          <TableHead>Markup Multiplier</TableHead>
          <TableHead>Selling Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mappings.map((mapping) => (
          <TableRow key={mapping.id}>
            <TableCell>
              <div>
                <p className="font-mono font-bold text-teal-400 text-xs">{mapping.storeSku}</p>
                <p className="text-xs text-slate-200 mt-0.5 line-clamp-1">{mapping.productName}</p>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  {mapping.primarySupplier}: {mapping.primarySupplierSku}
                </span>
                <span className="text-[11px] text-slate-400">
                  Cost: {formatCurrency(mapping.primaryCostPrice)} + Shipping: {formatCurrency(mapping.primaryShippingCost)}
                </span>
              </div>
            </TableCell>
            <TableCell>
              {mapping.backupSupplier ? (
                <div className="text-xs">
                  <span className="font-semibold text-slate-300">
                    {mapping.backupSupplier}: {mapping.backupSupplierSku || 'Mapped'}
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Cost: {formatCurrency(mapping.backupCostPrice || mapping.primaryCostPrice)}
                  </p>
                </div>
              ) : (
                <span className="text-xs text-slate-500 italic">No Backup Configured</span>
              )}
            </TableCell>
            <TableCell className="font-mono text-xs text-slate-300 font-semibold">
              {mapping.markupMultiplier}x (+{formatCurrency(mapping.shippingBufferUsd)})
            </TableCell>
            <TableCell className="font-mono font-bold text-white text-xs">
              {formatCurrency(mapping.calculatedSellingPrice)}
            </TableCell>
            <TableCell>
              <Badge
                variant={mapping.isActive ? 'success' : 'default'}
                label={mapping.isActive ? 'Active' : 'Disabled'}
              />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                {onEditMapping && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditMapping(mapping)}
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                )}
                {onDeleteMapping && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteMapping(mapping.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
