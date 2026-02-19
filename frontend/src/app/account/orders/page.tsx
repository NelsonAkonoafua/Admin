'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ordersAPI } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-amber-600 bg-amber-50',
  confirmed: 'text-blue-600 bg-blue-50',
  processing: 'text-purple-600 bg-purple-50',
  shipped: 'text-indigo-600 bg-indigo-50',
  delivered: 'text-green-600 bg-green-50',
  cancelled: 'text-red-600 bg-red-50',
  refunded: 'text-gray-600 bg-gray-50',
};

export default function OrdersPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login?redirect=/account/orders'); return; }
    ordersAPI.getMyOrders()
      .then(res => setOrders(res.data.orders))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-10">
        <Link href="/account" className="text-sm text-gray-400 hover:text-brand-charcoal">Account</Link>
        <ChevronRight size={14} className="text-gray-300" />
        <span className="text-sm">Orders</span>
      </div>

      <h1 className="font-display text-4xl mb-10">My Orders</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={60} className="text-gray-200 mx-auto mb-4" />
          <p className="font-display text-2xl text-gray-300 mb-2">No orders yet</p>
          <p className="text-gray-400 text-sm mb-8">When you place an order, it will appear here.</p>
          <Link href="/products" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link
              key={order._id}
              href={`/account/orders/${order._id}`}
              className="block bg-white border border-gray-100 p-6 hover:border-brand-charcoal hover:shadow-sm transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono font-medium">#{order.orderNumber}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status] || 'text-gray-600 bg-gray-50'}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {order.items?.length} item(s): {order.items?.slice(0, 2).map((i: any) => i.name).join(', ')}
                    {order.items?.length > 2 && ` +${order.items.length - 2} more`}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-medium text-lg">${order.total?.toFixed(2)}</p>
                    {order.trackingNumber && (
                      <p className="text-xs text-gray-400 mt-1">Track: {order.trackingNumber}</p>
                    )}
                  </div>
                  <ChevronRight size={20} className="text-gray-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
