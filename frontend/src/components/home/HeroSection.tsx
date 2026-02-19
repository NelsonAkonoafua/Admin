'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1800&q=80',
    title: 'New Season,',
    subtitle: 'New You.',
    description: 'Discover our Spring collection — effortless elegance for the modern woman.',
    cta: 'Shop New Arrivals',
    href: '/products?newArrival=true',
    accent: 'New In'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1800&q=80',
    title: 'Timeless',
    subtitle: 'Elegance.',
    description: 'Curated pieces designed to transcend seasons and trends.',
    cta: 'Explore Collection',
    href: '/products',
    accent: 'Signature'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=1800&q=80',
    title: 'Dressed for',
    subtitle: 'Every Moment.',
    description: 'From sunrise to soirée — fashion that moves with your life.',
    cta: 'Shop Now',
    href: '/products',
    accent: 'Collection'
  }
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % slides.length);
        setIsTransitioning(false);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const slide = slides[current];

  return (
    <section className="relative h-[85vh] min-h-[600px] max-h-[900px] overflow-hidden bg-brand-beige">
      {/* Background image */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <Image
          src={slide.image}
          alt={slide.title}
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className={`max-w-xl transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <span className="inline-block text-brand-gold text-xs tracking-widest uppercase mb-6 font-medium">
              {slide.accent}
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-normal text-white leading-tight mb-6">
              {slide.title}<br />
              <em>{slide.subtitle}</em>
            </h1>
            <p className="text-white/80 text-base md:text-lg mb-8 leading-relaxed">
              {slide.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={slide.href}
                className="inline-flex items-center gap-3 bg-white text-brand-charcoal px-8 py-4 text-sm tracking-widest uppercase font-medium hover:bg-brand-beige transition-colors group"
              >
                {slide.cta}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-3 border border-white text-white px-8 py-4 text-sm tracking-widest uppercase font-medium hover:bg-white/10 transition-colors"
              >
                View All
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current ? 'w-8 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-8 text-white/60 text-xs tracking-widest uppercase writing-vertical hidden md:block">
        <span className="block text-center mb-2">Scroll</span>
        <div className="w-px h-12 bg-white/30 mx-auto" />
      </div>
    </section>
  );
}
