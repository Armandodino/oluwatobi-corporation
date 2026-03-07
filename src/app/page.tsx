'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Truck, Shield, CreditCard, HeadphonesIcon, Sparkles, TrendingUp } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductGrid from '@/components/product/ProductGrid';
import ProductDetail from '@/components/product/ProductDetail';
import CheckoutModal from '@/components/cart/CheckoutModal';
import AuthModal from '@/components/auth/AuthModal';
import AdminPanel from '@/components/admin/AdminPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/lib/currency';
import type { Product, Category, PaginatedResponse } from '@/types';

function HomeContent() {
  const searchParams = useSearchParams();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [priceRange, setPriceRange] = useState([0, 150000]);
  const [showFeatured, setShowFeatured] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin on mount
  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setIsAdmin(data.user?.role === 'admin');
      }
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/me', { method: 'DELETE' });
      setIsAdmin(false);
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check URL params on mount
  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const product = searchParams.get('product');
    const checkout = searchParams.get('checkout');
    const auth = searchParams.get('auth');

    if (category) {
      setSelectedCategory(category === 'all' ? null : category);
      // Scroll to products when category is in URL
      setTimeout(() => {
        const element = document.getElementById('products-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => {
            window.scrollBy({ top: -180, behavior: 'smooth' });
          }, 300);
        }
      }, 300);
    }
    if (search) setSearchQuery(search);
    if (product) fetchProduct(product);
    if (checkout === 'true') setShowCheckout(true);
    if (auth) setShowAuth(true);
  }, [searchParams]);

  // Fetch data
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCategory, searchQuery, sortBy, sortOrder, showFeatured]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      params.append('sort', sortBy);
      params.append('order', sortOrder);
      params.append('page', '1');
      params.append('limit', '20');
      if (showFeatured) params.append('featured', 'true');

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json() as PaginatedResponse<Product> & { error?: string };
      if (res.ok && data.products) {
        setProducts(data.products);
        setPagination(data.pagination || { page: 1, limit: 12, total: 0, totalPages: 0 });
      } else {
        console.error('API Error:', data.error);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json() as Category[] & { error?: string };
      if (res.ok && Array.isArray(data)) {
        setCategories(data);
      } else {
        console.error('API Error:', data.error);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchProduct = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      const data = await res.json();
      setSelectedProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery(null);
    setSortBy('createdAt');
    setSortOrder('desc');
    setShowFeatured(false);
    setPriceRange([0, 150000]);
  };

  // Scroll to products section
  const scrollToProducts = () => {
    setTimeout(() => {
      const element = document.getElementById('products-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Adjust for sticky header
        setTimeout(() => {
          const headerHeight = 180; // Approximate header + categories bar height
          window.scrollBy({ top: -headerHeight, behavior: 'smooth' });
        }, 300);
      }
    }, 150);
  };

  // Handle category selection with scroll
  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setShowFeatured(false);
    scrollToProducts();
  };

  // Handle "Voir les produits" button
  const handleViewProducts = () => {
    clearFilters();
    scrollToProducts();
  };

  // Handle "Promotions" button
  const handlePromotions = () => {
    setSelectedCategory(null);
    setShowFeatured(true);
    scrollToProducts();
  };

  // Handle category card click
  const handleCategoryCardClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowFeatured(false);
    scrollToProducts();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header 
        onOpenAdmin={() => setShowAdmin(true)} 
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src="/logo.jpeg" 
                    alt="OLUWATOBI CORPORATION" 
                    className="h-16 w-16 rounded-xl object-cover shadow-lg"
                  />
                  <Badge className="bg-amber-500 text-white">Côte d&apos;Ivoire</Badge>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  <span className="text-white">OLUWATOBI CORPORATION</span>
                  <br />
                  <span className="text-2xl md:text-3xl font-normal text-slate-300">Votre quincaillerie de confiance</span>
                </h1>
                <p className="text-lg text-slate-300 mb-8">
                  Découvrez notre large sélection d&apos;outils, matériaux et accessoires pour tous vos projets de bricolage. Livraison à Abidjan et dans tout le pays.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleViewProducts}>
                    Voir les produits
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handlePromotions}>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Promotions
                  </Button>
                </div>
              </div>
              <div className="hidden md:flex justify-center">
                <div className="relative">
                  <div className="w-64 h-64 bg-amber-500 rounded-full opacity-20 absolute -top-4 -right-4" />
                  <div className="w-72 h-72 bg-slate-700 rounded-2xl flex items-center justify-center relative overflow-hidden">
                    <img 
                      src="/logo.jpeg" 
                      alt="OLUWATOBI CORPORATION" 
                      className="w-48 h-48 object-cover rounded-xl shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              <div className="flex items-center gap-3">
                <Truck className="h-8 w-8 text-amber-500 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Livraison Abidjan</p>
                  <p className="text-xs text-slate-500">Rapide et fiable</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-amber-500 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Qualité premium</p>
                  <p className="text-xs text-slate-500">Produits certifiés</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-amber-500 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Paiement sécurisé</p>
                  <p className="text-xs text-slate-500">Mobile Money, Carte, Cash</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <HeadphonesIcon className="h-8 w-8 text-amber-500 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Service client</p>
                  <p className="text-xs text-slate-500">+225 07 15 54 14</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Bar - Quick Access */}
        <section className="py-4 bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600 shrink-0">Catégories:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategorySelect(null)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    !selectedCategory 
                      ? 'bg-amber-500 text-white shadow-md' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Tous
                </button>
                {categories.slice(0, 6).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category.id 
                        ? 'bg-amber-500 text-white shadow-md' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section id="products-section" className="py-12 bg-slate-50">
          <div className="container mx-auto px-4">
            {/* Active filter indicator */}
            {showFeatured && (
              <div className="mb-4 flex items-center gap-2">
                <span className="text-slate-600">Filtre actif:</span>
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                  Promotions uniquement
                </span>
                <button 
                  onClick={() => setShowFeatured(false)}
                  className="text-sm text-red-600 hover:text-red-700 underline"
                >
                  Effacer
                </button>
              </div>
            )}
            
            {selectedCategory && (
              <div className="mb-4 flex items-center gap-2">
                <span className="text-slate-600">Catégorie active:</span>
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                  {categories.find((c) => c.id === selectedCategory)?.name}
                </span>
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="text-sm text-amber-600 hover:text-amber-700 underline"
                >
                  Effacer le filtre
                </button>
              </div>
            )}
            
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar - Desktop */}
              <aside className="hidden lg:block w-64 shrink-0">
                <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-lg">Filtres</h3>
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-amber-600">
                      Réinitialiser
                    </Button>
                  </div>

                  {/* Categories */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Catégories</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="cat-all"
                          checked={!selectedCategory}
                          onCheckedChange={() => setSelectedCategory(null)}
                        />
                        <Label htmlFor="cat-all" className="cursor-pointer">Toutes</Label>
                      </div>
                      {categories.map((cat) => (
                        <div key={cat.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`cat-${cat.id}`}
                            checked={selectedCategory === cat.id}
                            onCheckedChange={() => setSelectedCategory(cat.id)}
                          />
                          <Label htmlFor={`cat-${cat.id}`} className="cursor-pointer text-sm">
                            {cat.name} ({cat.productCount})
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Prix (FCFA)</h4>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={150000}
                      step={5000}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>{formatPrice(priceRange[0])}</span>
                      <span>{formatPrice(priceRange[1])}</span>
                    </div>
                  </div>

                  {/* Featured */}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="featured"
                      checked={showFeatured}
                      onCheckedChange={(checked) => setShowFeatured(checked as boolean)}
                    />
                    <Label htmlFor="featured" className="cursor-pointer">Produits vedettes</Label>
                  </div>
                </div>
              </aside>

              {/* Products Grid */}
              <div className="flex-1">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {showFeatured 
                        ? 'Promotions' 
                        : selectedCategory
                          ? categories.find((c) => c.id === selectedCategory)?.name
                          : 'Tous les produits'}
                    </h2>
                    <p className="text-slate-500">
                      {pagination.total} produit{pagination.total > 1 ? 's' : ''} trouvé{pagination.total > 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Mobile filters */}
                    <Button
                      variant="outline"
                      className="lg:hidden"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      Filtres
                    </Button>

                    {/* Sort */}
                    <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                      const [field, order] = value.split('-');
                      setSortBy(field);
                      setSortOrder(order);
                    }}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Trier par" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt-desc">Plus récents</SelectItem>
                        <SelectItem value="createdAt-asc">Plus anciens</SelectItem>
                        <SelectItem value="price-asc">Prix croissant</SelectItem>
                        <SelectItem value="price-desc">Prix décroissant</SelectItem>
                        <SelectItem value="name-asc">Nom A-Z</SelectItem>
                        <SelectItem value="name-desc">Nom Z-A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Mobile Filters Panel */}
                {showFilters && (
                  <div className="lg:hidden bg-white rounded-xl p-4 mb-6 shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Catégories</h4>
                        <Select value={selectedCategory || 'all'} onValueChange={(value) => setSelectedCategory(value === 'all' ? null : value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Toutes</SelectItem>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="featured-mobile"
                          checked={showFeatured}
                          onCheckedChange={(checked) => setShowFeatured(checked as boolean)}
                        />
                        <Label htmlFor="featured-mobile">Vedettes</Label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Products */}
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                        <div className="aspect-square bg-slate-200 rounded-lg mb-4" />
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                        <div className="h-4 bg-slate-200 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <ProductGrid products={products} />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Categories */}
        <section id="categories-section" className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center">Explorez nos catégories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryCardClick(category.id)}
                  className={`rounded-xl p-6 text-center transition-all group border-2 ${
                    selectedCategory === category.id 
                      ? 'bg-amber-50 border-amber-500 shadow-lg' 
                      : 'bg-slate-50 border-transparent hover:border-amber-300 hover:shadow-md'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 transition-colors ${
                    selectedCategory === category.id 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-amber-100 group-hover:bg-amber-200 text-amber-600'
                  }`}>
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-slate-500">{category.productCount} produits</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 bg-amber-500">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Restez informé de nos offres
            </h2>
            <p className="text-amber-100 mb-6">
              Inscrivez-vous à notre newsletter pour recevoir nos promotions exclusives
            </p>
            <div className="flex max-w-md mx-auto gap-2">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-amber-300"
              />
              <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                S&apos;inscrire
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Modals */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {showCheckout && (
        <CheckoutModal onClose={() => setShowCheckout(false)} />
      )}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => {
            setShowAuth(false);
            checkAdmin();
          }}
        />
      )}

      {/* Admin Panel */}
      <AdminPanel 
        isOpen={showAdmin} 
        onClose={() => setShowAdmin(false)} 
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <HomeContent />
    </Suspense>
  );
}
