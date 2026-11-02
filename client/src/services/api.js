const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Cross-tab synchronization channel
let syncChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    syncChannel = new BroadcastChannel('meh_store_sync_v1');
    syncChannel.onmessage = (event) => {
      if (event.data === 'SYNC_REQUIRED') {
        clearApiCache();
        window.dispatchEvent(new CustomEvent('meh_data_synced'));
      }
    };
  } catch (_) {}
}

// In-memory cache for concurrent inflight request deduplication (1.5s max to prevent redundant simultaneous mounts)
const apiCache = new Map();
const inflightRequests = new Map();
const DEFAULT_TTL_MS = 1500; // 1.5 seconds maximum for simultaneous duplicate component mounts

export function clearApiCache() {
  apiCache.clear();
  inflightRequests.clear();
}

function broadcastSync() {
  clearApiCache();
  if (syncChannel) {
    try {
      syncChannel.postMessage('SYNC_REQUIRED');
    } catch (_) {}
  }
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('meh_last_sync_timestamp', Date.now().toString());
      window.dispatchEvent(new CustomEvent('meh_data_synced'));
    } catch (_) {}
  }
}

export async function request(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const url = `${API_BASE}${endpoint}`;
  const headers = { ...options.headers };

  // Attach token if present (admin or customer)
  const adminToken = localStorage.getItem('meh_admin_token');
  const customerToken = localStorage.getItem('meh_customer_token');
  const token = adminToken || customerToken;

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle json body unless FormData
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  // For state-mutating requests, invalidate all cached GET responses and notify all tabs
  if (method !== 'GET') {
    broadcastSync();
  }

  // Cache & deduplication logic for GET requests
  const isCacheableGet = method === 'GET' && !headers['Authorization'] && !options.skipCache;
  const cacheKey = url;

  if (isCacheableGet) {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < DEFAULT_TTL_MS) {
      return cached.data;
    }

    if (inflightRequests.has(cacheKey)) {
      return inflightRequests.get(cacheKey);
    }
  }

  const fetchPromise = (async () => {
    try {
      const response = await fetch(url, {
        cache: 'no-cache',
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({
        success: false,
        message: `Server returned ${response.status} ${response.statusText}`,
      }));

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      if (isCacheableGet && data && data.success !== false) {
        apiCache.set(cacheKey, { timestamp: Date.now(), data });
      }

      return data;
    } finally {
      if (isCacheableGet) {
        inflightRequests.delete(cacheKey);
      }
    }
  })();

  if (isCacheableGet) {
    inflightRequests.set(cacheKey, fetchPromise);
  }

  return fetchPromise;
}

