import React from 'react';
import { useCart } from '../../context/CartContext.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { ShoppingBag, Eye, Heart, Check } from 'lucide-react';
import { useState } from 'react';

export interface ProductItem {
  id: string;
  sku: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  tag?: 'NEW' | 'SALE' | 'HOT';
  category: string;
  rating?: number;
}

export interface ProductCardProps {
  product: ProductItem;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (viewMode === 'list') {
    return (
      <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-center gap-5 p-4 text-slate-800">
        <div className="relative w-full sm:w-44 h-44 rounded-xl overflow-hidden bg-slate-100 shrink-0">
          {product.tag && (
            <span
              className={`absolute top-2.5 left-2.5 z-10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md shadow ${
                product.tag === 'SALE'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-900 text-white'
              }`}
            >
              {product.tag}
            </span>
          )}
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div className="flex-1 min-w-0 w-full flex flex-col justify-between h-full py-1">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-teal-700 font-bold">
              {product.category}
            </span>
            <h4 className="text-base font-bold text-slate-900 mt-1 group-hover:text-teal-600 transition-colors">
              {product.title}
            </h4>
            <p className="text-xs text-slate-500 mt-1 font-mono">SKU: {product.sku}</p>
          </div>

          <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-lg font-black text-slate-900">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>

            <button
              onClick={handleAdd}
              className={`py-2 px-5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-sm ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-white hover:bg-teal-600'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" /> Added
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between text-slate-800">
      {/* Top Image Container with Fixed Uniform Aspect Ratio */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        {/* Badges */}
        {product.tag && (
          <div className="absolute top-3 right-3 z-10">
            <span
              className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md shadow-sm ${
                product.tag === 'SALE'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-white'
              }`}
            >
              {product.tag}
            </span>
          </div>
        )}

        {/* Product Image */}
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Subtle quick add on hover */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <span className="bg-white/90 backdrop-blur-sm text-slate-900 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md">
            Quick View
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3 bg-white">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-teal-700 font-bold">
            {product.category}
          </span>
          <h4
            className="text-xs sm:text-sm font-bold text-slate-900 mt-1 line-clamp-2 min-h-[2.5rem] leading-snug group-hover:text-teal-600 transition-colors"
            title={product.title}
          >
            {product.title}
          </h4>
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-center gap-2 font-mono">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-slate-400 line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
          <span className="text-sm sm:text-base font-black text-slate-900">
            {formatCurrency(product.price)}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAdd}
          className={`w-full py-2.5 px-4 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border ${
            added
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
              : 'border-slate-300 text-slate-800 hover:bg-slate-900 hover:border-slate-900 hover:text-white'
          }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" /> Added to Cart
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
};
