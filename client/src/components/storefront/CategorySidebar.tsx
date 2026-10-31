import React from 'react';

export interface CategorySidebarProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  maxPrice: number;
  onChangeMaxPrice: (price: number) => void;
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  onResetFilters: () => void;
  categoriesList?: Array<{ name: string; count: number; id?: string }>;
  brandsList?: Array<{ name: string; count: number }>;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  selectedCategory,
  onSelectCategory,
  maxPrice,
  onChangeMaxPrice,
  selectedBrand,
  onSelectBrand,
  onResetFilters,
  categoriesList,
  brandsList,
}) => {
  const defaultCategories = [
    { name: 'All Categories', count: 0, id: '' },
    { name: "Women's Clothing", count: 0, id: '2FE8A083-5E7B-4179-896D-561EA116F730' },
    { name: "Men's Clothing", count: 0, id: 'B8302697-CF47-4211-9BD0-DFE8995AEB30' },
    { name: 'Jewelry & Watches', count: 0, id: '2837816E-2FEA-4455-845C-6F40C6D70D1E' },
    { name: 'Bags & Shoes', count: 0, id: '2415A90C-5D7B-4CC7-BA8C-C0949F9FF5D8' },
    { name: 'Consumer Electronics', count: 0, id: 'D9E66BF8-4E81-4CAB-A425-AEDEC5FBFBF2' },
    { name: 'Sports & Outdoors', count: 0, id: '4B397425-26C1-4D0E-B6D2-96B0B03689DB' },
    { name: 'Home, Garden & Furniture', count: 0, id: '52FC6CA5-669B-4D0B-B1AC-415675931399' },
    { name: 'Pet Supplies', count: 0, id: '2409110611570657700' },
  ];

  const categories = categoriesList && categoriesList.length > 0 ? categoriesList : defaultCategories;
  const brands = brandsList || [];

  return (
    <aside className="w-full lg:w-64 space-y-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-slate-800">
      <div className="bg-teal-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl flex items-center justify-between shadow-xs">
        <span>Filters</span>
        <button
          onClick={onResetFilters}
          className="text-[11px] text-teal-200 hover:text-white hover:underline font-semibold"
        >
          Reset
        </button>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
          Categories
        </h4>
        <ul className="space-y-2 text-xs">
          {categories.map((cat) => {
            const isSelected =
              (selectedCategory === '' && cat.name === 'All Categories') ||
              selectedCategory === cat.name ||
              (Boolean(cat.id) && selectedCategory === cat.id);

            return (
              <li key={cat.name}>
                <button
                  onClick={() => onSelectCategory(cat.name === 'All Categories' ? '' : (cat.id || cat.name))}
                  className={`w-full flex items-center justify-between py-1 transition-colors text-left ${
                    isSelected
                      ? 'text-teal-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>› {cat.name}</span>
                  {cat.count > 0 && <span className="text-slate-400 font-mono text-[11px]">({cat.count})</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Max Price</h4>
          <span className="text-xs font-mono font-bold text-teal-600">Up to ${maxPrice}</span>
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
        </div>
      </div>

      {brands.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            Brand
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
      )}
    </aside>
  );
};
