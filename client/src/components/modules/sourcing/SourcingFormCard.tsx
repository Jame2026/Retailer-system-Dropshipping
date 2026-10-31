import React, { useState } from 'react';
import { Card } from '../../common/Card.js';
import { Button } from '../../common/Button.js';
import { Sparkles, Send, Link2, DollarSign, TrendingUp, Tag, Wand2 } from 'lucide-react';
import { SourcingRequestDTO } from '../../../types/catalog.types.js';

interface SourcingFormCardProps {
  onSubmit: (data: SourcingRequestDTO) => Promise<void>;
  loading: boolean;
}

const PLATFORMS = [
  { name: 'AliExpress', domain: 'https://aliexpress.com/item/', color: 'bg-red-50 text-red-700 border-red-200' },
  { name: '1688 Factory', domain: 'https://detail.1688.com/offer/', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { name: 'Amazon', domain: 'https://amazon.com/dp/', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { name: 'TikTok Shop', domain: 'https://shop.tiktok.com/view/product/', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
];

export const SourcingFormCard: React.FC<SourcingFormCardProps> = ({ onSubmit, loading }) => {
  const [productName, setProductName] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [productImage, setProductImage] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [dailyOrders, setDailyOrders] = useState('15');
  const [notes, setNotes] = useState('');

  const handleLoadDemo = () => {
    setProductName('RGB Sunset Projection Atmosphere Lamp');
    setProductUrl('https://www.aliexpress.com/item/1005006123456789.html');
    setProductImage('https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80');
    setTargetPrice('4.50');
    setDailyOrders('20');
    setNotes('Need US plug, remote control variant, and matte black finish with clean packaging.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      productName: productName.trim() || undefined,
      productUrl: productUrl.trim(),
      productImage: productImage.trim() || undefined,
      targetPrice: targetPrice ? Number(targetPrice) : undefined,
      estimatedDailyOrders: Number(dailyOrders) || 10,
      notes: notes.trim() || undefined,
      supplierType: 'CJ',
    }).then(() => {
      setProductName('');
      setProductUrl('');
      setProductImage('');
      setTargetPrice('');
      setNotes('');
    }).catch(() => {});
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Submit Sourcing Query</h2>
        </div>
        <button
          type="button"
          onClick={handleLoadDemo}
          className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 bg-teal-50 px-2 py-1 rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors"
          title="Autofill a sample viral product to test sourcing"
        >
          <Wand2 className="w-3 h-3" /> Try Demo
        </button>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Sources:</span>
        {PLATFORMS.map((plat) => (
          <span key={plat.name} className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${plat.color}`}>
            {plat.name}
          </span>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Product Title</label>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="e.g. RGB Sunset Atmosphere Lamp"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600 shadow-2xs"
            />
            <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Product Link (AliExpress, 1688, Amazon)</label>
          <div className="relative">
            <input
              type="url"
              required
              placeholder="https://aliexpress.com/item/..."
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600 shadow-2xs font-mono"
            />
            <Link2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Cost ($USD)</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                placeholder="4.50"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-7 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600 shadow-2xs font-mono font-bold"
              />
              <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Est. Daily Orders</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                placeholder="20"
                value={dailyOrders}
                onChange={(e) => setDailyOrders(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-7 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600 shadow-2xs"
              />
              <TrendingUp className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Merchant Notes / Variants</label>
          <textarea
            rows={2}
            placeholder="e.g. US plug, matte black, custom box packaging"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 shadow-2xs"
          />
        </div>

        <Button variant="primary" type="submit" className="w-full" isLoading={loading}>
          <Send className="w-3.5 h-3.5" /> Submit Sourcing Query to CJ
        </Button>
      </form>
    </Card>
  );
};
