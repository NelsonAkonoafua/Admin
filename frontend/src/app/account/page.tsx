'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, Heart, MapPin, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ordersAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login?redirect=/account'); return; }
    ordersAPI.getMyOrders().then(res => setRecentOrders(res.data.orders.slice(0, 3))).catch(() => {});
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    toast.success('Signed out successfully');
  };

  if (!user) return null;

  const menuItems = [
    { icon: Package, label: 'Orders', href: '/account/orders', description: 'Track and view your orders' },
    { icon: Heart, label: 'Wishlist', href: '/account/wishlist', description: 'Your saved items' },
    { icon: MapPin, label: 'Addresses', href: '/account/addresses', description: 'Manage shipping addresses' },
    { icon: Settings, label: 'Settings', href: '/account/settings', description: 'Account preferences' },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'text-amber-600 bg-amber-50',
      confirmed: 'text-blue-600 bg-blue-50',
      processing: 'text-purple-600 bg-purple-50',
      shipped: 'text-indigo-600 bg-indigo-50',
      delivered: 'text-green-600 bg-green-50',
      cancelled: 'text-red-600 bg-red-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="font-display text-4xl">My Account</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back, {user.firstName}</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors">
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      {/* Profile card */}
      <div className="bg-brand-beige p-6 mb-8 flex items-center gap-5">
        <div className="w-16 h-16 bg-brand-charcoal rounded-full flex items-center justify-center text-white font-display text-2xl">
          {user.firstName[0]}{user.lastName[0]}
        </div>
        <div>
          <h2 className="font-medium text-lg">{user.firstName} {user.lastName}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
          {user.role === 'admin' && (
            <Link href="/admin" className="text-xs text-brand-gold mt-1 block">Admin Dashboard →</Link>
          )}
        </div>
      </div>

      {/* Quick menu */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {menuItems.map(({ icon: Icon, label, href, description }) => (
          <Link
            key={label}
            href={href}
            className="bg-white border border-gray-100 p-5 hover:border-brand-charcoal hover:shadow-sm transition-all group"
          >
            <Icon size={20} className="text-brand-gold mb-3" />
            <p className="font-medium text-sm mb-1">{label}</p>
            <p className="text-xs text-gray-400">{description}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl">Recent Orders</h2>
          <Link href="/account/orders" className="text-sm hover:text-brand-gold transition-colors">View all →</Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12 bg-brand-cream">
            <Package size={40} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No orders yet</p>
            <Link href="/products" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map(order => (
              <Link
                key={order._id}
                href={`/account/orders/${order._id}`}
                className="flex items-center justify-between bg-white border border-gray-100 p-5 hover:border-brand-charcoal transition-all"
              >
                <div>
                  <p className="font-mono font-medium">#{order.orderNumber}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()} · {order.itemCount} item(s)</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${order.total?.toFixed(2)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
