import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { NotificationProvider } from './context/NotificationContext.js';
import { CartProvider } from './context/CartContext.js';
import { ProtectedRoute } from './components/common/ProtectedRoute.js';

// Storefront Pages
import { StorefrontHomePage } from './pages/storefront/StorefrontHomePage.js';
import { StorefrontCatalogPage } from './pages/storefront/StorefrontCatalogPage.js';

// Admin Auth Page
import { AdminLoginPage } from './pages/AdminLoginPage.js';

// Admin Operations Pages (Dropshipping Engine & Hold Buffer)
import { DashboardPage } from './pages/DashboardPage.js';
import { OrdersPage } from './pages/OrdersPage.js';
import { OrderDetailPage } from './pages/OrderDetailPage.js';
import { CatalogPage } from './pages/CatalogPage.js';
import { PricingRulesPage } from './pages/PricingRulesPage.js';
import { SourcingPage } from './pages/SourcingPage.js';
import { SettingsPage } from './pages/SettingsPage.js';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Customer-Facing Storefront */}
              <Route path="/" element={<StorefrontHomePage />} />
              <Route path="/shop" element={<StorefrontCatalogPage />} />

              {/* Dedicated Admin Login URL Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/login" element={<AdminLoginPage />} />

              {/* Protected Admin Dropship Operations Dashboard */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders/:id"
                element={
                  <ProtectedRoute>
                    <OrderDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/catalog"
                element={
                  <ProtectedRoute>
                    <CatalogPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/pricing"
                element={
                  <ProtectedRoute>
                    <PricingRulesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/sourcing"
                element={
                  <ProtectedRoute>
                    <SourcingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Backward-compatible Direct Protected Routes */}
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:id"
                element={
                  <ProtectedRoute>
                    <OrderDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/catalog"
                element={
                  <ProtectedRoute>
                    <CatalogPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pricing"
                element={
                  <ProtectedRoute>
                    <PricingRulesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sourcing"
                element={
                  <ProtectedRoute>
                    <SourcingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
