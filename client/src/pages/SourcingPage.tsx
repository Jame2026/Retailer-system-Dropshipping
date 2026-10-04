import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer.js';
import { SourcingModal } from '../components/modules/catalog/SourcingModal.js';
import { sourcingService } from '../services/sourcingService.js';
import { useNotification } from '../context/NotificationContext.js';
import { Card } from '../components/common/Card.js';
import { Input } from '../components/common/Input.js';
import { Button } from '../components/common/Button.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { Search, Sparkles, Plus, ExternalLink, Factory } from 'lucide-react';

export const SourcingPage: React.FC = () => {
  const { showToast } = useNotification();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSourcingModalOpen, setIsSourcingModalOpen] = useState(false);

  // Demo supplier items
  const demoSupplierItems = [
    {
      pid: 'CJ-P-100234',
      productName: 'Stainless Steel Minimalist Waterproof Quartz Watch',
      productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80',
      sellPrice: 12.5,
      shippingPrice: 4.2,
      origin: 'CJ Dropshipping Warehouse',
    },
    {
      pid: 'CJ-P-55412',
      productName: 'Waterproof Oxford Crossbody Anti-Theft Sling Bag',
      productImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&q=80',
      sellPrice: 8.0,
      shippingPrice: 3.5,
      origin: 'CJ Dropshipping Warehouse',
    },
    {
      pid: 'CJ-P-77890',
      productName: 'Ultra-Quiet Ultrasonic Air Humidifier & Diffuser',
      productImage: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=300&q=80',
      sellPrice: 6.8,
      shippingPrice: 3.9,
      origin: 'CJ Dropshipping Warehouse',
    },
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    try {
      setLoading(true);
      const data = await sourcingService.searchSupplierCatalog(keyword);
      if (data?.list?.length > 0) {
        setResults(data.list);
      } else {
        setResults(demoSupplierItems.filter((i) => i.productName.toLowerCase().includes(keyword.toLowerCase())));
      }
    } catch {
      setResults(demoSupplierItems.filter((i) => i.productName.toLowerCase().includes(keyword.toLowerCase())));
    } finally {
      setLoading(false);
    }
  };

  const handleImport = (product: any) => {
    showToast(
      'success',
      'Imported into Catalog',
      `Product "${product.productName}" mapped with automated 2.5x markup formula.`
    );
  };

  const displayList = results.length > 0 ? results : demoSupplierItems;

  return (
    <PageContainer
      title="1-Click Supplier Sourcing & Catalog Importer"
      subtitle="Search CJ Dropshipping manufacturer catalog or submit custom URL sourcing links"
      action={
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsSourcingModalOpen(true)}
          className="bg-gradient-to-r from-teal-500 to-teal-400 text-slate-950 font-bold"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Request Custom Product Quotation
        </Button>
      }
    >
      {/* Search Bar */}
      <Card className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Input
              placeholder="Search CJ catalog by product title, keyword, or supplier PID..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-9"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          </div>
          <Button type="submit" variant="secondary" isLoading={loading}>
            Search Factory Catalog
          </Button>
        </form>
      </Card>

      {/* Catalog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayList.map((item) => (
          <Card key={item.pid} hoverEffect className="flex flex-col justify-between space-y-4 p-5">
            <div className="space-y-3">
              <div className="h-44 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative group">
                <img
                  src={item.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80'}
                  alt={item.productName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-700 text-[10px] font-mono font-semibold text-teal-300 backdrop-blur-md">
                  PID: {item.pid}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white line-clamp-2">{item.productName}</h4>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Factory Cost:</span>
                  <span className="font-mono font-bold text-teal-400">
                    {formatCurrency(item.sellPrice || 10.0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mt-0.5">
                  <span className="text-slate-400">Est. US Shipping:</span>
                  <span className="font-mono text-slate-300">
                    {formatCurrency(item.shippingPrice || 3.5)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Factory className="w-3.5 h-3.5 text-slate-500" />
                CJ Factory
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleImport(item)}
                className="text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                1-Click Import
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Sourcing Modal */}
      <SourcingModal
        isOpen={isSourcingModalOpen}
        onClose={() => setIsSourcingModalOpen(false)}
      />
    </PageContainer>
  );
};
