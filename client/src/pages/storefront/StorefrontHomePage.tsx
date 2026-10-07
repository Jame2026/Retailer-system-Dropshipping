import React, { useState, useEffect } from 'react';
import { StoreHeader } from '../../components/storefront/StoreHeader.js';
import { StoreFooter } from '../../components/storefront/StoreFooter.js';
import { HeroBanner } from '../../components/storefront/HeroBanner.js';
import { ProductCard, ProductItem } from '../../components/storefront/ProductCard.js';
import { CartDrawer } from '../../components/storefront/CartDrawer.js';
import { catalogService } from '../../services/catalogService.js';
import { NavLink } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, Clock, RefreshCw } from 'lucide-react';

export const StorefrontHomePage: React.FC = () => {
  const [popularProducts, setPopularProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchPopular = async () => {
      try {
        setLoading(true);
        const data = await catalogService.getStorefrontProducts({
          tag: 'Popular',
          limit: 8,
        });
        if (isMounted) {
          setPopularProducts(data.items || []);
        }
      } catch (err) {
        console.error('Failed to load popular products from server', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPopular();

    return () => {
      isMounted = false;
    };
  }, []);

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

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, idx) => (
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <StoreFooter />
      <CartDrawer />
    </div>
  );
};
