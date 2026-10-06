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

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-slate-800">
      {/* Top Image Container */}
      <div className="relative h-64 sm:h-72 w-full bg-[#f8fafc] flex items-center justify-center p-6 overflow-hidden">
        {/* Badges */}
        {product.tag && (
          <div className="absolute top-3.5 right-3.5 z-10">
            <span
              className={`px-3 py-1 text-[11px] font-black uppercase tracking-wider rounded-md shadow-md ${
                product.tag === 'SALE'
                  ? 'bg-teal-500 text-slate-950 font-extrabold'
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
          className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
        />

        {/* Floating Quick Action Overlay */}
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <button
            onClick={handleAdd}
            className="p-2.5 rounded-full bg-slate-900 text-white hover:bg-teal-500 hover:text-slate-950 shadow-lg transition-colors"
            title="Add to Cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Details (Clean minimalist style) */}
      <div className="p-5 flex flex-col items-center text-center flex-1 justify-between gap-3 bg-white">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            {product.category}
          </span>
          <h4 className="text-xs font-bold text-slate-900 mt-1 uppercase tracking-wider line-clamp-1 group-hover:text-teal-600 transition-colors">
            {product.title}
          </h4>
        </div>

        {/* Pricing */}
        <div className="flex items-center gap-2 font-mono">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-slate-400 line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
          <span className="text-sm font-black text-slate-900">
            {formatCurrency(product.price)}
          </span>
        </div>

        {/* Add to Cart Border Button (matching screenshot) */}
        <button
          onClick={handleAdd}
          className={`w-full py-2.5 px-4 text-xs font-extrabold uppercase tracking-wider border rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
            added
              ? 'bg-teal-500 border-teal-500 text-slate-950 shadow-md'
              : 'border-slate-800 text-slate-900 hover:bg-slate-900 hover:text-white'
          }`}
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" /> Added to Cart
            </>
          ) : (
            'Add to Cart'
          )}
        </button>
      </div>
    </div>
  );
};
