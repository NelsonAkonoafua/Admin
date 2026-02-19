import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Emma S.',
    location: 'New York, NY',
    rating: 5,
    comment: "The quality of forAbby's pieces is absolutely stunning. The silk slip dress I ordered was even more beautiful in person. I've received so many compliments!",
    product: 'Silk Slip Dress'
  },
  {
    id: 2,
    name: 'Isabella M.',
    location: 'Los Angeles, CA',
    rating: 5,
    comment: "Finally found a fashion brand that balances luxury and everyday wearability. The cashmere crewneck is the softest thing I've ever owned.",
    product: 'Cashmere Crewneck'
  },
  {
    id: 3,
    name: 'Charlotte W.',
    location: 'London, UK',
    rating: 5,
    comment: "forAbby has completely transformed my wardrobe. The pieces are timeless, the quality is exceptional, and the customer service is outstanding.",
    product: 'Trench Coat'
  }
];

export function Testimonials() {
  return (
    <section className="bg-brand-beige py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="section-subheading mb-4">What our customers say</p>
          <h2 className="section-heading mb-4">Loved by Women</h2>
          <div className="elegant-divider" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map(t => (
            <div key={t.id} className="bg-white p-8">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={14} className="fill-brand-gold text-brand-gold" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="font-display italic text-lg leading-relaxed text-brand-charcoal mb-6">
                "{t.comment}"
              </blockquote>

              {/* Attribution */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.location}</p>
                </div>
                <span className="text-xs text-brand-gold tracking-wider uppercase">{t.product}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
