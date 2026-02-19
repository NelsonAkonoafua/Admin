'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, User, Heart, Search, Menu, X, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { categoriesAPI } from '@/lib/api';

export function Navbar() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { cart, fetchCart, toggleCart } = useCartStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated]);

  useEffect(() => {
    categoriesAPI.getAll().then(res => setCategories(res.data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    router.push('/');
  };

  const itemCount = cart?.itemCount || 0;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-white'
      }`}>
        {/* Top announcement bar */}
        <div className="bg-brand-charcoal text-white text-center py-2 text-xs tracking-widest uppercase">
          Free shipping on orders over $100 · Use code WELCOME20 for 20% off
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 -ml-2"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/products" className="text-sm tracking-wider uppercase hover:text-brand-gold transition-colors">
                All
              </Link>
              {categories.slice(0, 5).map(cat => (
                <Link
                  key={cat._id}
                  href={`/products?category=${cat._id}`}
                  className="text-sm tracking-wider uppercase hover:text-brand-gold transition-colors whitespace-nowrap"
                >
                  {cat.name}
                </Link>
              ))}
              <Link href="/products?newArrival=true" className="text-sm tracking-wider uppercase hover:text-brand-gold transition-colors text-brand-gold">
                New In
              </Link>
            </nav>

            {/* Logo */}
            <Link href="/" className="logo-text absolute left-1/2 -translate-x-1/2">
              forAbby
            </Link>

            {/* Right icons */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-brand-beige rounded transition-colors"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              {/* Wishlist */}
              {isAuthenticated && (
                <Link
                  href="/account/wishlist"
                  className="p-2 hover:bg-brand-beige rounded transition-colors hidden md:block"
                  aria-label="Wishlist"
                >
                  <Heart size={18} />
                </Link>
              )}

              {/* Account */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="p-2 hover:bg-brand-beige rounded transition-colors hidden md:flex items-center gap-1"
                    aria-label="Account"
                  >
                    <User size={18} />
                    <ChevronDown size={12} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg border border-gray-100 py-2 z-50 animate-slide-down">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
                      </div>
                      <Link href="/account" className="block px-4 py-2 text-sm hover:bg-brand-beige transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                        My Account
                      </Link>
                      <Link href="/account/orders" className="block px-4 py-2 text-sm hover:bg-brand-beige transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                        Orders
                      </Link>
                      {user?.role === 'admin' && (
                        <Link href="/admin" className="block px-4 py-2 text-sm hover:bg-brand-beige transition-colors text-brand-gold" onClick={() => setIsUserMenuOpen(false)}>
                          Admin Dashboard
                        </Link>
                      )}
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm hover:bg-brand-beige transition-colors text-red-500">
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth/login" className="p-2 hover:bg-brand-beige rounded transition-colors hidden md:block" aria-label="Sign in">
                  <User size={18} />
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-brand-beige rounded transition-colors relative"
                aria-label="Shopping cart"
              >
                <ShoppingBag size={18} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-charcoal text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-medium">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4 px-6 animate-slide-down">
            <div className="space-y-4">
              <Link href="/products" className="block text-sm tracking-wider uppercase py-2" onClick={() => setIsMobileOpen(false)}>
                All Products
              </Link>
              {categories.map(cat => (
                <Link
                  key={cat._id}
                  href={`/products?category=${cat._id}`}
                  className="block text-sm tracking-wider uppercase py-2"
                  onClick={() => setIsMobileOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
              <Link href="/products?newArrival=true" className="block text-sm tracking-wider uppercase py-2 text-brand-gold" onClick={() => setIsMobileOpen(false)}>
                New In
              </Link>
              <div className="border-t border-gray-100 pt-4 space-y-3">
                {isAuthenticated ? (
                  <>
                    <Link href="/account" className="block text-sm py-1" onClick={() => setIsMobileOpen(false)}>My Account</Link>
                    <Link href="/account/orders" className="block text-sm py-1" onClick={() => setIsMobileOpen(false)}>Orders</Link>
                    <Link href="/account/wishlist" className="block text-sm py-1" onClick={() => setIsMobileOpen(false)}>Wishlist</Link>
                    <button onClick={handleLogout} className="block text-sm text-red-500 py-1">Sign Out</button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="block text-sm py-1" onClick={() => setIsMobileOpen(false)}>Sign In</Link>
                    <Link href="/auth/register" className="block text-sm py-1" onClick={() => setIsMobileOpen(false)}>Create Account</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-2xl">
            <form onSubmit={handleSearch} className="relative">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for dresses, tops, accessories..."
                className="w-full text-2xl border-0 border-b-2 border-brand-charcoal bg-transparent py-4 pr-12 focus:outline-none placeholder:text-gray-300"
              />
              <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 p-2">
                <Search size={24} />
              </button>
            </form>
            <p className="text-sm text-gray-400 mt-4">Press Enter to search or Esc to close</p>
          </div>
          <button
            onClick={() => setIsSearchOpen(false)}
            className="absolute top-6 right-6 p-2"
            aria-label="Close search"
          >
            <X size={24} />
          </button>
        </div>
      )}

      {/* Spacer for fixed navbar */}
      <div className="h-16 md:h-20" />
      <div className="h-8" /> {/* Announcement bar height */}
    </>
  );
}
