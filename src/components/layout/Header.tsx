'use client';

import Link from 'next/link';
import { useState, useEffect, useSyncExternalStore } from 'react';
import { ShoppingCart, Menu, Search, User, Phone, MapPin, Clock, Settings, LogOut, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cart';
import CartSheet from '@/components/cart/CartSheet';
import type { Category } from '@/types';

interface HeaderProps {
  onOpenAdmin?: () => void;
  isAdmin?: boolean;
  onLogout?: () => void;
}

// Simple mounted check without setState in effect
const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function Header({ onOpenAdmin, isAdmin, onLogout }: HeaderProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { itemCount, fetchCart, toggleCart } = useCartStore();
  
  // Use useSyncExternalStore for mounted state
  const mounted = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Fetch categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
    loadCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
        {/* Top bar */}
        <div className="bg-slate-900 text-white text-sm py-2">
          <div className="container mx-auto px-4 flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                +225 07 15 54 14
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Abidjan, Cocody
              </span>
              <span className="flex items-center gap-1 text-green-400">
                <Clock className="h-3 w-3" />
                Ouvert 24h/24 - 7j/7
              </span>
            </div>
            <span className="text-amber-400 font-medium">🚚 Livraison à Abidjan et environs</span>
          </div>
        </div>

        {/* Main header */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <img 
                src="/logo.jpeg" 
                alt="OLUWATOBI CORPORATION" 
                className="h-12 w-12 rounded-lg object-cover"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-900 leading-tight">OLUWATOBI</span>
                <span className="text-sm font-semibold text-amber-500 leading-tight">CORPORATION</span>
              </div>
            </Link>

            {/* Search bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-12 border-2 focus:border-amber-500"
                />
                <Button type="submit" size="icon" className="absolute right-0 top-0 h-full bg-amber-500 hover:bg-amber-600">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Admin buttons - Home, Dashboard, Logout */}
              {mounted && isAdmin ? (
                <>
                  {/* Home button */}
                  <Link href="/">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hidden sm:flex text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                      title="Accueil"
                    >
                      <Home className="h-5 w-5" />
                    </Button>
                  </Link>
                  
                  {/* Dashboard button - link to /admin page */}
                  <Link href="/admin">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hidden sm:flex text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                      title="Dashboard Admin"
                    >
                      <Settings className="h-5 w-5" />
                    </Button>
                  </Link>
                  
                  {/* Logout button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden sm:flex text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={onLogout}
                    title="Déconnexion"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <>
                  {/* User button (when not admin) */}
                  <Link href="/?auth=login">
                    <Button variant="ghost" size="icon" className="hidden sm:flex">
                      <User className="h-5 w-5" />
                    </Button>
                  </Link>
                </>
              )}

              {/* Cart button - ONLY show when NOT admin */}
              {mounted && !isAdmin && (
                <Button variant="ghost" size="icon" className="relative" onClick={toggleCart}>
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-amber-500">
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              )}

              {/* Mobile menu */}
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <div className="flex flex-col gap-4 mt-8">
                    <form onSubmit={handleSearch} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Button type="submit" size="icon">
                        <Search className="h-4 w-4" />
                      </Button>
                    </form>
                    
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">Catégories</h3>
                      <div className="flex flex-col gap-1">
                        {categories.map((category) => (
                          <Link
                            key={category.id}
                            href={`/?category=${category.id}`}
                            onClick={() => setIsMenuOpen(false)}
                            className="py-2 px-3 rounded-md hover:bg-slate-100 flex justify-between"
                          >
                            <span>{category.name}</span>
                            <Badge variant="secondary">{category.productCount}</Badge>
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      {isAdmin ? (
                        <>
                          {/* Mobile: Home button */}
                          <Link href="/" onClick={() => setIsMenuOpen(false)}>
                            <Button className="w-full" variant="outline">
                              <Home className="h-4 w-4 mr-2" />
                              Accueil
                            </Button>
                          </Link>
                          {/* Mobile: Dashboard button - link to /admin */}
                          <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
                            <Button className="w-full bg-amber-500 hover:bg-amber-600">
                              <Settings className="h-4 w-4 mr-2" />
                              Dashboard Admin
                            </Button>
                          </Link>
                          {/* Mobile: Logout button */}
                          <Button
                            variant="outline"
                            className="w-full text-red-500"
                            onClick={onLogout}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Déconnexion
                          </Button>
                        </>
                      ) : (
                        <>
                          <Link href="/?auth=login" onClick={() => setIsMenuOpen(false)}>
                            <Button className="w-full" variant="outline">
                              <User className="h-4 w-4 mr-2" />
                              Mon compte
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Categories nav - Desktop */}
        <nav className="hidden md:block border-t bg-slate-50">
          <div className="container mx-auto px-4">
            <ul className="flex items-center gap-1 overflow-x-auto py-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/?category=${category.id}`}
                    className="px-4 py-2 rounded-md text-sm font-medium hover:bg-amber-100 hover:text-amber-700 whitespace-nowrap transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      {/* Cart Sheet - ONLY show when NOT admin */}
      {!isAdmin && <CartSheet />}
    </>
  );
}
