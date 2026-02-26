import axios from 'axios';

// In production (Vercel) the Express backend is served as a serverless function
// on the same domain under /api, so we use a relative URL.  The Next.js dev
// proxy (next.config.js rewrites) forwards /api/* to localhost:5000 locally.
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('forabby_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('forabby_token');
        localStorage.removeItem('forabby_user');
        window.dispatchEvent(new Event('auth:logout'));
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { firstName: string; lastName: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/update-password', data),
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),
};

// Products API
export const productsAPI = {
  getAll: (params?: Record<string, any>) => api.get('/products', { params }),
  getOne: (identifier: string) => api.get(`/products/${identifier}`),
  getFeatured: () => api.get('/products/featured'),
  getRelated: (id: string) => api.get(`/products/${id}/related`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getOne: (identifier: string) => api.get(`/categories/${identifier}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addItem: (data: { productId: string; variantId: string; quantity: number; size: string; color: string }) =>
    api.post('/cart', data),
  updateItem: (itemId: string, quantity: number) => api.put(`/cart/${itemId}`, { quantity }),
  removeItem: (itemId: string) => api.delete(`/cart/${itemId}`),
  clearCart: () => api.delete('/cart'),
  applyCoupon: (code: string) => api.post('/cart/coupon', { code }),
  removeCoupon: () => api.delete('/cart/coupon/remove'),
};

// Orders API
export const ordersAPI = {
  create: (data: any) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getOne: (id: string) => api.get(`/orders/${id}`),
  getAll: (params?: Record<string, any>) => api.get('/orders', { params }),
  updateStatus: (id: string, data: any) => api.put(`/orders/${id}/status`, data),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data: any) => api.post('/users/addresses', data),
  updateAddress: (addressId: string, data: any) => api.put(`/users/addresses/${addressId}`, data),
  deleteAddress: (addressId: string) => api.delete(`/users/addresses/${addressId}`),
  toggleWishlist: (productId: string) => api.post(`/users/wishlist/${productId}`),
  getAll: (params?: Record<string, any>) => api.get('/users', { params }),
  updateUser: (id: string, data: any) => api.put(`/users/${id}`, data),
};

// Reviews API
export const reviewsAPI = {
  getProductReviews: (productId: string, params?: Record<string, any>) =>
    api.get(`/reviews/product/${productId}`, { params }),
  create: (data: { productId: string; rating: number; title: string; comment: string }) =>
    api.post('/reviews', data),
  update: (id: string, data: any) => api.put(`/reviews/${id}`, data),
  delete: (id: string) => api.delete(`/reviews/${id}`),
};

// Payments API
export const paymentsAPI = {
  createPaymentIntent: (data: { amount: number; currency?: string; orderId?: string }) =>
    api.post('/payments/create-payment-intent', data),
  createCheckoutSession: () => api.post('/payments/create-checkout-session'),
  confirmPayment: (data: { paymentIntentId: string; orderId: string }) =>
    api.post('/payments/confirm', data),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getRevenueChart: (period?: string) => api.get('/admin/revenue-chart', { params: { period } }),
};

// Upload API
export const uploadAPI = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    return api.post('/uploads/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

export default api;
