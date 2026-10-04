import React from 'react';
import { StoreHeader } from '../../components/storefront/StoreHeader.js';
import { StoreFooter } from '../../components/storefront/StoreFooter.js';
import { HeroBanner } from '../../components/storefront/HeroBanner.js';
import { ProductCard, ProductItem } from '../../components/storefront/ProductCard.js';
import { CartDrawer } from '../../components/storefront/CartDrawer.js';
import { NavLink } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, Clock, RefreshCw } from 'lucide-react';

export const StorefrontHomePage: React.FC = () => {
  const popularProducts: ProductItem[] = [
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
      category: 'Accessories',
    },
    {
      id: 'prod-6',
      sku: 'RET-LEATHER-006-BRN',
      title: 'Handcrafted Vintage Bifold Leather Wallet',
      price: 26.5,
      originalPrice: 50.0,
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80',
      tag: 'HOT',
      category: 'Accessories',
    },
    {
      id: 'prod-7',
      sku: 'RET-HAT-007-BLK',
      title: 'Wide Brim Wool Sun Fedora Hat - Black',
      price: 29.0,
      originalPrice: 48.0,
      image: 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=500&q=80',
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
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-slate-900">
      <StoreHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-12">
        {/* Hero Banner */}
        <HeroBanner />

        {/* Feature Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 shadow-sm">
            <Truck className="w-6 h-6 text-teal-600 shrink-0" />
            <div>
              <h5 className="text-xs font-bold text-slate-900">Fast USPS Delivery</h5>
              <p className="text-[11px] text-slate-500">Direct from factory</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 shadow-sm">
            <Clock className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h5 className="text-xs font-bold text-slate-900">6h Safety Hold</h5>
              <p className="text-[11px] text-slate-500">Easy address fixes</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 shadow-sm">
            <ShieldCheck className="w-6 h-6 text-indigo-600 shrink-0" />
            <div>
              <h5 className="text-xs font-bold text-slate-900">Verified Suppliers</h5>
              <p className="text-[11px] text-slate-500">CJ & Zendrop inspected</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 shadow-sm">
            <RefreshCw className="w-6 h-6 text-pink-600 shrink-0" />
            <div>
              <h5 className="text-xs font-bold text-slate-900">30-Day Returns</h5>
              <p className="text-[11px] text-slate-500">Hassle-free guarantee</p>
            </div>
          </div>
        </div>

        {/* Popular Products Section (matching screenshot 2) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                Popular Products
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Trending summer arrivals with direct supplier wholesale pricing
              </p>
            </div>
            <NavLink
              to="/shop"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-teal-800 text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200"
            >
              <span>See All Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </main>

      <StoreFooter />
      <CartDrawer />
    </div>
  );
};