export const api = {
  clearCache: broadcastSync,
  broadcastSync,
  // Health & DB diagnostics
  getHealth: () => request('/health'),

  // Categories
  getCategories: (includeInactive = false) => request(`/categories?includeInactive=${includeInactive}`),
  getCategory: (idOrSlug) => request(`/categories/${idOrSlug}`),
  createCategory: (data) => request('/categories', { method: 'POST', body: data }),
  updateCategory: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: data }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
  addSubcategory: (catId, data) => request(`/categories/${catId}/subcategories`, { method: 'POST', body: data }),
  deleteSubcategory: (catId, subId) => request(`/categories/${catId}/subcategories/${subId}`, { method: 'DELETE' }),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },
  getProduct: (idOrSlug) => request(`/products/${idOrSlug}`),
  createProduct: (data) => request('/products', { method: 'POST', body: data }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: data }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  updateStock: (id, stockQuantity) => request(`/products/${id}/stock`, { method: 'PATCH', body: { stockQuantity } }),

  // Orders
  createOrder: (data) => request('/orders', { method: 'POST', body: data }),
  verifyPayment: (data) => request('/orders/verify-payment', { method: 'POST', body: data }),
  reportPaymentFailed: (data) => request('/orders/payment-failed', { method: 'POST', body: data }),
  reconcileBalance: (id, data) => request(`/orders/${id}/reconcile-balance`, { method: 'PATCH', body: data }),
  trackOrder: (orderNumber, phone) => request(`/orders/track?orderNumber=${encodeURIComponent(orderNumber)}${phone ? `&phone=${encodeURIComponent(phone)}` : ''}`),
  getMyOrders: () => request('/orders/my-orders'),
  getAllOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/orders${query ? `?${query}` : ''}`);
  },
  updateOrderStatus: (id, status, paymentStatus) => request(`/orders/${id}/status`, { method: 'PATCH', body: { status, paymentStatus } }),

  // CMS
  getAnnouncement: () => request('/cms/announcement'),
  updateAnnouncement: (data) => request('/cms/announcement', { method: 'PUT', body: data }),
  getBanners: (all = false) => request(`/cms/banners?all=${all}`),
  createBanner: (data) => request('/cms/banners', { method: 'POST', body: data }),
  updateBanner: (id, data) => request(`/cms/banners/${id}`, { method: 'PUT', body: data }),
  deleteBanner: (id) => request(`/cms/banners/${id}`, { method: 'DELETE' }),
  validateCoupon: (code, cartTotal) => request(`/cms/coupons/validate?code=${encodeURIComponent(code)}&cartTotal=${cartTotal}`),
  getCoupons: () => request('/cms/coupons'),
  getReviews: (productId) => request(`/cms/reviews/${productId}`),
  getStorefrontReviews: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/cms/reviews${query ? `?${query}` : ''}`);
  },
  addReview: (data) => request('/cms/reviews', { method: 'POST', body: data }),
  getAllReviews: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/cms/admin/reviews${query ? `?${query}` : ''}`);
  },
  createReview: (data) => request('/cms/admin/reviews', { method: 'POST', body: data }),
  updateReview: (id, data) => request(`/cms/admin/reviews/${id}`, { method: 'PUT', body: data }),
  toggleReviewActive: (id) => request(`/cms/admin/reviews/${id}/toggle`, { method: 'PATCH' }),
  deleteReview: (id) => request(`/cms/admin/reviews/${id}`, { method: 'DELETE' }),
  reorderReviews: (orderedIds) => request('/cms/admin/reviews/reorder', { method: 'PATCH', body: { orderedIds } }),
  updateReviewStatus: (id, status) => request(`/cms/admin/reviews/${id}`, { method: 'PATCH', body: { status } }),
  getSettings: () => request('/cms/settings'),
  updateSettings: (data) => request('/cms/settings', { method: 'PUT', body: data }),
  getTranslations: () => request('/cms/translations'),
  updateTranslations: (data) => request('/cms/translations', { method: 'PUT', body: data }),
  getNewArrivals: () => request('/cms/new-arrivals'),
  updateNewArrivals: (data) => request('/cms/new-arrivals', { method: 'PUT', body: data }),
  getCollectionSlides: (includeAll = false) => request('/cms/collection-slides' + (includeAll ? '?all=true' : '')),
  updateCollectionSlides: (slides) => request('/cms/collection-slides', { method: 'PUT', body: { slides } }),

  // Reels API
  getReels: (includeInactive = false) => request(`/reels${includeInactive ? '?includeInactive=true' : ''}`),
  getAdminReels: () => request('/reels/admin'),
  getReel: (id) => request(`/reels/${id}`),
  createReel: (data) => request('/reels', { method: 'POST', body: data }),
  updateReel: (id, data) => request(`/reels/${id}`, { method: 'PUT', body: data }),
  toggleReelStatus: (id) => request(`/reels/${id}/toggle`, { method: 'PATCH' }),
  reorderReels: (orderedIds) => request('/reels/reorder', { method: 'PATCH', body: { orderedIds } }),
  deleteReel: (id) => request(`/reels/${id}`, { method: 'DELETE' }),

  // Newsletter & Contact Inquiries
  subscribeNewsletter: (email) => request('/cms/newsletter', { method: 'POST', body: { email } }),
  sendContactInquiry: (data) => request('/cms/contact', { method: 'POST', body: data }),

  // Dashboard
  getDashboardStats: () => request('/dashboard/stats'),

  // Uploads
  uploadImage: (formData) => request('/uploads', { method: 'POST', body: formData }),
  uploadVideo: (formData) => request('/uploads/video', { method: 'POST', body: formData }),

  // Auth
  adminLogin: (email, password) => request('/auth/admin/login', { method: 'POST', body: { email, password } }),
  adminMe: () => request('/auth/admin/me'),
  customerRegister: (data) => request('/auth/customer/register', { method: 'POST', body: data }),
  customerLogin: (identifier, password) => request('/auth/customer/login', { method: 'POST', body: { identifier, password } }),
  getCustomerProfile: () => request('/auth/customer/profile'),
  updateCustomerProfile: (data) => request('/auth/customer/profile', { method: 'PUT', body: data }),
};
