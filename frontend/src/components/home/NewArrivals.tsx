'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { productsAPI } from '@/lib/api';
import { ProductCard } from '@/components/product/ProductCard';

export function NewArrivals() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    productsAPI.getAll({ newArrival: true, limit: 4 })
      .then(res => setProducts(res.data.products))
      .catch(() => {});
  }, []);

  if (!products.length) return null;

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="section-subheading mb-3">Fresh drops</p>
          <h2 className="section-heading">New Arrivals</h2>
        </div>
        <Link href="/products?newArrival=true" className="hidden md:flex items-center gap-2 text-sm tracking-wider uppercase hover:text-brand-gold transition-colors group">
          View All
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      <div className="text-center mt-8 md:hidden">
        <Link href="/products?newArrival=true" className="btn-secondary inline-flex items-center gap-2">
          View All New Arrivals <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
