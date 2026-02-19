import { create } from 'zustand';
import { cartAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    images: Array<{ url: string; alt: string }>;
    price: number;
    isActive: boolean;
  };
  variantId: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
  name: string;
  image: string;
}

interface Cart {
  _id: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  itemCount: number;
  couponCode?: string;
  discount: number;
}

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  isOpen: boolean;
  fetchCart: () => Promise<void>;
  addItem: (data: { productId: string; variantId: string; quantity: number; size: string; color: string }) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  isOpen: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const response = await cartAPI.getCart();
      set({ cart: response.data.cart, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  addItem: async (data) => {
    set({ isLoading: true });
    try {
      const response = await cartAPI.addItem(data);
      set({ cart: response.data.cart, isLoading: false, isOpen: true });
      toast.success('Added to cart');
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to add item');
      throw error;
    }
  },

  updateItem: async (itemId, quantity) => {
    try {
      const response = await cartAPI.updateItem(itemId, quantity);
      set({ cart: response.data.cart });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update item');
    }
  },

  removeItem: async (itemId) => {
    try {
      const response = await cartAPI.removeItem(itemId);
      set({ cart: response.data.cart });
      toast.success('Item removed');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  },

  clearCart: async () => {
    try {
      await cartAPI.clearCart();
      set({ cart: null });
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  },

  applyCoupon: async (code) => {
    try {
      const response = await cartAPI.applyCoupon(code);
      set({ cart: response.data.cart });
      toast.success('Coupon applied successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid coupon code');
      throw error;
    }
  },

  removeCoupon: async () => {
    try {
      const response = await cartAPI.removeCoupon();
      set({ cart: response.data.cart });
      toast.success('Coupon removed');
    } catch (error) {
      toast.error('Failed to remove coupon');
    }
  },

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
}));
