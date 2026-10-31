import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

export interface StoreNavLink {
  label: string;
  path: string;
}

export interface StoreMobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  navLinks: StoreNavLink[];
  isLinkActive: (path: string) => boolean;
  isAuthenticated: boolean;
  userName?: string;
  onLogout: () => void;
}

export const StoreMobileNav: React.FC<StoreMobileNavProps> = ({
  isOpen,
  onClose,
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  navLinks,
  isLinkActive,
  isAuthenticated,
  userName,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-3 shadow-lg">
      <form onSubmit={onSearchSubmit} className="relative mb-3">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-slate-100 border border-slate-300 rounded-xl py-2 pl-4 pr-10 text-sm text-slate-900"
        />
        <button type="submit" className="absolute right-3 top-2.5 text-teal-600">
          <Search className="w-4 h-4" />
        </button>
      </form>

      {navLinks.map((link) => {
        const active = isLinkActive(link.path);
        return (
          <Link
            key={link.label}
            to={link.path}
            onClick={onClose}
            className={`block py-2 text-sm font-semibold transition-colors ${
              active ? 'text-teal-700 font-bold' : 'text-slate-700 hover:text-teal-600'
            }`}
          >
            {link.label}
          </Link>
        );
      })}

      <div className="pt-2 border-t border-slate-200">
        {isAuthenticated ? (
          <>
            <Link
              to="/profile"
              onClick={onClose}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-teal-600"
            >
              My Profile {userName ? `(${userName})` : ''}
            </Link>
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full text-left py-2 text-sm font-semibold text-rose-600 hover:text-rose-700"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link
            to="/login"
            onClick={onClose}
            className="block py-2 text-sm font-bold text-teal-700 hover:text-teal-800"
          >
            Sign In / Register
          </Link>
        )}
      </div>
    </div>
  );
};
