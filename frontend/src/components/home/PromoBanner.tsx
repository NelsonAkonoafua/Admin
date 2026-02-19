import Link from 'next/link';
import Image from 'next/image';

export function PromoBanner() {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left banner */}
        <Link href="/products?category=Dresses" className="relative overflow-hidden h-96 md:h-[500px] group block">
          <Image
            src="https://images.unsplash.com/photo-1550614000-4895a10e1bfd?w=900&q=80"
            alt="Summer Dresses"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <span className="text-xs tracking-widest uppercase text-brand-gold mb-2 block">Summer Edit</span>
            <h3 className="font-display text-3xl md:text-4xl mb-4">Effortless<br /><em>Summer Dresses</em></h3>
            <span className="inline-flex items-center text-sm tracking-wider uppercase border-b border-white pb-1 group-hover:border-brand-gold group-hover:text-brand-gold transition-colors">
              Shop Dresses
            </span>
          </div>
        </Link>

        {/* Right banners stacked */}
        <div className="flex flex-col gap-6">
          <Link href="/products?newArrival=true" className="relative overflow-hidden h-48 md:h-60 group block">
            <Image
              src="https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=900&q=80"
              alt="New Arrivals"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
            <div className="absolute inset-0 flex items-center p-8 text-white">
              <div>
                <span className="text-xs tracking-widest uppercase text-brand-gold mb-2 block">Just Arrived</span>
                <h3 className="font-display text-2xl md:text-3xl">New In This Week</h3>
              </div>
            </div>
          </Link>

          <div className="flex gap-6 flex-1">
            <Link href="/products?bestSeller=true" className="relative overflow-hidden flex-1 h-48 md:h-auto group block">
              <Image
                src="https://images.unsplash.com/photo-1551803091-e20673f15770?w=600&q=80"
                alt="Best Sellers"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="25vw"
              />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute inset-0 flex items-end p-4 text-white">
                <div>
                  <h3 className="font-display text-lg">Best<br /><em>Sellers</em></h3>
                </div>
              </div>
            </Link>

            <div className="flex-1 flex flex-col gap-6">
              <div className="bg-brand-charcoal text-white p-6 flex flex-col justify-center h-full">
                <span className="text-xs tracking-widest uppercase text-brand-gold mb-3 block">Limited Offer</span>
                <h3 className="font-display text-xl mb-3">Use code</h3>
                <span className="font-mono text-2xl tracking-widest font-bold text-brand-gold">WELCOME20</span>
                <p className="text-white/60 text-xs mt-2">20% off your first order</p>
                <Link href="/products" className="mt-4 text-xs tracking-widest uppercase border-b border-white/30 inline-block pb-1 hover:border-brand-gold hover:text-brand-gold transition-colors">
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
