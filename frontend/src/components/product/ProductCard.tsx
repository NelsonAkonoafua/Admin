'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { usersAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: Array<{ url: string; alt: string; isPrimary: boolean }>;
  averageRating: number;
  numReviews: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  discountPercentage?: number;
  availableColors?: Array<{ color: string; colorCode: string }>;
  category?: { name: string; slug: string };
}

interface ProductCardProps {
  product: Product;
  size?: 'sm' | 'md' | 'lg';
}

export function ProductCard({ product, size = 'md' }: ProductCardProps) {
  const { isAuthenticated } = useAuthStore();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage = product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url;
  const secondaryImage = product.images?.[1]?.url;

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Sign in to save items to your wishlist');
      return;
    }
    try {
      await usersAPI.toggleWishlist(product._id);
      setIsWishlisted(!isWishlisted);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <Link href={`/products/${product._id}`} className="product-card block">
      {/* Image container */}
      <div
        className="product-card-image relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {primaryImage ? (
          <>
            <Image
              src={primaryImage}
              alt={product.images?.[0]?.alt || product.name}
              fill
              className={`object-cover transition-all duration-700 ${
                isHovered && secondaryImage ? 'opacity-0' : 'opacity-100'
              }`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {secondaryImage && (
              <Image
                src={secondaryImage}
                alt={`${product.name} alternate view`}
                fill
                className={`object-cover transition-all duration-700 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ShoppingBag size={40} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {discount > 0 && (
            <span className="badge-sale">-{discount}%</span>
          )}
          {product.isNewArrival && !discount && (
            <span className="badge-new">New</span>
          )}
          {product.isBestSeller && !discount && !product.isNewArrival && (
            <span className="badge-bestseller">Best Seller</span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2 bg-white/90 rounded-full transition-all duration-200 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
          } hover:bg-white`}
          aria-label="Add to wishlist"
        >
          <Heart
            size={16}
            className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-brand-charcoal'}
          />
        </button>

        {/* Quick add - shows on hover */}
        {isHovered && (
          <div className="absolute bottom-0 left-0 right-0 bg-brand-charcoal/90 text-white text-center py-3 text-xs tracking-widest uppercase font-medium transition-all">
            Quick View
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="pt-4 pb-2">
        {product.category && (
          <p className="text-xs text-gray-400 tracking-wider uppercase mb-1">{product.category.name}</p>
        )}
        <h3 className="font-display text-base leading-snug text-brand-charcoal group-hover:text-brand-gold transition-colors line-clamp-2">
          {product.name}
        </h3>

        {/* Rating */}
        {product.numReviews > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  size={10}
                  className={star <= Math.round(product.averageRating) ? 'fill-brand-gold text-brand-gold' : 'text-gray-200'}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">({product.numReviews})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-sm font-medium">${product.price.toFixed(2)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">${product.compareAtPrice.toFixed(2)}</span>
          )}
        </div>

        {/* Color swatches */}
        {product.availableColors && product.availableColors.length > 0 && (
          <div className="flex items-center gap-1 mt-2">
            {product.availableColors.slice(0, 4).map(({ color, colorCode }) => (
              <span
                key={color}
                title={color}
                className="w-3 h-3 rounded-full border border-gray-200"
                style={{ backgroundColor: colorCode }}
              />
            ))}
            {product.availableColors.length > 4 && (
              <span className="text-xs text-gray-400">+{product.availableColors.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
