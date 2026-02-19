'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { productsAPI } from '@/lib/api';
import { ProductCard } from '@/components/product/ProductCard';

export function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    productsAPI.getFeatured()
      .then(res => setProducts(res.data.products))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16 animate-slide-up">
        <p className="section-subheading mb-4">Handpicked for you</p>
        <h2 className="section-heading mb-4">Featured Pieces</h2>
        <div className="elegant-divider" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-gray-100 mb-4" />
              <div className="h-4 bg-gray-100 mb-2 w-3/4" />
              <div className="h-4 bg-gray-100 w-1/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      <div className="text-center mt-12">
        <Link href="/products" className="btn-secondary inline-flex items-center gap-2">
          View All Products
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
