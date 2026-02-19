'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

export function CartDrawer() {
  const { cart, isOpen, closeCart, updateItem, removeItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const items = cart?.items || [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-50 backdrop-blur-sm animate-fade-in"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white z-50 flex flex-col shadow-2xl animate-slide-down">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} />
            <h2 className="font-display text-xl">Shopping Bag</h2>
            {items.length > 0 && (
              <span className="bg-brand-charcoal text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cart?.itemCount}
              </span>
            )}
          </div>
          <button onClick={closeCart} className="p-2 hover:bg-brand-beige rounded transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={48} className="text-gray-200 mb-4" />
              <p className="font-display text-xl text-gray-400 mb-2">Your bag is empty</p>
              <p className="text-sm text-gray-400 mb-6">Add items to get started</p>
              <button
                onClick={closeCart}
                className="btn-primary"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item._id} className="flex gap-4">
                  {/* Image */}
                  <Link
                    href={`/products/${item.product?._id}`}
                    onClick={closeCart}
                    className="flex-shrink-0 w-24 h-32 bg-brand-beige overflow-hidden"
                  >
                    <Image
                      src={item.image || item.product?.images?.[0]?.url || '/placeholder.jpg'}
                      alt={item.name}
                      width={96}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.product?._id}`}
                      onClick={closeCart}
                      className="font-medium text-sm hover:text-brand-gold transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-gray-400 mt-1">{item.size} · {item.color}</p>
                    <p className="text-sm font-medium mt-1">${item.price.toFixed(2)}</p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-gray-200">
                        <button
                          onClick={() => updateItem(item._id, item.quantity - 1)}
                          className="p-1.5 hover:bg-brand-beige transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateItem(item._id, item.quantity + 1)}
                          className="p-1.5 hover:bg-brand-beige transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="text-right">
                    <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-6 space-y-4">
            {/* Coupon info */}
            {cart?.couponCode && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Coupon: {cart.couponCode}</span>
                <span>-${cart.discountAmount?.toFixed(2)}</span>
              </div>
            )}

            {/* Subtotal */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Subtotal</span>
              <span className="font-medium">${cart?.subtotal?.toFixed(2)}</span>
            </div>

            {cart?.discountAmount > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span className="text-sm">Discount</span>
                <span className="font-medium">-${cart?.discountAmount?.toFixed(2)}</span>
              </div>
            )}

            <p className="text-xs text-gray-400">Shipping and taxes calculated at checkout</p>

            <div className="space-y-3">
              <Link
                href={isAuthenticated ? '/checkout' : '/auth/login?redirect=/checkout'}
                className="btn-primary w-full text-center block"
                onClick={closeCart}
              >
                Proceed to Checkout
              </Link>
              <button
                onClick={closeCart}
                className="btn-secondary w-full"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
