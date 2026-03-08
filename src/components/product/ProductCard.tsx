'use client';

import Link from 'next/link';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/currency';
import type { Product } from '@/types';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock <= 0) return;
    
    setIsAdding(true);
    try {
      await addItem(product.id, 1);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  const price = product.salePrice || product.price;
  const discount = product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : 0;

  return (
    <div className="group bg-white rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      {/* Image */}
      <Link href={`/?product=${product.id}`} className="relative block">
        <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.featured && (
            <Badge className="bg-orange-500 text-white">Vedette</Badge>
          )}
          {discount > 0 && (
            <Badge variant="destructive">-{discount}%</Badge>
          )}
          {product.stock <= 0 && (
            <Badge variant="secondary">Rupture</Badge>
          )}
        </div>

        {/* Wishlist button */}
        <button
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-50"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Heart className="h-4 w-4 text-slate-400 hover:text-red-500" />
        </button>
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Category */}
        {product.category && (
          <Link
            href={`/?category=${product.category.id}`}
            className="text-xs text-orange-600 hover:text-orange-700 font-medium mb-1"
            onClick={(e) => e.stopPropagation()}
          >
            {product.category.name}
          </Link>
        )}

        {/* Name */}
        <Link href={`/?product=${product.id}`} className="font-semibold text-slate-900 line-clamp-2 hover:text-orange-600 mb-2">
          {product.name}
        </Link>

        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-slate-500 mb-2">{product.brand}</p>
        )}

        {/* Rating */}
        {product.avgRating !== undefined && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.round(product.avgRating || 0) ? 'text-orange-400 fill-orange-400' : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-500">
              ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Price and stock */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-xl font-bold text-slate-900">
              {formatPrice(price)}
            </span>
            {product.salePrice && (
              <span className="text-sm text-slate-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {product.stock > 0 && product.stock <= 10 && (
            <p className="text-xs text-orange-600 mb-2">
              Plus que {product.stock} en stock !
            </p>
          )}

          {/* Add to cart */}
          <Button
            className="w-full bg-slate-900 hover:bg-slate-800 text-white"
            onClick={handleAddToCart}
            disabled={product.stock <= 0 || isAdding}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isAdding ? 'Ajout...' : product.stock <= 0 ? 'Rupture de stock' : 'Ajouter au panier'}
          </Button>
        </div>
      </div>
    </div>
  );
}
