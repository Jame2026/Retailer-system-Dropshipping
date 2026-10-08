import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StoreHeader } from '../../components/storefront/StoreHeader.js';
import { StoreFooter } from '../../components/storefront/StoreFooter.js';
import { CategorySidebar } from '../../components/storefront/CategorySidebar.js';
import { ProductCard, ProductItem } from '../../components/storefront/ProductCard.js';
import { CartDrawer } from '../../components/storefront/CartDrawer.js';
import { catalogService, StorefrontMeta } from '../../services/catalogService.js';
import { LayoutGrid, List, Loader2 } from 'lucide-react';

export const StorefrontCatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';
  const initialTag = searchParams.get('tag') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [maxPrice, setMaxPrice] = useState<number>(300);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [pageSize, setPageSize] = useState<number>(9);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [meta, setMeta] = useState<StorefrontMeta>({
    categories: [],
    brands: [],
    totalProducts: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Sync category state when URL changes
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
  }, [searchParams]);

  // Fetch metadata once on mount
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const data = await catalogService.getStorefrontMeta();
        setMeta(data);
      } catch (err) {
        console.error('Failed to load catalog metadata', err);
      }
    };
    fetchMeta();
  }, []);

  // Fetch products dynamically from backend API whenever filters change
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const search = searchParams.get('search') || initialSearch;
        const tag = searchParams.get('tag') || initialTag;

        const data = await catalogService.getStorefrontProducts({
          category: selectedCategory,
          tag,
          search,
          maxPrice,
          brand: selectedBrand,
          sortBy,
          limit: pageSize,
        });

        if (isMounted) {
          setProducts(data.items || []);
        }
      } catch (err) {
        console.error('Failed to fetch storefront products from backend', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, maxPrice, selectedBrand, sortBy, pageSize, searchParams]);

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    if (cat) {
      setSearchParams({ category: cat });
    } else {
      setSearchParams({});
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setMaxPrice(300);
    setSelectedBrand('');
    setSearchParams({});
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
            {selectedCategory || searchParams.get('tag') || 'Catalog Products'}
          </span>
        </div>

        {/* Main 2-Column Layout */}
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Left Column: Category & Price Filter Sidebar */}
          <CategorySidebar
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            maxPrice={maxPrice}
            onChangeMaxPrice={setMaxPrice}
            selectedBrand={selectedBrand}
            onSelectBrand={setSelectedBrand}
            onResetFilters={handleResetFilters}
            categoriesList={meta.categories}
            brandsList={meta.brands}
          />

          {/* Right Column: Control Bar + Product Grid */}
          <div className="flex-1 w-full space-y-6">
            {/* Top Toolbar */}
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
                  Showing <strong className="text-slate-900">{products.length}</strong> items
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Show:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:border-teal-600"
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
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:border-teal-600"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="newest">Newest Arrivals</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Product Grid / Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm animate-pulse space-y-4"
                  >
                    <div className="aspect-square bg-slate-200 rounded-xl w-full" />
                    <div className="h-4 bg-slate-200 rounded w-1/3 mx-auto" />
                    <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto" />
                    <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto" />
                    <div className="h-10 bg-slate-200 rounded-xl w-full" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-24 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 shadow-sm">
                <p className="text-base font-bold text-slate-800">No products found matching your filters.</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your price range or category filter.</p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-extrabold uppercase tracking-wider hover:bg-teal-500 shadow transition-all"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'flex flex-col gap-4'
                }
              >
                {products.map((product) => (
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
