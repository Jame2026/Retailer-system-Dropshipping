import React, { useEffect, useState } from 'react';
import { Package, ExternalLink } from 'lucide-react';
import { catalogService } from '../../../services/catalogService.js';
import { SkuMapping } from '../../../types/catalog.types.js';

export interface SelectedProductInfo {
  vid?: string;
  pid?: string;
  sku?: string;
  name: string;
  cost: number;
  image?: string;
}

const DEFAULT_PRESETS: SelectedProductInfo[] = [
  {
    name: 'RGB Atmosphere Lamp (Variant 2610300340461623900)',
    vid: '2610300340461623900',
    cost: 8.5,
    image: 'https://oss-cf.cjdropshipping.com/product/2026/10/30/04/dec8e179-db12-4ac9-9753-2ea7722ff30d.jpg',
  },
  {
    name: 'Sleep Soothing Patch (PID 2610300451011619800)',
    pid: '2610300451011619800',
    cost: 2.76,
    image: 'https://oss-cf.cjdropshipping.com/product/2026/10/30/04/aed40b05-4aa7-485b-a654-a6fec369bbba.jpg',
  },
  {
    name: 'Ice-feeling Soothing Ball (PID 2610300455231611400)',
    pid: '2610300455231611400',
    cost: 1.83,
    image: 'https://oss-cf.cjdropshipping.com/product/2026/10/30/04/b896acf1-8a12-4200-8194-a4719c775c99.jpg',
  },
];

interface ShippingProductPickerProps {
  selectedProduct: SelectedProductInfo;
  onProductChange: (product: SelectedProductInfo) => void;
  customVid: string;
  onCustomVidChange: (vid: string) => void;
}

export const ShippingProductPicker: React.FC<ShippingProductPickerProps> = ({
  selectedProduct,
  onProductChange,
  customVid,
  onCustomVidChange,
}) => {
  const [catalogItems, setCatalogItems] = useState<SkuMapping[]>([]);
  const [mode, setMode] = useState<'catalog' | 'custom'>('catalog');

  useEffect(() => {
    catalogService.getMappings(1, 20).then((res) => {
      if (res?.items && res.items.length > 0) {
        setCatalogItems(res.items);
      }
    }).catch(() => {});
  }, []);

  const handleSelectChange = (value: string) => {
    if (value === '__custom__') {
      setMode('custom');
      return;
    }
    setMode('catalog');
    const matchedPreset = DEFAULT_PRESETS.find((p) => (p.vid || p.pid) === value);
    if (matchedPreset) {
      onProductChange(matchedPreset);
      return;
    }
    const matchedCatalog = catalogItems.find((c) => (c.primarySupplierVid || c.primarySupplierPid || c.id) === value);
    if (matchedCatalog) {
      onProductChange({
        vid: matchedCatalog.primarySupplierVid || undefined,
        pid: matchedCatalog.primarySupplierPid || matchedCatalog.id,
        sku: matchedCatalog.primarySupplierSku || matchedCatalog.storeSku,
        name: matchedCatalog.productName,
        cost: matchedCatalog.primaryCostPrice || 5.0,
        image: matchedCatalog.productImage || undefined,
      });
    }
  };

  const selectedValue = mode === 'custom' ? '__custom__' : (selectedProduct.vid || selectedProduct.pid || DEFAULT_PRESETS[0].vid);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Select Product to Ship
        </label>
        <select
          value={selectedValue}
          onChange={(e) => handleSelectChange(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-teal-600 shadow-2xs font-medium"
        >
          <optgroup label="🌟 Popular Preset Products">
            {DEFAULT_PRESETS.map((p) => (
              <option key={p.vid || p.pid} value={p.vid || p.pid}>
                {p.name.length > 45 ? `${p.name.substring(0, 45)}...` : p.name}
              </option>
            ))}
          </optgroup>
          {catalogItems.length > 0 && (
            <optgroup label="📦 Store Catalog Mappings">
              {catalogItems.map((item) => (
                <option key={item.id} value={item.primarySupplierVid || item.primarySupplierPid || item.id}>
                  {item.productName.length > 45 ? `${item.productName.substring(0, 45)}...` : item.productName} (${(item.primaryCostPrice || 0).toFixed(2)})
                </option>
              ))}
            </optgroup>
          )}
          <optgroup label="⚙️ Custom Variant ID">
            <option value="__custom__">Custom CJ Variant ID / SPU...</option>
          </optgroup>
        </select>
      </div>

      {mode === 'custom' && (
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Enter CJ Variant ID (VID)</label>
          <input
            type="text"
            placeholder="e.g. 2610300340461623900"
            value={customVid}
            onChange={(e) => {
              onCustomVidChange(e.target.value);
              onProductChange({
                vid: e.target.value,
                name: `Custom Item (${e.target.value.substring(0, 10)}...)`,
                cost: 5.0,
              });
            }}
            className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 shadow-2xs font-mono"
          />
        </div>
      )}

      {/* Selected product preview card */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
        {selectedProduct.image ? (
          <img
            src={selectedProduct.image}
            alt={selectedProduct.name}
            className="w-11 h-11 object-cover rounded-lg border border-slate-200 shrink-0 bg-white"
          />
        ) : (
          <div className="w-11 h-11 rounded-lg bg-teal-100/50 text-teal-700 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <span className="text-xs font-bold text-slate-900 block truncate" title={selectedProduct.name}>
            {selectedProduct.name}
          </span>
          <span className="text-[11px] text-slate-500 block">
            Base Cost: <strong className="text-teal-700 font-mono font-bold">${selectedProduct.cost.toFixed(2)} USD</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
