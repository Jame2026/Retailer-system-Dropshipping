import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.js';
import { useSavedProducts } from '../../context/SavedProductsContext.js';
import { Search, ShoppingBag, Heart, User, Menu, X, Zap, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { StoreMobileNav } from './StoreMobileNav.js';

const NAV_LINKS = [
  { label: 'HOME', path: '/' },
  { label: 'SHOP ALL', path: '/shop' },
  { label: 'TRENDING', path: '/shop?tag=Trending' },
  { label: 'POPULAR', path: '/shop?tag=Popular' },
  { label: 'CLOTHING', path: '/shop?category=Clothings' },
  { label: 'SAVED', path: '/user' },
  { label: 'CJ PRODUCTS', path: '/products' },
];

export const StoreHeader: React.FC = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const { totalSaved } = useSavedProducts();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const isLinkActive = (targetPath: string) => {
    const current = location.pathname + location.search;
    return targetPath === '/' ? (location.pathname === '/' && !location.search) : current.toLowerCase() === targetPath.toLowerCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="w-full bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-40 shadow-sm">
      <div className="bg-slate-100 px-4 py-1.5 border-b border-slate-200 text-xs flex items-center justify-between text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
          <span className="font-medium">Direct Factory Sourcing • Fast US Delivery (3-5 Days)</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-500">
          <span>USD ($)</span>
          <span>•</span>
          <span className="text-teal-700 font-semibold">CJ Dropshipping Verified</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-6">
        <NavLink to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <Zap className="w-6 h-6 fill-current text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-wider text-slate-900 font-serif uppercase">VOISEN</span>
            <span className="block text-[9px] uppercase tracking-[0.25em] text-slate-500 font-bold -mt-1">STORE FASHION</span>
          </div>
        </NavLink>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl relative">
          <input
            type="text"
            placeholder="Search fashion, bags, watches, footwear..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 border border-slate-300 rounded-full py-2.5 pl-5 pr-12 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-teal-600 hover:bg-teal-500 rounded-full text-white flex items-center justify-center transition-colors shadow-sm"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        <div className="flex items-center gap-4 shrink-0">
          {isAuthenticated && user ? (
            <>
              <Link to="/profile" className="hidden sm:flex items-center gap-2 text-xs text-slate-700 hover:text-teal-700 transition-colors" title="View your profile">
                <div className="p-2 rounded-full bg-teal-50 text-teal-700 border border-teal-200"><User className="w-4 h-4" /></div>
                <div className="text-left leading-tight">
                  <p className="text-[10px] text-slate-400 font-medium">Welcome back!</p>
                  <p className="font-bold text-slate-800 truncate max-w-[10rem]">{user.name}</p>
                </div>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                aria-label="Sign out"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="hidden sm:flex items-center gap-2 text-xs text-slate-700 hover:text-teal-700 transition-colors" title="Sign in to your account">
              <div className="p-2 rounded-full bg-slate-100 text-slate-600 border border-slate-200"><User className="w-4 h-4" /></div>
              <div className="text-left leading-tight">
                <p className="text-[10px] text-slate-400 font-medium">Welcome!</p>
                <p className="font-bold text-slate-800">Sign In / Register</p>
              </div>
            </Link>
          )}

          <Link
            to="/user"
            className="relative p-2.5 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-all border border-slate-300 shadow-sm"
            title="Saved Products / Wishlist"
          >
            <Heart className="w-5 h-5" />
            {totalSaved > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-black flex items-center justify-center shadow-md animate-scale-up">
                {totalSaved}
              </span>
            )}
          </Link>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-full bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 transition-all border border-slate-300 shadow-sm"
            title="Open Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-teal-600 text-white text-[11px] font-black flex items-center justify-center shadow-md animate-scale-up">
                {totalItems}
              </span>
            )}
          </button>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="bg-slate-50 border-t border-slate-200 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-center gap-8 py-3 text-xs font-bold tracking-widest text-slate-700">
          {NAV_LINKS.map((link) => {
            const active = isLinkActive(link.path);
            return (
              <Link
                key={link.label}
                to={link.path}
                className={`transition-colors duration-150 relative py-1 ${
                  active ? 'text-teal-700 font-extrabold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-teal-600' : 'text-slate-600 hover:text-teal-600'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      <StoreMobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchSubmit={handleSearch}
        navLinks={NAV_LINKS}
        isLinkActive={isLinkActive}
        isAuthenticated={isAuthenticated}
        userName={user?.name}
        onLogout={handleLogout}
      />
    </header>
  );
};

