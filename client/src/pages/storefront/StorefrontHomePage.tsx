import React, { useState, useEffect } from 'react';
import { StoreHeader } from '../../components/storefront/StoreHeader.js';
import { StoreFooter } from '../../components/storefront/StoreFooter.js';
import { HeroBanner } from '../../components/storefront/HeroBanner.js';
import { ProductCard, ProductItem } from '../../components/storefront/ProductCard.js';
import { ProductGridSkeleton } from '../../components/common/ProductGridSkeleton.js';
import { CartDrawer } from '../../components/storefront/CartDrawer.js';
import { catalogService } from '../../services/catalogService.js';
import { useStorefrontLayout } from '../../components/layout/StorefrontLayout.js';
import { NavLink } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, Clock, RefreshCw } from 'lucide-react';

export const StorefrontHomePage: React.FC = () => {
  const { isInsideStorefrontLayout } = useStorefrontLayout();
  const [popularProducts, setPopularProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchPopular = async () => {
      try {
        setLoading(true);
        const data = await catalogService.getStorefrontProducts({
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

  const content = (
    <main className="flex-1">
      <HeroBanner />

      {/* Trust Badges */}
      <div className="border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Direct Express Delivery</h4>
                <p className="text-[11px] text-slate-400">Tracked CJ dropshipping</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Secure Payments</h4>
                <p className="text-[11px] text-slate-400">100% encrypted checkout</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">24/7 Support</h4>
                <p className="text-[11px] text-slate-400">Dedicated assistance</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Live Inventory</h4>
                <p className="text-[11px] text-slate-400">Real-time factory stock</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-teal-700">
              Featured Collection
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Popular Sourced Products
            </h2>
          </div>
          <NavLink
            to="/shop"
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <span>Shop All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );

  if (isInsideStorefrontLayout) {
    return content;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-slate-900">
      <StoreHeader />
      {content}
      <StoreFooter />
      <CartDrawer />
    </div>
  );
};
