import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StoreHeader } from '../../components/storefront/StoreHeader.js';
import { StoreFooter } from '../../components/storefront/StoreFooter.js';
import { CategorySidebar } from '../../components/storefront/CategorySidebar.js';
import { ProductCard, ProductItem } from '../../components/storefront/ProductCard.js';
import { CartDrawer } from '../../components/storefront/CartDrawer.js';
import { LayoutGrid, List } from 'lucide-react';

export const StorefrontCatalogPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [maxPrice, setMaxPrice] = useState<number>(300);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [pageSize, setPageSize] = useState<number>(9);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const allProducts: ProductItem[] = [
    {
      id: 'prod-1',
      sku: 'RET-WATCH-001-SLV',
      title: 'Minimalist Stainless Steel Watch - Silver',
      price: 44.75,
      originalPrice: 120.0,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
      tag: 'NEW',
      category: 'Accessories',
    },
    {
      id: 'prod-2',
      sku: 'RET-BAG-002-BLK',
      title: 'Waterproof Travel Crossbody Bag - Black',
      price: 31.75,
      originalPrice: 75.0,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
      tag: 'NEW',
      category: 'Clothings',
    },
    {
      id: 'prod-3',
      sku: 'RET-JACKET-003-TAN',
      title: 'Winter Parka Fleece Hooded Jacket - Camel',
      price: 128.0,
      originalPrice: 280.0,
      image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=500&q=80',
      tag: 'SALE',
      category: 'Clothings',
    },
    {
      id: 'prod-4',
      sku: 'RET-SHORTS-004-BLU',
      title: 'Classic Denim Casual Summer Shorts',
      price: 38.5,
      originalPrice: 56.0,
      image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&q=80',
      category: 'Clothings',
    },
    {
      id: 'prod-5',
      sku: 'RET-BAG-005-BLU',
      title: 'Urban Outdoor Daypack Canvas Backpack',
      price: 64.0,
      originalPrice: 110.0,
      image: 'https://images.unsplash.com/photo-1577733966973-d680bffd2e80?w=500&q=80',
      tag: 'NEW',
      category: 'Bags & Packs',
    },
    {
      id: 'prod-6',
      sku: 'RET-LEATHER-006-BRN',
      title: 'Handcrafted Vintage Bifold Leather Wallet',
      price: 26.5,
      originalPrice: 50.0,
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80',
      tag: 'NEW',
      category: 'Accessories',
    },
    {
      id: 'prod-7',
      sku: 'RET-HAT-007-BLK',
      title: 'Wide Brim Wool Sun Fedora Hat - Black',
      price: 29.0,
      originalPrice: 48.0,
      image: 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=500&q=80',
      tag: 'NEW',
      category: 'Clothings',
    },
    {
      id: 'prod-8',
      sku: 'RET-SHOES-008-BLK',
      title: 'Minimal Slip-on Casual Canvas Loafers',
      price: 52.0,
      originalPrice: 85.0,
      image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500&q=80',
      tag: 'SALE',
      category: 'Footwear',
    },
    {
      id: 'prod-9',
      sku: 'RET-WATCH-009-GLD',
      title: 'Executive Chronograph Rose Gold Mesh Watch',
      price: 58.0,
      originalPrice: 140.0,
      image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&q=80',
      tag: 'NEW',
      category: 'Watches',
    },
  ];

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      if (selectedCategory && product.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (product.price > maxPrice) {
        return false;
      }
      if (initialSearch && !product.title.toLowerCase().includes(initialSearch.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [allProducts, selectedCategory, maxPrice, initialSearch]);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setMaxPrice(300);
    setSelectedBrand('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-slate-900">
      <StoreHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Breadcrumb matching screenshot 1 */}
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <span>Home</span>
          <span>›</span>
          <span className="text-teal-700">
            {selectedCategory || 'Catalog Products'}
          </span>
        </div>

        {/* Main 2-Column Layout */}
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Left Column: Category & Price Filter Sidebar */}
          <CategorySidebar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            maxPrice={maxPrice}
            onChangeMaxPrice={setMaxPrice}
            selectedBrand={selectedBrand}
            onSelectBrand={setSelectedBrand}
            onResetFilters={handleResetFilters}
          />

          {/* Right Column: Control Bar + Product Grid */}
          <div className="flex-1 w-full space-y-6">
            {/* Top Toolbar (matching screenshot 1) */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-700 shadow-sm">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg border ${
                    viewMode === 'grid'
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'border-slate-300 text-slate-500 hover:bg-slate-100'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg border ${
                    viewMode === 'list'
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'border-slate-300 text-slate-500 hover:bg-slate-100'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
                <span className="text-slate-500 ml-2">
                  Showing <strong className="text-slate-900">{filteredProducts.length}</strong> items
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Show:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800"
                  >
                    <option value={9}>9</option>
                    <option value={18}>18</option>
                    <option value={36}>36</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Sort By:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="py-24 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                <p className="text-base font-bold text-slate-800">No products found matching your filters.</p>
                <button
                  onClick={handleResetFilters}
                  className="mt-3 text-xs text-teal-700 font-extrabold uppercase tracking-wider hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} viewMode={viewMode} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <StoreFooter />
      <CartDrawer />
    </div>
  );
};
