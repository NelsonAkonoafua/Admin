'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ChevronRight, Filter } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ordersAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-amber-700 bg-amber-50 border-amber-200',
  confirmed: 'text-blue-700 bg-blue-50 border-blue-200',
  processing: 'text-purple-700 bg-purple-50 border-purple-200',
  shipped: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  delivered: 'text-green-700 bg-green-50 border-green-200',
  cancelled: 'text-red-700 bg-red-50 border-red-200',
  refunded: 'text-gray-700 bg-gray-50 border-gray-200',
};

export default function AdminOrdersPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') { router.push('/'); return; }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await ordersAPI.getAll({ limit: 50 });
      setOrders(res.data.orders);
    } catch { } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await ordersAPI.updateStatus(orderId, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update order');
    }
  };

  const filtered = orders.filter(o => {
    const matchesSearch = !search ||
      o.orderNumber?.includes(search) ||
      o.user?.email?.includes(search) ||
      `${o.user?.firstName} ${o.user?.lastName}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !filterStatus || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/admin" className="hover:text-brand-charcoal">Dashboard</Link>
        <ChevronRight size={14} />
        <span>Orders</span>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl">Orders</h1>
        <span className="text-sm text-gray-400">{filtered.length} orders</span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="input-field pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="input-field max-w-[180px]"
        >
          <option value="">All Statuses</option>
          {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-brand-cream border-b border-gray-100">
                {['Order', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left p-4 text-xs tracking-wider uppercase text-gray-400 font-medium last:text-center">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(order => (
                <tr key={order._id} className="hover:bg-brand-cream/50 transition-colors">
                  <td className="p-4">
                    <Link href={`/admin/orders/${order._id}`} className="font-mono text-sm font-medium hover:text-brand-gold transition-colors">
                      #{order.orderNumber}
                    </Link>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-sm">{order.user?.firstName} {order.user?.lastName}</p>
                      <p className="text-xs text-gray-400">{order.user?.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm">{order.items?.length} item(s)</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-medium">${order.total?.toFixed(2)}</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 border rounded font-medium ${STATUS_COLORS[order.status] || 'text-gray-600'}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <select
                      value={order.status}
                      onChange={e => handleStatusUpdate(order._id, e.target.value)}
                      className="text-xs border border-gray-200 px-2 py-1 bg-white hover:border-brand-charcoal transition-colors"
                    >
                      {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>No orders found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
