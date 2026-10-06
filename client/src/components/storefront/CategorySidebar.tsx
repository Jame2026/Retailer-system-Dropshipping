import React from 'react';

export interface CategorySidebarProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  maxPrice: number;
  onChangeMaxPrice: (price: number) => void;
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  onResetFilters: () => void;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  selectedCategory,
  onSelectCategory,
  maxPrice,
  onChangeMaxPrice,
  selectedBrand,
  onSelectBrand,
  onResetFilters,
}) => {
  const categories = [
    { name: 'All Categories', count: 42 },
    { name: 'Clothings', count: 14 },
    { name: 'Footwear', count: 8 },
    { name: 'Accessories', count: 12 },
    { name: 'Watches', count: 5 },
    { name: 'Bags & Packs', count: 3 },
  ];

  const brands = [
    { name: 'All Brands', count: 42 },
    { name: 'Voisen Prime', count: 12 },
    { name: 'Nike Fashion', count: 8 },
    { name: 'Calvin Klein', count: 6 },
    { name: 'Diesel Urban', count: 4 },
    { name: 'Tommy Hilfiger', count: 5 },
  ];

  return (
    <aside className="w-full lg:w-64 space-y-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-slate-800">
      {/* Sidebar Heading */}
      <div className="bg-slate-900 text-white font-extrabold text-xs uppercase tracking-widest px-4 py-3 rounded-lg flex items-center justify-between">
        <span>Shop By</span>
        <button
          onClick={onResetFilters}
          className="text-[10px] text-teal-400 hover:underline lowercase font-normal"
        >
          reset
        </button>
      </div>

      {/* Category Section */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
          Category
        </h4>
        <ul className="space-y-2 text-xs">
          {categories.map((cat) => (
            <li key={cat.name}>
              <button
                onClick={() => onSelectCategory(cat.name === 'All Categories' ? '' : cat.name)}
                className={`w-full flex items-center justify-between py-1 transition-colors text-left ${
                  (selectedCategory === '' && cat.name === 'All Categories') ||
                  selectedCategory === cat.name
                    ? 'text-teal-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>› {cat.name}</span>
                <span className="text-slate-400 font-mono text-[11px]">({cat.count})</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Price</h4>
          <span className="text-xs font-mono font-bold text-teal-600">$0 - ${maxPrice}</span>
        </div>
        <div className="space-y-3 pt-1">
          <input
            type="range"
            min="10"
            max="300"
            step="5"
            value={maxPrice}
            onChange={(e) => onChangeMaxPrice(Number(e.target.value))}
            className="w-full accent-teal-500 cursor-pointer"
          />
          <button
            onClick={() => {}}
            className="w-full py-2 bg-slate-900 text-white text-[11px] font-extrabold uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-colors"
          >
            Apply Price Filter
          </button>
        </div>
      </div>

      {/* Manufacturer / Brands */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
          Manufacturer
        </h4>
        <ul className="space-y-2 text-xs">
          {brands.map((b) => (
            <li key={b.name}>
              <button
                onClick={() => onSelectBrand(b.name === 'All Brands' ? '' : b.name)}
                className={`w-full flex items-center justify-between py-1 transition-colors text-left ${
                  (selectedBrand === '' && b.name === 'All Brands') || selectedBrand === b.name
                    ? 'text-teal-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>› {b.name}</span>
                <span className="text-slate-400 font-mono text-[11px]">({b.count})</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};
