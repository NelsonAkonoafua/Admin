'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { usersAPI } from '@/lib/api';
import { ProductCard } from '@/components/product/ProductCard';

export default function WishlistPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login?redirect=/account/wishlist'); return; }
    usersAPI.getProfile()
      .then(res => setWishlist(res.data.user.wishlist || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-10">
        <Link href="/account" className="text-sm text-gray-400 hover:text-brand-charcoal">Account</Link>
        <ChevronRight size={14} className="text-gray-300" />
        <span className="text-sm">Wishlist</span>
      </div>

      <h1 className="font-display text-4xl mb-10">My Wishlist</h1>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={60} className="text-gray-200 mx-auto mb-4" />
          <p className="font-display text-2xl text-gray-300 mb-2">Your wishlist is empty</p>
          <p className="text-gray-400 text-sm mb-8">Save your favourite pieces to your wishlist.</p>
          <Link href="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
