import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext.js';
import { useSavedProducts } from '../../context/SavedProductsContext.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { ShoppingBag, Eye, Heart, Check } from 'lucide-react';

export interface ProductItem {
  id: string;
  sku: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  tag?: string;
  category: string;
  rating?: number;
}

export interface ProductCardProps {
  product: ProductItem;
  viewMode?: 'grid' | 'list';
}

function getTagBadgeClass(tag?: string) {
  if (!tag) return '';
  if (tag.includes('Trending')) return 'bg-gradient-to-r from-amber-500 to-rose-500 text-white';
  if (tag.includes('Popular')) return 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white';
  if (tag === 'SALE') return 'bg-emerald-600 text-white';
  return 'bg-teal-700 text-white';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
  const { addToCart } = useCart();
  const { isProductSaved, toggleSaveProduct } = useSavedProducts();
  const [added, setAdded] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.image);

  useEffect(() => { setImgSrc(product.image); }, [product.image]);

  const handleAdd = () => {
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const isSaved = isProductSaved(product.id || product.sku);

  if (viewMode === 'list') {
    return (
      <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-center gap-5 p-4 text-slate-800">
        <div className="relative w-full sm:w-44 h-44 rounded-xl overflow-hidden bg-slate-100 shrink-0">
          {product.tag && (
            <span className={`absolute top-2.5 left-2.5 z-10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md shadow ${getTagBadgeClass(product.tag)}`}>
              {product.tag}
            </span>
          )}
          <img
            src={imgSrc}
            alt={product.title}
            onError={() => setImgSrc('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80')}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div className="flex-1 min-w-0 w-full flex flex-col justify-between h-full py-1">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-teal-700 font-bold">{product.category}</span>
            <h4 className="text-base font-bold text-slate-900 mt-1 group-hover:text-teal-600 transition-colors">{product.title}</h4>
            <p className="text-xs text-slate-500 mt-1 font-mono">SKU: {product.sku}</p>
          </div>

          <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-lg font-black text-slate-900">{formatCurrency(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through">{formatCurrency(product.originalPrice)}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleSaveProduct(product)}
                className={`p-2 rounded-xl transition-all shadow-sm border ${
                  isSaved ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                }`}
                title={isSaved ? 'Saved to favorites' : 'Save product'}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
              <button
                onClick={handleAdd}
                disabled={added}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                  added ? 'bg-emerald-600 text-white' : 'bg-teal-600 hover:bg-teal-500 text-white active:scale-95'
                }`}
              >
                {added ? <><Check className="w-4 h-4 stroke-[3]" /> Added</> : <><ShoppingBag className="w-3.5 h-3.5" /> Add to Cart</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between text-slate-800">
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggleSaveProduct(product); }}
          className={`absolute top-2.5 left-2.5 z-10 p-2 rounded-full shadow-md transition-all ${
            isSaved ? 'bg-rose-500 text-white ring-2 ring-rose-200 shadow-rose-300/50' : 'bg-white/90 backdrop-blur text-slate-500 hover:text-rose-600 hover:bg-white'
          }`}
          title={isSaved ? 'Remove from saved' : 'Save product'}
        >
          <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-white stroke-white' : ''}`} />
        </button>

        {product.tag && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded shadow-sm ${getTagBadgeClass(product.tag)}`}>
              {product.tag}
            </span>
          </div>
        )}

        <img
          src={imgSrc}
          alt={product.title}
          onError={() => setImgSrc('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80')}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => alert(`Quick view: ${product.title}`)}
              className="w-9 h-9 rounded-full bg-white text-slate-800 shadow-md flex items-center justify-center hover:bg-teal-600 hover:text-white transition-colors"
              title="Quick View"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleSaveProduct(product)}
              className={`w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-colors ${
                isSaved ? 'bg-rose-600 text-white' : 'bg-white text-slate-800 hover:bg-rose-600 hover:text-white'
              }`}
              title={isSaved ? 'Remove from Saved' : 'Save to Wishlist'}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-teal-700 font-bold block mb-1">{product.category}</span>
          <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-relaxed group-hover:text-teal-600 transition-colors" title={product.title}>
            {product.title}
          </h4>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col font-mono">
            <span className="text-sm font-black text-slate-900">{formatCurrency(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[10px] text-slate-400 line-through">{formatCurrency(product.originalPrice)}</span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={added}
            className={`p-2 rounded-xl transition-all shadow-sm ${
              added ? 'bg-emerald-600 text-white' : 'bg-slate-100 hover:bg-teal-600 text-slate-700 hover:text-white active:scale-95'
            }`}
            title="Add to cart"
          >
            {added ? <Check className="w-4 h-4 stroke-[3]" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

