import React, { useState, useMemo } from 'react';
import { useSavedProducts } from '../../context/SavedProductsContext.js';
import { useCart } from '../../context/CartContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { useNotification } from '../../context/NotificationContext.js';
import { UserPortalHeader } from '../../components/storefront/UserPortalHeader.js';
import { SavedProductCard } from '../../components/storefront/SavedProductCard.js';
import { ProductCard, ProductItem } from '../../components/storefront/ProductCard.js';
import { Heart, Search, ShoppingBag, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const EXPLORE_ITEMS: ProductItem[] = [
  {
    id: 'exp-1', sku: 'CJ-DEMO-LAMP-RGB', title: 'Multifunctional Wireless Charger RGB Lamp',
    price: 49.99, originalPrice: 89.0, image: 'https://cf.cjdropshipping.com/667bbd9d-e23d-453c-8f31-bd355107f90f.jpg',
    category: 'Electronics', tag: 'Trending', rating: 4.9,
  },
  {
    id: 'exp-2', sku: 'RET-WATCH-001', title: 'Minimalist Stainless Steel Watch - Silver Edition',
    price: 44.75, originalPrice: 120.0, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
    category: 'Accessories', tag: 'Popular', rating: 4.8,
  },
  {
    id: 'exp-3', sku: 'RET-BAG-002', title: 'Waterproof Crossbody Travel Bag - Matte Black',
    price: 31.75, originalPrice: 75.0, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
    category: 'Clothings', tag: 'SALE', rating: 4.7,
  },
  {
    id: 'exp-4', sku: 'CJ-DIFFUSER-01', title: 'Ultrasonic Flame Aromatherapy Diffuser',
    price: 38.50, originalPrice: 65.0, image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&q=80',
    category: 'Home & Living', tag: 'Trending', rating: 4.8,
  },
];

export const UserPortalPage: React.FC = () => {
  const { savedProducts, clearSavedProducts, totalSaved } = useSavedProducts();
  const { addToCart, totalItems: totalCartItems } = useCart();
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'saved' | 'explore'>('saved');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSaved = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return savedProducts;
    return savedProducts.filter(
      (p) => p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
    );
  }, [savedProducts, searchQuery]);

  const handleMoveAllToCart = () => {
    if (savedProducts.length === 0) return;
    savedProducts.forEach((p) => addToCart(p, 1));
    showToast('success', 'Moved to Cart', `Added all ${savedProducts.length} saved products to your cart.`);
  };

  const handleClearAll = () => {
    if (confirm('Clear all saved products from your list?')) {
      clearSavedProducts();
      showToast('info', 'List Cleared', 'Your saved products list has been cleared.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-slate-800">
      <UserPortalHeader
        totalSaved={totalSaved} totalCartItems={totalCartItems} userName={user?.name}
        onMoveAllToCart={handleMoveAllToCart} onClearAllSaved={handleClearAll}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'saved' ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Saved Products ({totalSaved})</span>
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'explore' ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explore More Products</span>
          </button>
        </div>

        {activeTab === 'saved' && totalSaved > 0 && (
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text" placeholder="Search saved products..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500 shadow-2xs"
            />
          </div>
        )}
      </div>

      {activeTab === 'saved' ? (
        filteredSaved.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredSaved.map((product) => (
              <SavedProductCard key={product.id || product.sku} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-xs">
              <Heart className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                {searchQuery ? 'No matching saved products' : 'Your saved products list is empty'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery ? 'Try searching another keyword.' : 'Browse the store and tap the heart icon on any product to save it here.'}
              </p>
            </div>
            <NavLink
              to="/shop"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Browse Products
            </NavLink>
          </div>
        )
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recommended Products to Save</h3>
            <NavLink to="/shop" className="text-xs font-bold text-teal-700 hover:underline">
              View All in Store →
            </NavLink>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {EXPLORE_ITEMS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPortalPage;
