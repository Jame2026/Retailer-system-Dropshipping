import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { NotificationProvider } from './context/NotificationContext.js';
import { CartProvider } from './context/CartContext.js';
import { SavedProductsProvider } from './context/SavedProductsContext.js';
import { ProtectedRoute } from './components/auth/ProtectedRoute.js';

import { AdminLayout } from './components/layout/AdminLayout.js';
import { StorefrontLayout } from './components/layout/StorefrontLayout.js';

import { StorefrontHomePage } from './pages/storefront/StorefrontHomePage.js';
import { StorefrontCatalogPage } from './pages/storefront/StorefrontCatalogPage.js';
import { UserPortalPage } from './pages/storefront/UserPortalPage.js';

import { LoginPage } from './pages/LoginPage.js';
import { AdminLoginPage } from './pages/AdminLoginPage.js';
import { ProfilePage } from './pages/ProfilePage.js';

import { DashboardPage } from './pages/DashboardPage.js';
import { OrdersPage } from './pages/OrdersPage.js';
import { OrderDetailPage } from './pages/OrderDetailPage.js';
import { CatalogPage } from './pages/CatalogPage.js';
import { PricingRulesPage } from './pages/PricingRulesPage.js';
import { SourcingPage } from './pages/SourcingPage.js';
import { CjProductsPage } from './pages/CjProductsPage.js';
import { ShippingPage } from './pages/ShippingPage.js';
import { SettingsPage } from './pages/SettingsPage.js';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
          <SavedProductsProvider>
            <BrowserRouter
              future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
            >
              <Routes>
                {/* Storefront Routes with Persistent Storefront Layout */}
                <Route element={<StorefrontLayout />}>
                  <Route path="/" element={<StorefrontHomePage />} />
                  <Route path="/shop" element={<StorefrontCatalogPage />} />
                  <Route path="/user" element={<UserPortalPage />} />
                  <Route path="/client" element={<UserPortalPage />} />
                </Route>

                {/* Standalone Authentication Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Protected Admin Routes with Persistent Admin Layout */}
                <Route
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/admin" element={<DashboardPage />} />
                  <Route path="/admin/orders" element={<OrdersPage />} />
                  <Route path="/admin/orders/:id" element={<OrderDetailPage />} />
                  <Route path="/admin/catalog" element={<CatalogPage />} />
                  <Route path="/admin/pricing" element={<PricingRulesPage />} />
                  <Route path="/admin/shipping" element={<ShippingPage />} />
                  <Route path="/admin/sourcing" element={<SourcingPage />} />
                  <Route path="/admin/products" element={<CjProductsPage />} />
                  <Route path="/admin/cj-products" element={<CjProductsPage />} />
                  <Route path="/admin/settings" element={<SettingsPage />} />

                  {/* Legacy / Direct paths */}
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/orders/:id" element={<OrderDetailPage />} />
                  <Route path="/catalog" element={<CatalogPage />} />
                  <Route path="/pricing" element={<PricingRulesPage />} />
                  <Route path="/shipping" element={<ShippingPage />} />
                  <Route path="/sourcing" element={<SourcingPage />} />
                  <Route path="/products" element={<CjProductsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </SavedProductsProvider>
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;

