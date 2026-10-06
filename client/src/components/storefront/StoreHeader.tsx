import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.js';
import { Search, ShoppingBag, User, Menu, X, Zap } from 'lucide-react';

export const StoreHeader: React.FC = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const navLinks = [
    { label: 'HOME', path: '/' },
    { label: 'CLOTHINGS', path: '/shop?category=Clothings' },
    { label: 'LOOKBOOK', path: '/shop?category=Lookbook' },
    { label: 'FOOTWEAR', path: '/shop?category=Footwear' },
    { label: 'ACCESSORIES', path: '/shop?category=Accessories' },
    { label: 'POPULAR', path: '/shop?tag=Popular' },
  ];

  return (
    <header className="w-full bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-40 shadow-sm">
      {/* Top Banner (Clean Storefront Info) */}
      <div className="bg-slate-100 px-4 py-1.5 border-b border-slate-200 text-xs flex items-center justify-between text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
          <span className="font-medium">Fast US Delivery (3-5 Days) • Free Shipping on Orders over $50</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-500">
          <span>USD ($)</span>
          <span>•</span>
          <span>Help & Support: (800) 555-0199</span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <NavLink to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <Zap className="w-6 h-6 fill-current text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-wider text-slate-900 font-serif uppercase">
              VOISEN
            </span>
            <span className="block text-[9px] uppercase tracking-[0.25em] text-slate-500 font-bold -mt-1">
              STORE FASHION
            </span>
          </div>
        </NavLink>

        {/* Global Search Bar */}
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

        {/* User Account & Cart Button */}
        <div className="flex items-center gap-5 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-700">
            <div className="p-2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left leading-tight">
              <p className="text-[10px] text-slate-400 font-medium">Welcome!</p>
              <p className="font-bold text-slate-800">Sign In / Register</p>
            </div>
          </div>

          {/* Cart Icon with live badge */}
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Horizontal Category Nav */}
      <div className="bg-slate-50 border-t border-slate-200 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-center gap-8 py-3 text-xs font-bold tracking-widest text-slate-700">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.path}
              className={({ isActive }) =>
                `transition-colors duration-150 relative py-1 ${
                  isActive
                    ? 'text-teal-700 font-extrabold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-teal-600'
                    : 'text-slate-600 hover:text-teal-600'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-3 shadow-lg">
          <form onSubmit={handleSearch} className="relative mb-3">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 border border-slate-300 rounded-xl py-2 pl-4 pr-10 text-sm text-slate-900"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-teal-600">
              <Search className="w-4 h-4" />
            </button>
          </form>
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-teal-600"
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
};
