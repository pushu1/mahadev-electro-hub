import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { QuickViewProvider } from './context/QuickViewContext.jsx';

import CartDrawer from './components/common/CartDrawer.jsx';
import FloatingWhatsAppButton from './components/common/FloatingWhatsAppButton.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';

// Direct import for HomePage to ensure immediate First Contentful Paint (FCP) and LCP
import HomePage from './pages/HomePage.jsx';

// Lazy-loaded Public Pages (Code Splitting)
const ShopPage = lazy(() => import('./pages/ShopPage.jsx'));
const CategoryPage = lazy(() => import('./pages/CategoryPage.jsx'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage.jsx'));
const CartPage = lazy(() => import('./pages/CartPage.jsx'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage.jsx'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage.jsx'));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage.jsx'));
const CustomerLoginPage = lazy(() => import('./pages/CustomerLoginPage.jsx'));
const CustomerRegisterPage = lazy(() => import('./pages/CustomerRegisterPage.jsx'));
const MyAccountPage = lazy(() => import('./pages/MyAccountPage.jsx'));
const WishlistPage = lazy(() => import('./pages/WishlistPage.jsx'));
const AboutUsPage = lazy(() => import('./pages/AboutUsPage.jsx'));
const ContactUsPage = lazy(() => import('./pages/ContactUsPage.jsx'));
const FaqPage = lazy(() => import('./pages/FaqPage.jsx'));
const PoliciesPage = lazy(() => import('./pages/PoliciesPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

// Lazy-loaded Modals
const ProductQuickViewModal = lazy(() => import('./components/common/ProductQuickViewModal.jsx'));

// Lazy-loaded Admin Pages (Code Splitting - completely segregated from storefront bundle)
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage.jsx'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage.jsx'));
const ProductManagementPage = lazy(() => import('./pages/admin/ProductManagementPage.jsx'));
const CategoryManagementPage = lazy(() => import('./pages/admin/CategoryManagementPage.jsx'));
const OrderManagementPage = lazy(() => import('./pages/admin/OrderManagementPage.jsx'));
const InventoryManagementPage = lazy(() => import('./pages/admin/InventoryManagementPage.jsx'));
const CmsManagementPage = lazy(() => import('./pages/admin/CmsManagementPage.jsx'));
const ReelsManagementPage = lazy(() => import('./pages/admin/ReelsManagementPage.jsx'));

// Minimalist theme-compliant loading skeleton
const PageLoadingFallback = () => (
  <div className="min-h-[60vh] bg-[#080808] flex items-center justify-center" aria-label="Loading page">
    <div className="w-8 h-8 rounded-full border-2 border-[#D6A52A]/30 border-t-[#D6A52A] animate-spin" />
  </div>
);

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <QuickViewProvider>
            <BrowserRouter>
              <CartDrawer />
              <Suspense fallback={null}>
                <ProductQuickViewModal />
              </Suspense>
              <FloatingWhatsAppButton />
              <ErrorBoundary>
                <Suspense fallback={<PageLoadingFallback />}>
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
                </Suspense>
              </ErrorBoundary>
            </BrowserRouter>
          </QuickViewProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
