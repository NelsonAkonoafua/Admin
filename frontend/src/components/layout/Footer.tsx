import Link from 'next/link';
import { Instagram, Facebook, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-brand-charcoal text-white mt-20">
      {/* Newsletter */}
      <div className="border-b border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="font-display italic text-3xl mb-3">Stay in the Loop</h3>
          <p className="text-white/60 text-sm mb-8 tracking-wide">
            Subscribe for exclusive offers, new arrivals, and style inspiration.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-white/10 border border-white/20 px-5 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand-gold transition-colors"
            />
            <button
              type="submit"
              className="bg-brand-gold text-brand-charcoal px-8 py-3 text-sm tracking-widest uppercase font-medium hover:bg-brand-gold-light transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="font-display italic text-3xl mb-4">forAbby</div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Modern fashion for the contemporary woman. Curated pieces that blend elegance with everyday wearability.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/60 hover:text-brand-gold transition-colors" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-white/60 hover:text-brand-gold transition-colors" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-white/60 hover:text-brand-gold transition-colors" aria-label="Twitter">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs tracking-widest uppercase text-white/40 mb-6 font-medium">Shop</h4>
            <ul className="space-y-3">
              {['New Arrivals', 'Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Accessories', 'Sale'].map(item => (
                <li key={item}>
                  <Link
                    href={item === 'New Arrivals' ? '/products?newArrival=true' : `/products?category=${item.toLowerCase()}`}
                    className="text-white/60 text-sm hover:text-brand-gold transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-xs tracking-widest uppercase text-white/40 mb-6 font-medium">Help</h4>
            <ul className="space-y-3">
              {[
                { label: 'Size Guide', href: '/size-guide' },
                { label: 'Shipping & Returns', href: '/shipping' },
                { label: 'Care Instructions', href: '/care' },
                { label: 'FAQ', href: '/faq' },
                { label: 'Contact Us', href: '/contact' },
              ].map(item => (
                <li key={item.label}>
                  <Link href={item.href} className="text-white/60 text-sm hover:text-brand-gold transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs tracking-widest uppercase text-white/40 mb-6 font-medium">Account</h4>
            <ul className="space-y-3">
              {[
                { label: 'My Account', href: '/account' },
                { label: 'Order History', href: '/account/orders' },
                { label: 'Wishlist', href: '/account/wishlist' },
                { label: 'Sign In', href: '/auth/login' },
                { label: 'Create Account', href: '/auth/register' },
              ].map(item => (
                <li key={item.label}>
                  <Link href={item.href} className="text-white/60 text-sm hover:text-brand-gold transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} forAbby. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
              <Link key={item} href="#" className="text-white/40 text-xs hover:text-white/60 transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
