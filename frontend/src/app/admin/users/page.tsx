'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ChevronRight, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { usersAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const { isAuthenticated, user: currentUser } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== 'admin') { router.push('/'); return; }
    usersAPI.getAll({ limit: 100 })
      .then(res => setUsers(res.data.users))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      await usersAPI.updateUser(userId, { isActive: !isActive });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !isActive } : u));
      toast.success(`User ${isActive ? 'deactivated' : 'activated'}`);
    } catch {
      toast.error('Failed to update user');
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await usersAPI.updateUser(userId, { role });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u));
      toast.success('User role updated');
    } catch {
      toast.error('Failed to update role');
    }
  };

  const filtered = users.filter(u =>
    !search ||
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/admin" className="hover:text-brand-charcoal">Dashboard</Link>
        <ChevronRight size={14} />
        <span>Customers</span>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl">Customers</h1>
        <span className="text-sm text-gray-400">{filtered.length} users</span>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="input-field pl-10"
        />
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
                {['Customer', 'Email', 'Joined', 'Role', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left p-4 text-xs tracking-wider uppercase text-gray-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => (
                <tr key={u._id} className="hover:bg-brand-cream/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-beige rounded-full flex items-center justify-center text-xs font-medium">
                        {u.firstName[0]}{u.lastName[0]}
                      </div>
                      <span className="font-medium text-sm">{u.firstName} {u.lastName}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-500">{u.email}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4">
                    {u._id !== currentUser?.id ? (
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u._id, e.target.value)}
                        className="text-xs border border-gray-200 px-2 py-1 bg-white"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className="text-xs text-brand-gold font-medium">You (Admin)</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isActive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    {u._id !== currentUser?.id && (
                      <button
                        onClick={() => handleToggleActive(u._id, u.isActive)}
                        className={`text-xs px-3 py-1 border transition-colors ${
                          u.isActive
                            ? 'border-red-200 text-red-500 hover:bg-red-50'
                            : 'border-green-200 text-green-500 hover:bg-green-50'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">No customers found</div>
          )}
        </div>
      )}
    </div>
  );
}
