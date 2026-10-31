import React, { useState } from 'react';
import { ProductItem } from './ProductCard.js';
import { useCart } from '../../context/CartContext.js';
import { useSavedProducts } from '../../context/SavedProductsContext.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { ShoppingBag, Trash2, Check, ExternalLink } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export interface SavedProductCardProps {
  product: ProductItem;
}

export const SavedProductCard: React.FC<SavedProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { removeSavedProduct } = useSavedProducts();
  const [added, setAdded] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.image);

  const handleAdd = () => {
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden">
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
        {product.tag && (
          <span className="absolute top-3 left-3 z-10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md shadow-xs bg-teal-600 text-white">
            {product.tag}
          </span>
        )}

        <img
          src={imgSrc}
          alt={product.title}
          onError={() => setImgSrc('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80')}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        <button
          onClick={() => removeSavedProduct(product.id)}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/80 shadow-xs flex items-center justify-center transition-colors"
          title="Remove from saved"
          aria-label="Remove from saved"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-teal-700 font-bold block mb-1">
            {product.category || 'General'}
          </span>
          <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-relaxed group-hover:text-teal-600 transition-colors" title={product.title}>
            {product.title}
          </h4>
          <span className="font-mono text-[10px] text-slate-400 block mt-1">
            SKU: {product.sku}
          </span>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex flex-col font-mono">
            <span className="text-sm font-extrabold text-slate-900">{formatCurrency(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[10px] text-slate-400 line-through">{formatCurrency(product.originalPrice)}</span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={added}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
              added ? 'bg-emerald-600 text-white' : 'bg-teal-600 hover:bg-teal-500 text-white active:scale-95'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> Move to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
