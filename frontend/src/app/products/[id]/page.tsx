'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Star, Heart, ShoppingBag, Truck, RefreshCw, ChevronRight, Minus, Plus } from 'lucide-react';
import { productsAPI, reviewsAPI } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { ProductCard } from '@/components/product/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'care'>('description');

  // Review form
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [productRes, relatedRes, reviewsRes] = await Promise.allSettled([
          productsAPI.getOne(id),
          productsAPI.getRelated(id),
          reviewsAPI.getProductReviews(id)
        ]);

        if (productRes.status === 'fulfilled') {
          setProduct(productRes.value.data.product);
        }
        if (relatedRes.status === 'fulfilled') {
          setRelatedProducts(relatedRes.value.data.products);
        }
        if (reviewsRes.status === 'fulfilled') {
          setReviews(reviewsRes.value.data.reviews);
        }
      } catch { } finally {
        setIsLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-[3/4] bg-gray-100" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-100 w-3/4" />
            <div className="h-6 bg-gray-100 w-1/4" />
            <div className="h-4 bg-gray-100 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display text-3xl text-gray-300">Product not found</h2>
        <Link href="/products" className="btn-primary mt-6 inline-block">Back to Products</Link>
      </div>
    );
  }

  // Get unique sizes and colors from variants
  const availableSizes = [...new Set(product.variants.map((v: any) => v.size))];
  const availableColors = product.variants.reduce((acc: any[], v: any) => {
    if (!acc.find(c => c.color === v.color)) {
      acc.push({ color: v.color, colorCode: v.colorCode });
    }
    return acc;
  }, []);

  // Find selected variant
  const selectedVariant = product.variants.find(
    (v: any) => v.size === selectedSize && v.color === selectedColor
  );

  const maxQuantity = selectedVariant?.stock || 0;

  const handleAddToCart = async () => {
    if (!selectedSize) { toast.error('Please select a size'); return; }
    if (!selectedColor) { toast.error('Please select a color'); return; }
    if (!selectedVariant) { toast.error('This combination is unavailable'); return; }
    if (!isAuthenticated) {
      toast.error('Please sign in to add to cart');
      return;
    }

    setIsAddingToCart(true);
    try {
      await addItem({
        productId: product._id,
        variantId: selectedVariant._id,
        quantity,
        size: selectedSize,
        color: selectedColor
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please sign in to leave a review'); return; }
    setIsSubmittingReview(true);
    try {
      const res = await reviewsAPI.create({ productId: product._id, ...reviewForm });
      setReviews(prev => [res.data.review, ...prev]);
      setReviewForm({ rating: 5, title: '', comment: '' });
      toast.success('Review submitted!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
        <Link href="/" className="hover:text-brand-charcoal transition-colors">Home</Link>
        <ChevronRight size={12} />
        <Link href="/products" className="hover:text-brand-charcoal transition-colors">Products</Link>
        {product.category && (
          <>
            <ChevronRight size={12} />
            <Link href={`/products?category=${product.category._id}`} className="hover:text-brand-charcoal transition-colors">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight size={12} />
        <span className="text-brand-charcoal truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Product layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Images */}
        <div>
          {/* Main image */}
          <div className="aspect-[3/4] bg-brand-beige overflow-hidden mb-3 relative">
            {product.images?.length > 0 ? (
              <Image
                src={product.images[selectedImage]?.url}
                alt={product.images[selectedImage]?.alt || product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-200">
                <ShoppingBag size={60} />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {discount > 0 && <span className="badge-sale text-sm">-{discount}%</span>}
              {product.isNewArrival && <span className="badge-new text-xs">New Arrival</span>}
            </div>
          </div>

          {/* Thumbnail gallery */}
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto product-gallery-scroll">
              {product.images.map((img: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-20 h-28 overflow-hidden border-2 transition-all ${
                    selectedImage === i ? 'border-brand-charcoal' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt || `View ${i + 1}`}
                    width={80}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product details */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          {product.category && (
            <Link href={`/products?category=${product.category._id}`} className="text-xs tracking-widest uppercase text-gray-400 hover:text-brand-gold transition-colors">
              {product.category.name}
            </Link>
          )}

          <h1 className="font-display text-3xl md:text-4xl text-brand-charcoal mt-2 mb-4">{product.name}</h1>

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} size={14} className={star <= Math.round(product.averageRating) ? 'fill-brand-gold text-brand-gold' : 'text-gray-200'} />
                ))}
              </div>
              <span className="text-sm text-gray-500">{product.averageRating} ({product.numReviews} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl font-medium">${product.price.toFixed(2)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-gray-400 line-through">${product.compareAtPrice.toFixed(2)}</span>
            )}
            {discount > 0 && (
              <span className="text-red-500 text-sm">Save {discount}%</span>
            )}
          </div>

          {/* Short description */}
          {product.shortDescription && (
            <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.shortDescription}</p>
          )}

          {/* Color selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="label-field">Color</label>
              {selectedColor && <span className="text-xs text-gray-500">{selectedColor}</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              {availableColors.map(({ color, colorCode }: any) => {
                const hasStock = product.variants.some(
                  (v: any) => v.color === color && v.stock > 0 && (!selectedSize || v.size === selectedSize)
                );
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(selectedColor === color ? '' : color)}
                    disabled={!hasStock}
                    title={color}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color ? 'border-brand-charcoal scale-110' : 'border-gray-200'
                    } ${!hasStock ? 'opacity-30 cursor-not-allowed' : 'hover:border-brand-charcoal'}`}
                    style={{ backgroundColor: colorCode }}
                    aria-label={color}
                  />
                );
              })}
            </div>
          </div>

          {/* Size selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="label-field">Size</label>
              <button className="text-xs text-gray-400 hover:text-brand-charcoal underline transition-colors">Size Guide</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size: any) => {
                const hasStock = product.variants.some(
                  (v: any) => v.size === size && v.stock > 0 && (!selectedColor || v.color === selectedColor)
                );
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                    disabled={!hasStock}
                    className={`min-w-[48px] px-3 py-2 text-sm border transition-all ${
                      selectedSize === size
                        ? 'bg-brand-charcoal text-white border-brand-charcoal'
                        : hasStock
                          ? 'border-gray-200 hover:border-brand-charcoal text-brand-charcoal'
                          : 'border-gray-100 text-gray-300 cursor-not-allowed line-through'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stock warning */}
          {selectedVariant && selectedVariant.stock <= 5 && selectedVariant.stock > 0 && (
            <p className="text-amber-600 text-xs mb-4">Only {selectedVariant.stock} left in stock!</p>
          )}

          {/* Quantity + Add to cart */}
          <div className="flex gap-4 mb-6">
            {/* Quantity */}
            <div className="flex items-center border border-gray-200">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="p-3 hover:bg-brand-beige transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="px-4 py-3 text-sm min-w-[50px] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(maxQuantity || 10, q + 1))}
                className="p-3 hover:bg-brand-beige transition-colors"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || (!!selectedSize && !!selectedColor && !selectedVariant)}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShoppingBag size={16} />
              {isAddingToCart ? 'Adding...' : 'Add to Bag'}
            </button>
          </div>

          {/* Wishlist */}
          <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-charcoal transition-colors mb-8">
            <Heart size={16} />
            Save to Wishlist
          </button>

          {/* Shipping info */}
          <div className="border-t border-gray-100 pt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Truck size={16} className="text-brand-gold flex-shrink-0" />
              <span>Free shipping on orders over $100</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <RefreshCw size={16} className="text-brand-gold flex-shrink-0" />
              <span>Free returns within 30 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Reviews, Care */}
      <div className="mt-20">
        <div className="flex border-b border-gray-200 mb-8">
          {(['description', 'reviews', 'care'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm tracking-wider uppercase transition-all border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-brand-charcoal text-brand-charcoal font-medium'
                  : 'border-transparent text-gray-400 hover:text-brand-charcoal'
              }`}
            >
              {tab === 'reviews' ? `Reviews (${reviews.length})` : tab}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div className="max-w-2xl">
            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
            {product.material && (
              <div className="space-y-2">
                <p className="text-sm"><span className="font-medium">Material:</span> <span className="text-gray-600">{product.material}</span></p>
                {product.brand && <p className="text-sm"><span className="font-medium">Brand:</span> <span className="text-gray-600">{product.brand}</span></p>}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="max-w-3xl">
            {/* Review summary */}
            {product.numReviews > 0 && (
              <div className="flex items-center gap-8 mb-10 p-6 bg-brand-beige">
                <div className="text-center">
                  <p className="font-display text-5xl">{product.averageRating}</p>
                  <div className="flex mt-2 justify-center">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={14} className={s <= Math.round(product.averageRating) ? 'fill-brand-gold text-brand-gold' : 'text-gray-200'} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{product.numReviews} reviews</p>
                </div>
              </div>
            )}

            {/* Review list */}
            <div className="space-y-8 mb-12">
              {reviews.map((review: any) => (
                <div key={review._id} className="border-b border-gray-100 pb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-brand-beige flex items-center justify-center font-display text-lg">
                      {review.user?.firstName?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{review.user?.firstName} {review.user?.lastName?.[0]}.</p>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} size={11} className={s <= review.rating ? 'fill-brand-gold text-brand-gold' : 'text-gray-200'} />
                          ))}
                        </div>
                        {review.isVerifiedPurchase && (
                          <span className="text-xs text-green-600">Verified Purchase</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-medium text-sm mb-2">{review.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>

            {/* Write review form */}
            {isAuthenticated && (
              <div className="bg-brand-cream p-6">
                <h3 className="font-display text-xl mb-6">Write a Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="label-field">Rating</label>
                    <div className="flex gap-2 mt-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setReviewForm(prev => ({ ...prev, rating: s }))}
                        >
                          <Star size={24} className={s <= reviewForm.rating ? 'fill-brand-gold text-brand-gold' : 'text-gray-200 hover:text-brand-gold transition-colors'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="label-field">Title</label>
                    <input
                      type="text"
                      value={reviewForm.title}
                      onChange={e => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                      className="input-field"
                      placeholder="Summarize your experience"
                      required
                    />
                  </div>
                  <div>
                    <label className="label-field">Review</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                      className="input-field min-h-[100px] resize-none"
                      placeholder="Share your thoughts about this product..."
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary" disabled={isSubmittingReview}>
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {activeTab === 'care' && (
          <div className="max-w-2xl">
            {product.careInstructions ? (
              <p className="text-gray-600 leading-relaxed">{product.careInstructions}</p>
            ) : (
              <ul className="space-y-3 text-sm text-gray-600">
                {['Machine wash cold with like colors', 'Do not bleach', 'Tumble dry low', 'Cool iron if needed', 'Do not dry clean'].map(instruction => (
                  <li key={instruction} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold flex-shrink-0" />
                    {instruction}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 border-t border-gray-100 pt-16">
          <h2 className="font-display text-3xl mb-10">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
