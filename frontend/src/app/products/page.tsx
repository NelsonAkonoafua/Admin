'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { ProductCard } from '@/components/product/ProductCard';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = ['Black', 'White', 'Beige', 'Blush', 'Navy', 'Camel', 'Gold', 'Ivory', 'Sage'];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Top Rated', value: 'rating' },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    size: searchParams.get('size') || '',
    color: searchParams.get('color') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
    search: searchParams.get('search') || '',
    newArrival: searchParams.get('newArrival') || '',
    featured: searchParams.get('featured') || '',
    bestSeller: searchParams.get('bestSeller') || '',
  });

  useEffect(() => {
    categoriesAPI.getAll().then(res => setCategories(res.data.categories)).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async (currentPage = 1) => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = { ...filters, page: currentPage, limit: 12 };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);

      const res = await productsAPI.getAll(params);
      setProducts(res.data.products);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    setPage(1);
    fetchProducts(1);
  }, [filters]);

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: prev[key] === value ? '' : value }));
  };

  const clearFilters = () => {
    setFilters({ category: '', size: '', color: '', minPrice: '', maxPrice: '', sort: 'newest', search: '', newArrival: '', featured: '', bestSeller: '' });
  };

  const activeFilterCount = [filters.category, filters.size, filters.color, filters.minPrice, filters.search].filter(Boolean).length;

  const pageTitle = filters.search
    ? `Search: "${filters.search}"`
    : filters.newArrival === 'true' ? 'New Arrivals'
    : filters.featured === 'true' ? 'Featured'
    : filters.bestSeller === 'true' ? 'Best Sellers'
    : categories.find(c => c._id === filters.category)?.name || 'All Products';

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Page header */}
      <div className="mb-10">
        <h1 className="font-display text-4xl md:text-5xl text-brand-charcoal">{pageTitle}</h1>
        <p className="text-sm text-gray-400 mt-2">{total} {total === 1 ? 'product' : 'products'}</p>
      </div>

      <div className="flex gap-8">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-28">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm tracking-widest uppercase font-medium">Filters</h2>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-brand-charcoal transition-colors">
                  Clear all ({activeFilterCount})
                </button>
              )}
            </div>

            {/* Category filter */}
            <FilterSection title="Category">
              <button
                onClick={() => updateFilter('category', '')}
                className={`block text-sm mb-2 transition-colors ${!filters.category ? 'font-medium text-brand-charcoal' : 'text-gray-500 hover:text-brand-charcoal'}`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat._id}
                  onClick={() => updateFilter('category', cat._id)}
                  className={`block text-sm mb-2 transition-colors ${filters.category === cat._id ? 'font-medium text-brand-charcoal' : 'text-gray-500 hover:text-brand-charcoal'}`}
                >
                  {cat.name}
                </button>
              ))}
            </FilterSection>

            {/* Size filter */}
            <FilterSection title="Size">
              <div className="grid grid-cols-3 gap-2">
                {SIZES.map(size => (
                  <button
                    key={size}
                    onClick={() => updateFilter('size', size)}
                    className={`py-2 text-xs border transition-all ${
                      filters.size === size
                        ? 'bg-brand-charcoal text-white border-brand-charcoal'
                        : 'border-gray-200 text-gray-600 hover:border-brand-charcoal'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Color filter */}
            <FilterSection title="Color">
              <div className="space-y-2">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => updateFilter('color', color)}
                    className={`flex items-center gap-2 text-sm transition-colors ${
                      filters.color === color ? 'font-medium text-brand-charcoal' : 'text-gray-500 hover:text-brand-charcoal'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full border border-gray-200 inline-block"
                      style={{ backgroundColor: color.toLowerCase() }}
                    />
                    {color}
                    {filters.color === color && <X size={12} />}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Price filter */}
            <FilterSection title="Price Range">
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={e => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                  className="w-full input-field text-xs py-2"
                />
                <span className="text-gray-400">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={e => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                  className="w-full input-field text-xs py-2"
                />
              </div>
            </FilterSection>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            {/* Mobile filter button */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 text-sm border border-gray-200 px-4 py-2"
            >
              <SlidersHorizontal size={14} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-brand-charcoal text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-500 hidden md:block">Sort by:</span>
              <div className="relative">
                <select
                  value={filters.sort}
                  onChange={e => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                  className="input-field py-2 pr-8 text-sm appearance-none cursor-pointer"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
              </div>
            </div>
          </div>

          {/* Products */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-gray-100 mb-4" />
                  <div className="h-4 bg-gray-100 mb-2 w-3/4" />
                  <div className="h-4 bg-gray-100 w-1/4" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-2xl text-gray-300 mb-4">No products found</p>
              <p className="text-sm text-gray-400 mb-6">Try adjusting your filters</p>
              <button onClick={clearFilters} className="btn-secondary">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setPage(i + 1); fetchProducts(i + 1); }}
                      className={`w-10 h-10 text-sm transition-all ${
                        page === i + 1
                          ? 'bg-brand-charcoal text-white'
                          : 'border border-gray-200 hover:border-brand-charcoal'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="mb-8 border-b border-gray-100 pb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full mb-4 text-xs tracking-widest uppercase font-medium"
      >
        {title}
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div>{children}</div>}
    </div>
  );
}
