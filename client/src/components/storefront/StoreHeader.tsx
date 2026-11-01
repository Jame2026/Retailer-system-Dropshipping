import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.js';
import { useSavedProducts } from '../../context/SavedProductsContext.js';
import { Search, ShoppingBag, Heart, User, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { StoreMobileNav } from './StoreMobileNav.js';
import { Logo } from '../common/Logo.js';

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
    <header className="w-full bg-[#FAF8F5] border-b border-[#E8E2D6] text-[#1F1C18] sticky top-0 z-40 shadow-xs">
      <div className="bg-[#F4EFE6] px-4 py-1.5 border-b border-[#E8E2D6] text-xs flex items-center justify-between text-[#6B655B]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#14A07B] animate-pulse"></span>
          <span className="font-medium">Direct Factory Sourcing • Fast US Delivery (3-5 Days)</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[11px] text-[#7F796F]">
          <span>USD ($)</span>
          <span>•</span>
          <span className="text-[#14A07B] font-semibold">CJ Dropshipping Verified</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-6">
        <NavLink to="/" className="flex items-center shrink-0 group">
          <Logo size="lg" variant="horizontal" />
        </NavLink>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl relative">
          <input
            type="text"
            placeholder="Search fashion, bags, watches, footwear..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F4EFE6] border border-[#D5CDC0] rounded-full py-2.5 pl-5 pr-12 text-sm text-[#1F1C18] placeholder-[#9C958B] focus:outline-none focus:border-[#14A07B] focus:ring-2 focus:ring-[#14A07B]/15 transition-all shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#14A07B] hover:bg-[#118A6A] rounded-full text-white flex items-center justify-center transition-colors shadow-2xs"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        <div className="flex items-center gap-4 shrink-0">
          {isAuthenticated && user ? (
            <>
              <Link to="/profile" className="hidden sm:flex items-center gap-2 text-xs text-[#554E46] hover:text-[#14A07B] transition-colors" title="View your profile">
                <div className="p-2 rounded-full bg-[#E2DBD0]/60 text-[#14483D] border border-[#D5CDC0]"><User className="w-4 h-4" /></div>
                <div className="text-left leading-tight hidden lg:block">
                  <p className="font-bold text-[#1F1C18]">{user.name || 'Account'}</p>
                  <p className="text-[10px] text-[#7F796F] capitalize">{user.role || 'Member'}</p>
                </div>
              </Link>
              <Link to="/admin" className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#E5DFD3] text-[#1F1C18] hover:bg-[#DFD8CB] transition-colors shadow-2xs">
                Admin Panel
              </Link>
              <button onClick={handleLogout} className="p-2 text-[#7F796F] hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors" title="Sign out">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Link to="/login" className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#554E46] hover:text-[#14A07B] bg-[#EBE5DB]/70 hover:bg-[#E2DBCF] px-4 py-2 rounded-full border border-[#D5CDC0] transition-colors shadow-2xs">
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}

          <Link to="/user" className="relative p-2.5 text-[#554E46] hover:text-[#14A07B] transition-colors" title="View Saved Products">
            <Heart className="w-5 h-5" />
            {totalSaved > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#C69A57] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-up">
                {totalSaved}
              </span>
            )}
          </Link>

          <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 bg-[#14A07B] hover:bg-[#118A6A] text-white rounded-full transition-colors shadow-2xs" title="Open Cart">
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C69A57] text-white text-xs font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {totalItems}
              </span>
            )}
          </button>

          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-[#554E46] hover:text-[#1F1C18] rounded-xl hover:bg-[#EBE5DB]/60">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      <nav className="hidden md:flex border-t border-[#E8E2D6] px-4 sm:px-6">
        <div className="max-w-7xl mx-auto w-full flex items-center gap-8 py-2.5 text-xs font-bold tracking-wider">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={() =>
                `transition-colors py-1 relative ${
                  isLinkActive(link.path)
                    ? 'text-[#14A07B] font-extrabold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#14A07B]'
                    : 'text-[#6B655B] hover:text-[#1F1C18]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {mobileMenuOpen && (
        <StoreMobileNav
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          navLinks={NAV_LINKS}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearchSubmit={handleSearch}
          isLinkActive={isLinkActive}
          isAuthenticated={isAuthenticated}
          userName={user?.name}
          onLogout={handleLogout}
        />
      )}
    </header>
  );
};
