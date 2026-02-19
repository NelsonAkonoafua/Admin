'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Lock, Tag, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { ordersAPI, paymentsAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const TAX_RATE = 0.08;

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, applyCoupon, removeCoupon } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();

  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [isLoading, setIsLoading] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const [shippingForm, setShippingForm] = useState({
    fullName: user ? `${user.firstName} ${user.lastName}` : '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    phone: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/checkout');
    }
  }, [isAuthenticated]);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display text-3xl text-gray-300 mb-4">Your cart is empty</h2>
        <Link href="/products" className="btn-primary inline-block">Continue Shopping</Link>
      </div>
    );
  }

  const subtotal = cart.subtotal || 0;
  const discount = cart.discountAmount || 0;
  const shippingCost = subtotal >= 100 ? 0 : 9.99;
  const tax = Math.round((subtotal - discount) * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal - discount + shippingCost + tax) * 100) / 100;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    try {
      await applyCoupon(couponInput.trim());
      setCouponInput('');
    } catch {
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      const orderData = {
        shippingAddress: shippingForm,
        paymentMethod: 'card',
        paymentResult: {
          id: `sim_${Date.now()}`,
          status: 'succeeded',
          updateTime: new Date().toISOString(),
          emailAddress: user?.email
        }
      };

      const response = await ordersAPI.create(orderData);
      const order = response.data.order;

      toast.success('Order placed successfully!');
      router.push(`/order-success?orderId=${order._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCardNumber = (val: string) => {
    return val.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
  };

  const formatExpiry = (val: string) => {
    return val.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-10">
        <Link href="/" className="logo-text text-2xl">forAbby</Link>
        <span className="text-gray-200">/</span>
        <span className="text-sm text-gray-500">Checkout</span>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-4 mb-10">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'shipping' ? 'bg-brand-charcoal text-white' : 'bg-brand-charcoal text-white'}`}>
            {step === 'payment' ? '✓' : '1'}
          </div>
          <span className="text-sm font-medium">Shipping</span>
        </div>
        <ChevronRight size={16} className="text-gray-300" />
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'payment' ? 'bg-brand-charcoal text-white' : 'bg-gray-200 text-gray-400'}`}>
            2
          </div>
          <span className={`text-sm ${step === 'payment' ? 'font-medium' : 'text-gray-400'}`}>Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Left - Forms */}
        <div className="lg:col-span-3">
          {step === 'shipping' ? (
            <div>
              <h2 className="font-display text-2xl mb-6">Shipping Information</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="label-field">Full Name</label>
                  <input
                    type="text"
                    value={shippingForm.fullName}
                    onChange={e => setShippingForm(p => ({ ...p, fullName: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label-field">Address Line 1</label>
                  <input
                    type="text"
                    value={shippingForm.addressLine1}
                    onChange={e => setShippingForm(p => ({ ...p, addressLine1: e.target.value }))}
                    className="input-field"
                    placeholder="Street address"
                    required
                  />
                </div>
                <div>
                  <label className="label-field">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    value={shippingForm.addressLine2}
                    onChange={e => setShippingForm(p => ({ ...p, addressLine2: e.target.value }))}
                    className="input-field"
                    placeholder="Apt, suite, etc."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-field">City</label>
                    <input
                      type="text"
                      value={shippingForm.city}
                      onChange={e => setShippingForm(p => ({ ...p, city: e.target.value }))}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="label-field">State</label>
                    <input
                      type="text"
                      value={shippingForm.state}
                      onChange={e => setShippingForm(p => ({ ...p, state: e.target.value }))}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-field">ZIP / Postal Code</label>
                    <input
                      type="text"
                      value={shippingForm.postalCode}
                      onChange={e => setShippingForm(p => ({ ...p, postalCode: e.target.value }))}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="label-field">Country</label>
                    <select
                      value={shippingForm.country}
                      onChange={e => setShippingForm(p => ({ ...p, country: e.target.value }))}
                      className="input-field"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label-field">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={shippingForm.phone}
                    onChange={e => setShippingForm(p => ({ ...p, phone: e.target.value }))}
                    className="input-field"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (!shippingForm.fullName || !shippingForm.addressLine1 || !shippingForm.city || !shippingForm.state || !shippingForm.postalCode) {
                    toast.error('Please fill in all required fields');
                    return;
                  }
                  setStep('payment');
                }}
                className="btn-primary w-full mt-8"
              >
                Continue to Payment
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl">Payment</h2>
                <button onClick={() => setStep('shipping')} className="text-sm text-gray-400 hover:text-brand-charcoal transition-colors">
                  ← Edit shipping
                </button>
              </div>

              {/* Shipping summary */}
              <div className="bg-brand-beige p-4 mb-6 text-sm">
                <p className="text-gray-400 text-xs tracking-wider uppercase mb-2">Shipping to</p>
                <p className="font-medium">{shippingForm.fullName}</p>
                <p className="text-gray-600">{shippingForm.addressLine1}{shippingForm.addressLine2 && `, ${shippingForm.addressLine2}`}</p>
                <p className="text-gray-600">{shippingForm.city}, {shippingForm.state} {shippingForm.postalCode}</p>
              </div>

              {/* Secure badge */}
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
                <Lock size={14} className="text-brand-gold" />
                <span>Secure 256-bit SSL encrypted payment</span>
              </div>

              {/* Card form */}
              <div className="space-y-4">
                <div>
                  <label className="label-field">Card Number</label>
                  <input
                    type="text"
                    value={paymentForm.cardNumber}
                    onChange={e => setPaymentForm(p => ({ ...p, cardNumber: formatCardNumber(e.target.value) }))}
                    className="input-field font-mono"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                <div>
                  <label className="label-field">Name on Card</label>
                  <input
                    type="text"
                    value={paymentForm.cardName}
                    onChange={e => setPaymentForm(p => ({ ...p, cardName: e.target.value }))}
                    className="input-field"
                    placeholder="Emma Johnson"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-field">Expiry Date</label>
                    <input
                      type="text"
                      value={paymentForm.expiryDate}
                      onChange={e => setPaymentForm(p => ({ ...p, expiryDate: formatExpiry(e.target.value) }))}
                      className="input-field"
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="label-field">CVV</label>
                    <input
                      type="text"
                      value={paymentForm.cvv}
                      onChange={e => setPaymentForm(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                      className="input-field"
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isLoading}
                className="btn-primary w-full mt-8 flex items-center justify-center gap-2"
              >
                <Lock size={16} />
                {isLoading ? 'Processing...' : `Place Order · $${total.toFixed(2)}`}
              </button>

              <p className="text-center text-xs text-gray-400 mt-4">
                By placing your order, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          )}
        </div>

        {/* Right - Order summary */}
        <div className="lg:col-span-2">
          <div className="bg-brand-cream p-6 sticky top-28">
            <h3 className="font-display text-xl mb-6">Order Summary</h3>

            {/* Items */}
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              {cart.items.map((item: any) => (
                <div key={item._id} className="flex gap-3">
                  <div className="w-16 h-20 bg-brand-beige overflow-hidden flex-shrink-0 relative">
                    <Image
                      src={item.image || item.product?.images?.[0]?.url || '/placeholder.jpg'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute -top-1 -right-1 bg-brand-charcoal text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.size} · {item.color}</p>
                    <p className="text-sm mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              {cart.couponCode ? (
                <div className="flex items-center justify-between bg-green-50 px-3 py-2 text-sm text-green-700">
                  <div className="flex items-center gap-2">
                    <Tag size={14} />
                    <span>{cart.couponCode}</span>
                  </div>
                  <button onClick={() => removeCoupon()} className="hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value.toUpperCase())}
                    className="input-field flex-1 py-2 text-xs"
                    placeholder="Coupon code (try WELCOME20)"
                    onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon}
                    className="btn-secondary px-4 py-2 text-xs whitespace-nowrap"
                  >
                    {isApplyingCoupon ? '...' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-medium border-t border-gray-200 pt-3">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
