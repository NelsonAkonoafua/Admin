import { Truck, RefreshCw, Shield, Leaf } from 'lucide-react';

const values = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'Complimentary shipping on all orders over $100'
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '30-day hassle-free returns and exchanges'
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: 'Your payment information is always protected'
  },
  {
    icon: Leaf,
    title: 'Sustainable',
    description: 'Ethically made with sustainable materials'
  }
];

export function BrandValues() {
  return (
    <section className="border-t border-b border-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {values.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <Icon size={24} className="text-brand-gold mb-3" strokeWidth={1.5} />
              <h3 className="font-medium text-sm tracking-wide mb-1">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
