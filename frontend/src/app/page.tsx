import { Suspense } from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { PromoBanner } from '@/components/home/PromoBanner';
import { NewArrivals } from '@/components/home/NewArrivals';
import { BrandValues } from '@/components/home/BrandValues';
import { Testimonials } from '@/components/home/Testimonials';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BrandValues />
      <Suspense fallback={<div className="h-96 flex items-center justify-center"><span className="text-gray-300">Loading...</span></div>}>
        <FeaturedProducts />
      </Suspense>
      <CategoriesSection />
      <PromoBanner />
      <Suspense fallback={<div className="h-96" />}>
        <NewArrivals />
      </Suspense>
      <Testimonials />
    </>
  );
}
