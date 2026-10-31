import React from 'react';
import { Heart, ShoppingBag, Truck, Zap, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button.js';
import { NavLink } from 'react-router-dom';

export interface UserPortalHeaderProps {
  totalSaved: number;
  totalCartItems: number;
  userName?: string;
  onMoveAllToCart: () => void;
  onClearAllSaved: () => void;
}

export const UserPortalHeader: React.FC<UserPortalHeaderProps> = ({
  totalSaved,
  totalCartItems,
  userName,
  onMoveAllToCart,
  onClearAllSaved,
}) => {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-teal-200/80 bg-gradient-to-r from-teal-500/10 via-cyan-500/5 to-slate-50 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
              <Heart className="w-3.5 h-3.5 fill-teal-600 text-teal-600" />
              <span>Client Saved Products & Wishlist</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {userName ? `Welcome back, ${userName}` : 'Client Product Hub'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              Save your favorite wholesale items, track live inventory, and seamlessly transfer them to your cart for direct factory fulfillment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {totalSaved > 0 && (
              <>
                <Button variant="primary" size="sm" onClick={onMoveAllToCart} className="text-xs font-bold">
                  <ShoppingBag className="w-3.5 h-3.5" /> Move All to Cart
                </Button>
                <Button variant="outline" size="sm" onClick={onClearAllSaved} className="text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50">
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </Button>
              </>
            )}
            <NavLink to="/shop">
              <Button variant="secondary" size="sm" className="text-xs font-semibold">
                Explore Shop <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </NavLink>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <Heart className="w-5 h-5 fill-rose-500" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Saved Items</span>
            <span className="text-lg font-black text-slate-900 font-mono">{totalSaved} Products</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">In Cart</span>
            <span className="text-lg font-black text-slate-900 font-mono">{totalCartItems} Items</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Delivery</span>
            <span className="text-xs font-extrabold text-slate-900 block">3-5 Day Fast US Air</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Fulfillment</span>
            <span className="text-xs font-extrabold text-slate-900 block">Direct CJ Factory</span>
          </div>
        </div>
      </div>
    </div>
  );
};
