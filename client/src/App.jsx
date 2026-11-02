import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { QuickViewProvider } from './context/QuickViewContext.jsx';

import CartDrawer from './components/common/CartDrawer.jsx';
import ProductQuickViewModal from './components/common/ProductQuickViewModal.jsx';
import FloatingWhatsAppButton from './components/common/FloatingWhatsAppButton.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';

// Public Pages
import HomePage from './pages/HomePage.jsx';
import ShopPage from './pages/ShopPage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrderConfirmationPage from './pages/OrderConfirmationPage.jsx';
import TrackOrderPage from './pages/TrackOrderPage.jsx';
import CustomerLoginPage from './pages/CustomerLoginPage.jsx';
import CustomerRegisterPage from './pages/CustomerRegisterPage.jsx';
import MyAccountPage from './pages/MyAccountPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import AboutUsPage from './pages/AboutUsPage.jsx';
import ContactUsPage from './pages/ContactUsPage.jsx';
import FaqPage from './pages/FaqPage.jsx';
import PoliciesPage from './pages/PoliciesPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import ProductManagementPage from './pages/admin/ProductManagementPage.jsx';
import CategoryManagementPage from './pages/admin/CategoryManagementPage.jsx';
import OrderManagementPage from './pages/admin/OrderManagementPage.jsx';
import InventoryManagementPage from './pages/admin/InventoryManagementPage.jsx';
import CmsManagementPage from './pages/admin/CmsManagementPage.jsx';
import ReelsManagementPage from './pages/admin/ReelsManagementPage.jsx';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <QuickViewProvider>
            <BrowserRouter>
              <CartDrawer />
              <ProductQuickViewModal />
              <FloatingWhatsAppButton />
              <ErrorBoundary>
                <Routes>
                  {/* Storefront Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/category/:slug" element={<CategoryPage />} />
                  <Route path="/product/:slug" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
                  <Route path="/track-order" element={<TrackOrderPage />} />

                  {/* Customer Account Routes */}
                  <Route path="/login" element={<CustomerLoginPage />} />
                  <Route path="/register" element={<CustomerRegisterPage />} />
                  <Route path="/my-account" element={<MyAccountPage />} />
                  <Route path="/my-orders" element={<MyAccountPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />

                  {/* Informational & Policy Routes */}
                  <Route path="/about" element={<AboutUsPage />} />
                  <Route path="/about-us" element={<AboutUsPage />} />
                  <Route path="/contact" element={<ContactUsPage />} />
                  <Route path="/contact-us" element={<ContactUsPage />} />
                  <Route path="/faq" element={<FaqPage />} />
                  <Route path="/faqs" element={<FaqPage />} />
                  <Route path="/shipping-policy" element={<PoliciesPage type="shipping" />} />
                  <Route path="/shipping" element={<PoliciesPage type="shipping" />} />
                  <Route path="/return-refund-policy" element={<PoliciesPage type="returns" />} />
                  <Route path="/return-policy" element={<PoliciesPage type="returns" />} />
                  <Route path="/returns" element={<PoliciesPage type="returns" />} />
                  <Route path="/privacy-policy" element={<PoliciesPage type="privacy" />} />
                  <Route path="/privacy" element={<PoliciesPage type="privacy" />} />
                  <Route path="/terms-conditions" element={<PoliciesPage type="terms" />} />
                  <Route path="/terms" element={<PoliciesPage type="terms" />} />

                  {/* Admin Portal Routes */}
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                  <Route path="/admin/products" element={<ProductManagementPage />} />
                  <Route path="/admin/categories" element={<CategoryManagementPage />} />
                  <Route path="/admin/orders" element={<OrderManagementPage />} />
                  <Route path="/admin/inventory" element={<InventoryManagementPage />} />
                  <Route path="/admin/reels" element={<ReelsManagementPage />} />
                  <Route path="/admin/reviews" element={<Navigate to="/admin/cms?tab=reviews" replace />} />
                  <Route path="/admin/cms" element={<CmsManagementPage />} />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </ErrorBoundary>
            </BrowserRouter>
          </QuickViewProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
