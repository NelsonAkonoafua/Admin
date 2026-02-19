'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { categoriesAPI } from '@/lib/api';

const categoryImages: Record<string, string> = {
  'Dresses': 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80',
  'Tops': 'https://images.unsplash.com/photo-1562572159-4efd90232463?w=600&q=80',
  'Bottoms': 'https://images.unsplash.com/photo-1583744946564-b52d01a7a37f?w=600&q=80',
  'Outerwear': 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80',
  'Accessories': 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&q=80',
  'Loungewear': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80',
};

export function CategoriesSection() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    categoriesAPI.getAll()
      .then(res => setCategories(res.data.categories))
      .catch(() => {});
  }, []);

  return (
    <section className="bg-brand-cream py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="section-subheading mb-4">Shop by category</p>
          <h2 className="section-heading mb-4">Explore Styles</h2>
          <div className="elegant-divider" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, index) => (
            <Link
              key={cat._id}
              href={`/products?category=${cat._id}`}
              className="group relative overflow-hidden aspect-[3/4]"
            >
              <Image
                src={cat.image || categoryImages[cat.name] || 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600'}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-display text-lg font-normal">{cat.name}</h3>
                <p className="text-xs text-white/60 mt-0.5 group-hover:text-brand-gold transition-colors">
                  Shop Now →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
