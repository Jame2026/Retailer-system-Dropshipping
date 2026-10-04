import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer.js';
import { SkuMappingTable } from '../components/modules/catalog/SkuMappingTable.js';
import { SourcingModal } from '../components/modules/catalog/SourcingModal.js';
import { useSkuMappings } from '../hooks/useSkuMappings.js';
import { catalogService } from '../services/catalogService.js';
import { useNotification } from '../context/NotificationContext.js';
import { Button } from '../components/common/Button.js';
import { Dialog } from '../components/common/Dialog.js';
import { Input } from '../components/common/Input.js';
import { SkuMapping } from '../types/catalog.types.js';
import { Plus, Sparkles } from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const { showToast } = useNotification();
  const { mappings, loading, refresh } = useSkuMappings();
  const [isSourcingModalOpen, setIsSourcingModalOpen] = useState(false);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<Partial<SkuMapping> | null>(null);
  const [saving, setSaving] = useState(false);

  const handleOpenCreateMapping = () => {
    setEditingMapping({
      storeSku: '',
      productName: '',
      primarySupplier: 'CJ',
      primarySupplierSku: '',
      primaryCostPrice: 10.0,
      primaryShippingCost: 3.5,
      backupSupplier: 'ZENDROP',
      backupSupplierSku: '',
      backupCostPrice: 11.0,
      markupMultiplier: 2.5,
      shippingBufferUsd: 3.0,
      isActive: true,
    });
    setIsMappingModalOpen(true);
  };

  const handleSaveMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMapping?.storeSku || !editingMapping?.productName) {
      showToast('warning', 'Missing Fields', 'Store SKU and Product Name are required.');
      return;
    }

    try {
      setSaving(true);
      await catalogService.saveMapping(editingMapping);
      showToast('success', 'Mapping Saved', `SKU ${editingMapping.storeSku} mapped successfully.`);
      setIsMappingModalOpen(false);
      refresh();
    } catch (err: any) {
      showToast('error', 'Save Failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this SKU mapping?')) return;
    try {
      await catalogService.deleteMapping(id);
      showToast('success', 'Mapping Removed', 'The SKU mapping was deleted.');
      refresh();
    } catch (err: any) {
      showToast('error', 'Delete Failed', err.message);
    }
  };

  return (
    <PageContainer
      title="SKU Mapping & Supplier Routing"
      subtitle="Connect store catalog variants to primary (CJ) and fallback (Zendrop) factory lines"
      action={
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSourcingModalOpen(true)}
            className="border-teal-300 text-teal-700 hover:bg-teal-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            1-Click Sourcing
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenCreateMapping}>
            <Plus className="w-3.5 h-3.5" />
            Add SKU Mapping
          </Button>
        </div>
      }
    >
      {/* Mappings Table */}
      <SkuMappingTable
        mappings={mappings}
        loading={loading}
        onEditMapping={(m) => {
          setEditingMapping(m);
          setIsMappingModalOpen(true);
        }}
        onDeleteMapping={handleDelete}
      />

      {/* Add / Edit Mapping Modal */}
      {isMappingModalOpen && editingMapping && (
        <Dialog
          isOpen={isMappingModalOpen}
          onClose={() => setIsMappingModalOpen(false)}
          title={editingMapping.id ? 'Edit SKU Mapping' : 'Map Store SKU to Suppliers'}
          description="Define primary Priority 1 (CJ) and backup Priority 2 (Zendrop) fulfillment routes."
          maxWidth="xl"
        >
          <form onSubmit={handleSaveMapping} className="space-y-4 text-slate-800">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Shopify Store SKU"
                value={editingMapping.storeSku || ''}
                onChange={(e) => setEditingMapping({ ...editingMapping, storeSku: e.target.value })}
                placeholder="e.g. RET-WATCH-001-SLV"
                required
              />
              <Input
                label="Product Title"
                value={editingMapping.productName || ''}
                onChange={(e) => setEditingMapping({ ...editingMapping, productName: e.target.value })}
                placeholder="Minimalist Watch - Silver"
                required
              />
            </div>

            {/* Primary Supplier Box */}
            <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 space-y-3">
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wide">
                Priority 1 — Primary Supplier (CJ Dropshipping)
              </span>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="CJ Supplier SKU / Vid"
                  value={editingMapping.primarySupplierSku || ''}
                  onChange={(e) =>
                    setEditingMapping({ ...editingMapping, primarySupplierSku: e.target.value })
                  }
                  placeholder="CJ-WATCH-SLV"
                  required
                />
                <Input
                  label="Base Cost ($)"
                  type="number"
                  step="0.01"
                  value={editingMapping.primaryCostPrice || ''}
                  onChange={(e) =>
                    setEditingMapping({ ...editingMapping, primaryCostPrice: Number(e.target.value) })
                  }
                  required
                />
                <Input
                  label="Shipping Cost ($)"
                  type="number"
                  step="0.01"
                  value={editingMapping.primaryShippingCost || ''}
                  onChange={(e) =>
                    setEditingMapping({
                      ...editingMapping,
                      primaryShippingCost: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            {/* Backup Supplier Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Priority 2 — Backup Supplier (Zendrop Fallback)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Zendrop Variant SKU (Optional)"
                  value={editingMapping.backupSupplierSku || ''}
                  onChange={(e) =>
                    setEditingMapping({ ...editingMapping, backupSupplierSku: e.target.value })
                  }
                  placeholder="ZD-WATCH-SLV"
                />
                <Input
                  label="Backup Base Cost ($)"
                  type="number"
                  step="0.01"
                  value={editingMapping.backupCostPrice || ''}
                  onChange={(e) =>
                    setEditingMapping({ ...editingMapping, backupCostPrice: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            {/* Pricing Formula */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Markup Multiplier"
                type="number"
                step="0.1"
                value={editingMapping.markupMultiplier || 2.5}
                onChange={(e) =>
                  setEditingMapping({ ...editingMapping, markupMultiplier: Number(e.target.value) })
                }
              />
              <Input
                label="Shipping Buffer ($ USD)"
                type="number"
                step="0.5"
                value={editingMapping.shippingBufferUsd || 3.0}
                onChange={(e) =>
                  setEditingMapping({ ...editingMapping, shippingBufferUsd: Number(e.target.value) })
                }
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setIsMappingModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={saving}>
                Save Mapping
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* 1-Click Sourcing Modal */}
      <SourcingModal
        isOpen={isSourcingModalOpen}
        onClose={() => setIsSourcingModalOpen(false)}
        onSuccess={refresh}
      />
    </PageContainer>
  );
};
