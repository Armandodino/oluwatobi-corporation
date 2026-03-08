'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Star, Minus, Plus, Heart, Share2, Truck, Shield, RotateCcw, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/currency';
import type { Product } from '@/types';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

export default function ProductDetail({ product, onClose }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = async () => {
    if (product.stock <= 0) return;
    
    setIsAdding(true);
    try {
      await addItem(product.id, quantity);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  const price = product.salePrice || product.price;
  const discount = product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
          <Button variant="ghost" onClick={onClose} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Retour
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 p-6">
          {/* Image */}
          <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {/* Category */}
            {product.category && (
              <Link
                href={`/?category=${product.category.id}`}
                onClick={onClose}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                {product.category.name}
              </Link>
            )}

            {/* Name */}
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">{product.name}</h1>

            {/* Brand and SKU */}
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
              {product.brand && <span>Marque: <strong>{product.brand}</strong></span>}
              <span>Réf: {product.sku}</span>
            </div>

            {/* Rating */}
            {product.avgRating !== undefined && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(product.avgRating || 0) ? 'text-orange-400 fill-orange-400' : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-600">
                  {product.avgRating} ({product.reviewCount} avis)
                </span>
              </div>
            )}

            {/* Badges */}
            <div className="flex gap-2 mt-4">
              {product.featured && (
                <Badge className="bg-orange-500 text-white">Vedette</Badge>
              )}
              {discount > 0 && (
                <Badge variant="destructive">-{discount}%</Badge>
              )}
              {product.stock <= 0 ? (
                <Badge variant="secondary">Rupture de stock</Badge>
              ) : product.stock <= 10 ? (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  Stock limité ({product.stock})
                </Badge>
              ) : (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  En stock
                </Badge>
              )}
            </div>

            {/* Price */}
            <div className="mt-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-slate-900">{formatPrice(price)}</span>
                {product.salePrice && (
                  <span className="text-xl text-slate-400 line-through">{formatPrice(product.price)}</span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1">TVA incluse</p>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-12"
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || isAdding}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {isAdding ? 'Ajout en cours...' : 'Ajouter au panier'}
              </Button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-slate-50 rounded-lg">
              <div className="text-center">
                <Truck className="h-6 w-6 mx-auto text-orange-500" />
                <p className="text-xs mt-1 font-medium">Livraison rapide</p>
                <p className="text-xs text-slate-500">À Abidjan et environs</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto text-orange-500" />
                <p className="text-xs mt-1 font-medium">Qualité premium</p>
                <p className="text-xs text-slate-500">Produits certifiés</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-6 w-6 mx-auto text-orange-500" />
                <p className="text-xs mt-1 font-medium">Retour facile</p>
                <p className="text-xs text-slate-500">30 jours</p>
              </div>
            </div>

            {/* Product info */}
            {(product.weight || product.dimensions) && (
              <div className="mt-4 text-sm text-slate-600">
                {product.weight && <p>Poids: {product.weight} kg</p>}
                {product.dimensions && <p>Dimensions: {product.dimensions}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t p-6">
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specs">Caractéristiques</TabsTrigger>
              <TabsTrigger value="reviews">Avis ({product.reviews?.length || 0})</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              <p className="text-slate-600">
                {product.description || 'Aucune description disponible pour ce produit.'}
              </p>
            </TabsContent>
            <TabsContent value="specs" className="mt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-500">Marque</span>
                  <span className="font-medium">{product.brand || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-500">Référence</span>
                  <span className="font-medium">{product.sku}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-500">Poids</span>
                  <span className="font-medium">{product.weight ? `${product.weight} kg` : '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-500">Dimensions</span>
                  <span className="font-medium">{product.dimensions || '-'}</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-4">
              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-4">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'text-orange-400 fill-orange-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium">{review.user?.name || 'Anonyme'}</span>
                      </div>
                      {review.title && <h4 className="font-medium mb-1">{review.title}</h4>}
                      {review.comment && <p className="text-slate-600 text-sm">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">Aucun avis pour ce produit.</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
