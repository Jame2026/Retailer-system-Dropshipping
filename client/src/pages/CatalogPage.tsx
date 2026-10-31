import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, NavLink } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer.js';
import { SkuMappingTable } from '../components/modules/catalog/SkuMappingTable.js';
import { SkuMappingModal } from '../components/modules/catalog/SkuMappingModal.js';
import { CatalogSummaryCards } from '../components/modules/catalog/CatalogSummaryCards.js';
import { CatalogHowItWorks } from '../components/modules/catalog/CatalogHowItWorks.js';
import { useSkuMappings } from '../hooks/useSkuMappings.js';
import { catalogService } from '../services/catalogService.js';
import { useNotification } from '../context/NotificationContext.js';
import { Button } from '../components/common/Button.js';
import { SkuMapping } from '../types/catalog.types.js';
import { Plus, Search, ExternalLink, RefreshCw } from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const { showToast } = useNotification();
  const [searchParams] = useSearchParams();
  const { mappings, loading, refresh } = useSkuMappings();
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<Partial<SkuMapping> | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CJ' | 'BACKUP'>('ALL');
  const [defaultPricing, setDefaultPricing] = useState({ multiplier: 2.5, buffer: 3.0 });

  useEffect(() => {
    catalogService.getPricingRules().then((r) => {
      if (r) setDefaultPricing({ multiplier: r.globalMultiplier || 2.5, buffer: r.shippingBuffer || 3.0 });
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const newSku = searchParams.get('newSku');
    if (!newSku) return;
    setEditingMapping({
      storeSku: newSku, productName: searchParams.get('name') || '', primarySupplier: 'CJ',
      primarySupplierSku: newSku, primaryCostPrice: Number(searchParams.get('cost')) || 10.0,
      primaryShippingCost: 3.5, backupSupplier: 'ZENDROP', backupSupplierSku: '',
      backupCostPrice: (Number(searchParams.get('cost')) || 10.0) + 1.0,
      markupMultiplier: defaultPricing.multiplier, shippingBufferUsd: defaultPricing.buffer,
      productImage: searchParams.get('image') || '', isActive: true,
    });
    setIsMappingModalOpen(true);
  }, [searchParams, defaultPricing]);

  const filteredMappings = useMemo(() => {
    return mappings.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.productName.toLowerCase().includes(q) ||
        m.storeSku.toLowerCase().includes(q) ||
        (m.primarySupplierSku && m.primarySupplierSku.toLowerCase().includes(q));

      if (!matchesSearch) return false;
      if (activeFilter === 'CJ') return m.primarySupplier === 'CJ';
      if (activeFilter === 'BACKUP') return !!m.backupSupplier;
      return true;
    });
  }, [mappings, searchQuery, activeFilter]);

  const cjConnectedCount = mappings.filter((m) => m.primarySupplier === 'CJ').length;
  const backupProtectedCount = mappings.filter((m) => !!m.backupSupplier).length;

  const handleOpenCreateMapping = () => {
    setEditingMapping({
      storeSku: '', productName: '', primarySupplier: 'CJ', primarySupplierSku: '',
      primaryCostPrice: 10.0, primaryShippingCost: 3.5, backupSupplier: 'ZENDROP', backupSupplierSku: '',
      backupCostPrice: 11.0, markupMultiplier: defaultPricing.multiplier,
      shippingBufferUsd: defaultPricing.buffer, isActive: true,
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
      showToast(
        'success',
        'Product Price & Rule Saved',
        `SKU ${editingMapping.storeSku} price saved as $${Number(editingMapping.calculatedSellingPrice || 0).toFixed(2)}.`
      );
      setIsMappingModalOpen(false);
      refresh();
    } catch (err: any) {
      showToast('error', 'Save Failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this product routing rule?')) return;
    try {
      await catalogService.deleteMapping(id);
      showToast('success', 'Rule Removed', 'The product routing rule was deleted.');
      refresh();
    } catch (err: any) {
      showToast('error', 'Delete Failed', err.message);
    }
  };

  return (
    <PageContainer
      title="Store Products & Supplier Routing"
      subtitle="Manage your store products, automated fulfillment with CJ Dropshipping, and profit margins"
      action={
        <div className="flex items-center gap-2">
          <NavLink to="/admin/cj-products">
            <Button variant="outline" size="sm" className="text-xs font-semibold">
              Browse CJ Marketplace <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </Button>
          </NavLink>
          <Button variant="primary" size="sm" onClick={handleOpenCreateMapping} className="text-xs font-semibold">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Custom Rule
          </Button>
        </div>
      }
    >
      <CatalogHowItWorks />

      <CatalogSummaryCards
        totalProducts={mappings.length} cjConnectedCount={cjConnectedCount}
        backupProtectedCount={backupProtectedCount} avgMarkup={2.5}
      />

      <div className="space-y-3 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Store Products</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
              {filteredMappings.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products or SKU..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500 w-52"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              {[
                { id: 'ALL', label: 'All Products' },
                { id: 'CJ', label: 'CJ Dropship' },
                { id: 'BACKUP', label: 'With Backup' },
              ].map((tab) => (
                <button
                  key={tab.id} onClick={() => setActiveFilter(tab.id as any)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${
                    activeFilter === tab.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <Button variant="ghost" size="sm" onClick={refresh} title="Refresh catalog" className="p-1.5 text-slate-500 hover:text-slate-900">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <SkuMappingTable
          mappings={filteredMappings} loading={loading}
          onEditMapping={(m) => { setEditingMapping(m); setIsMappingModalOpen(true); }}
          onDeleteMapping={handleDelete}
        />
      </div>

      <SkuMappingModal
        isOpen={isMappingModalOpen} onClose={() => setIsMappingModalOpen(false)}
        mapping={editingMapping} onChangeMapping={setEditingMapping}
        onSave={handleSaveMapping} saving={saving}
      />
    </PageContainer>
  );
};
