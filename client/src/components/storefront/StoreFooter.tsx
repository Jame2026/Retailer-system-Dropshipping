import React from 'react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export const StoreFooter: React.FC = () => {
  return (
    <footer className="w-full bg-white text-slate-600 border-t border-slate-200 text-xs">
      {/* App Download Callout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50/50 rounded-2xl my-6">
        <div>
          <h3 className="text-xl font-black text-slate-900">Download Mobile App</h3>
          <p className="text-xs text-slate-500 mt-1">Get instant order tracking and exclusive wholesale dropship deals</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold flex items-center gap-2 cursor-pointer hover:border-teal-600 shadow-sm transition-colors">
            <span className="text-xs uppercase tracking-wider">App Store</span>
          </div>
          <div className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold flex items-center gap-2 cursor-pointer hover:border-teal-600 shadow-sm transition-colors">
            <span className="text-xs uppercase tracking-wider">Google Play</span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Brands</h4>
          <ul className="space-y-2 text-slate-600">
            <li><a href="#brands" className="hover:text-teal-700 font-medium">Adidas Originals</a></li>
            <li><a href="#brands" className="hover:text-teal-700 font-medium">Puma Lifestyle</a></li>
            <li><a href="#brands" className="hover:text-teal-700 font-medium">Reebok Classic</a></li>
            <li><a href="#brands" className="hover:text-teal-700 font-medium">Nike Performance</a></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Company</h4>
          <ul className="space-y-2 text-slate-600">
            <li><a href="#about" className="hover:text-teal-700 font-medium">About Us</a></li>
            <li><a href="#careers" className="hover:text-teal-700 font-medium">Careers</a></li>
            <li><a href="#stores" className="hover:text-teal-700 font-medium">Find a Store</a></li>
            <li><a href="#terms" className="hover:text-teal-700 font-medium">Rules and Terms</a></li>
            <li><a href="#sitemap" className="hover:text-teal-700 font-medium">Sitemap</a></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Help & Support</h4>
          <ul className="space-y-2 text-slate-600">
            <li><a href="#contact" className="hover:text-teal-700 font-medium">Contact Us</a></li>
            <li><a href="#refund" className="hover:text-teal-700 font-medium">Money Refund</a></li>
            <li><a href="#status" className="hover:text-teal-700 font-medium">Order Status</a></li>
            <li><a href="#shipping" className="hover:text-teal-700 font-medium">Shipping Info</a></li>
            <li><a href="#dispute" className="hover:text-teal-700 font-medium">Open Dispute</a></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Account</h4>
          <ul className="space-y-2 text-slate-600">
            <li><a href="#login" className="hover:text-teal-700 font-medium">User Login</a></li>
            <li><a href="#register" className="hover:text-teal-700 font-medium">User Register</a></li>
            <li><a href="#settings" className="hover:text-teal-700 font-medium">Account Settings</a></li>
            <li><a href="#orders" className="hover:text-teal-700 font-medium">My Orders</a></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Social</h4>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-center gap-2 hover:text-teal-700 cursor-pointer font-medium">
              <Facebook className="w-3.5 h-3.5 text-blue-600" /> Facebook
            </li>
            <li className="flex items-center gap-2 hover:text-teal-700 cursor-pointer font-medium">
              <Twitter className="w-3.5 h-3.5 text-sky-500" /> Twitter
            </li>
            <li className="flex items-center gap-2 hover:text-teal-700 cursor-pointer font-medium">
              <Instagram className="w-3.5 h-3.5 text-pink-600" /> Instagram
            </li>
            <li className="flex items-center gap-2 hover:text-teal-700 cursor-pointer font-medium">
              <Youtube className="w-3.5 h-3.5 text-red-600" /> YouTube
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-200 py-6 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 VOISEN Fashion Dropship Store. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>info@voisen-fashion.com</span>
            <span>+1 (800) 555-0199</span>
            <span>742 Evergreen Terrace, Springfield, OR</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
