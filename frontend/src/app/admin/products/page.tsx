'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit2, Trash2, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { productsAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') { router.push('/'); return; }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await productsAPI.getAll({ limit: 50 });
      setProducts(res.data.products);
    } catch { } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    try {
      await productsAPI.delete(id);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/admin" className="hover:text-brand-charcoal">Dashboard</Link>
        <ChevronRight size={14} />
        <span>Products</span>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl">Products</h1>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input-field pl-10"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-brand-cream border-b border-gray-100">
                <th className="text-left p-4 text-xs tracking-wider uppercase text-gray-400 font-medium">Product</th>
                <th className="text-left p-4 text-xs tracking-wider uppercase text-gray-400 font-medium hidden md:table-cell">Category</th>
                <th className="text-left p-4 text-xs tracking-wider uppercase text-gray-400 font-medium hidden md:table-cell">Price</th>
                <th className="text-left p-4 text-xs tracking-wider uppercase text-gray-400 font-medium hidden lg:table-cell">Stock</th>
                <th className="text-left p-4 text-xs tracking-wider uppercase text-gray-400 font-medium hidden lg:table-cell">Sold</th>
                <th className="text-left p-4 text-xs tracking-wider uppercase text-gray-400 font-medium">Status</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(product => {
                const totalStock = product.variants?.reduce((s: number, v: any) => s + v.stock, 0) || 0;
                return (
                  <tr key={product._id} className="hover:bg-brand-cream/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-16 bg-brand-beige overflow-hidden flex-shrink-0 relative">
                          {product.images?.[0] && (
                            <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-sm text-gray-500">{product.category?.name}</span>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div>
                        <span className="text-sm font-medium">${product.price?.toFixed(2)}</span>
                        {product.compareAtPrice && (
                          <span className="text-xs text-gray-400 line-through ml-2">${product.compareAtPrice?.toFixed(2)}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className={`text-sm ${totalStock < 5 ? 'text-red-500 font-medium' : 'text-gray-600'}`}>
                        {totalStock} units
                      </span>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="text-sm text-gray-500">{product.totalSold || 0}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {product.isFeatured && <span className="text-xs text-brand-gold">Featured</span>}
                        {product.isNewArrival && <span className="text-xs text-blue-500">New</span>}
                        {!product.isActive && <span className="text-xs text-red-500">Inactive</span>}
                        {product.isActive && !product.isFeatured && !product.isNewArrival && (
                          <span className="text-xs text-green-500">Active</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          href={`/admin/products/${product._id}/edit`}
                          className="p-2 hover:bg-brand-beige rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id, product.name)}
                          className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>No products found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
