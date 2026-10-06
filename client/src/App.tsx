import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { NotificationProvider } from './context/NotificationContext.js';
import { CartProvider } from './context/CartContext.js';
import { ProtectedRoute } from './components/auth/ProtectedRoute.js';

// Storefront pages (development branch)
import { StorefrontHomePage } from './pages/storefront/StorefrontHomePage.js';
import { StorefrontCatalogPage } from './pages/storefront/StorefrontCatalogPage.js';

// Admin auth pages: OTP login (this branch) + simple login/register (development branch)
import { LoginPage } from './pages/LoginPage.js';
import { AdminLoginPage } from './pages/AdminLoginPage.js';
import { ProfilePage } from './pages/ProfilePage.js';

// Admin operations pages
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
              {/* Customer-facing storefront */}
              <Route path="/" element={<StorefrontHomePage />} />
              <Route path="/shop" element={<StorefrontCatalogPage />} />

              {/* Admin auth */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Preferred admin routes (development branch) */}
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

              {/* Backward-compatible direct routes */}
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
