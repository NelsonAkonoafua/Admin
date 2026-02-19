'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Users, Package, DollarSign, TrendingUp, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { adminAPI } from '@/lib/api';

export default function AdminDashboard() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (user?.role !== 'admin') { router.push('/'); return; }
    adminAPI.getStats()
      .then(res => setStats(res.data.stats))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 animate-pulse rounded" />)}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats?.revenue?.total?.toFixed(2) || '0.00'}`,
      change: stats?.revenue?.growth,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Total Orders',
      value: stats?.orders?.total || 0,
      change: null,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Total Customers',
      value: stats?.users?.total || 0,
      change: null,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      title: 'Total Products',
      value: stats?.products?.total || 0,
      change: null,
      icon: Package,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
  ];

  const orderStatusColors: Record<string, string> = {
    pending: 'text-amber-600',
    confirmed: 'text-blue-600',
    processing: 'text-purple-600',
    shipped: 'text-indigo-600',
    delivered: 'text-green-600',
    cancelled: 'text-red-600',
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-4xl">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back, {user?.firstName}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/products" className="btn-primary text-sm">+ Add Product</Link>
        </div>
      </div>

      {/* Quick links */}
      <div className="flex gap-3 flex-wrap mb-8">
        {[
          { label: 'Products', href: '/admin/products' },
          { label: 'Orders', href: '/admin/orders' },
          { label: 'Customers', href: '/admin/users' },
        ].map(({ label, href }) => (
          <Link key={label} href={href} className="btn-ghost border border-gray-200 text-sm">
            {label} <ArrowUpRight size={12} className="inline" />
          </Link>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {statCards.map(({ title, value, change, icon: Icon, color, bg }) => (
          <div key={title} className="bg-white border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${bg} rounded flex items-center justify-center`}>
                <Icon size={18} className={color} />
              </div>
              {change !== null && change !== undefined && (
                <div className={`flex items-center gap-1 text-xs ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  <TrendingUp size={12} />
                  {change >= 0 ? '+' : ''}{change}%
                </div>
              )}
            </div>
            <p className="text-2xl font-medium mb-1">{value}</p>
            <p className="text-xs text-gray-400">{title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white border border-gray-100">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-medium">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-gray-400 hover:text-brand-charcoal transition-colors">View all →</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {stats?.recentOrders?.length === 0 ? (
              <p className="text-center py-8 text-gray-400 text-sm">No orders yet</p>
            ) : (
              stats?.recentOrders?.map((order: any) => (
                <Link
                  key={order._id}
                  href={`/admin/orders/${order._id}`}
                  className="flex items-center justify-between p-4 hover:bg-brand-cream transition-colors"
                >
                  <div>
                    <p className="font-mono text-sm font-medium">#{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">{order.user?.firstName} {order.user?.lastName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${order.total?.toFixed(2)}</p>
                    <p className={`text-xs ${orderStatusColors[order.status] || 'text-gray-500'}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Low stock alert */}
          {stats?.products?.lowStock > 0 && (
            <div className="bg-amber-50 border border-amber-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle size={18} className="text-amber-600" />
                <h3 className="font-medium text-amber-800">Low Stock Alert</h3>
              </div>
              <p className="text-sm text-amber-700">
                {stats.products.lowStock} product variant(s) have less than 5 units remaining.
              </p>
              <Link href="/admin/products?lowStock=true" className="text-xs text-amber-600 hover:underline mt-2 block">
                View products →
              </Link>
            </div>
          )}

          {/* Order status breakdown */}
          <div className="bg-white border border-gray-100 p-5">
            <h3 className="font-medium mb-4">Orders by Status</h3>
            <div className="space-y-3">
              {Object.entries(stats?.orders?.byStatus || {}).map(([status, count]: [string, any]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      status === 'delivered' ? 'bg-green-500' :
                      status === 'shipped' ? 'bg-indigo-500' :
                      status === 'processing' ? 'bg-purple-500' :
                      status === 'confirmed' ? 'bg-blue-500' :
                      status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                    <span className="text-sm capitalize">{status}</span>
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top products */}
          <div className="bg-white border border-gray-100 p-5">
            <h3 className="font-medium mb-4">Top Selling</h3>
            <div className="space-y-3">
              {stats?.topProducts?.map((product: any, i: number) => (
                <div key={product._id} className="flex items-center gap-3">
                  <span className="text-xs text-gray-300 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.totalSold} sold</p>
                  </div>
                  <span className="text-sm">${product.price?.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
