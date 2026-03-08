'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Save, Loader2, Package, Image as ImageIcon, Upload, Home, LogOut, Settings, Users, ShoppingCart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPrice } from '@/lib/currency';
import type { Product, Category } from '@/types';

export default function AdminDashboard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('products');

  // Stats
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    salePrice: '',
    sku: '',
    stock: '0',
    image: '',
    categoryId: '',
    brand: '',
    featured: false,
    weight: '',
    dimensions: '',
  });

  // Check if user is admin
  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user?.role === 'admin') {
          setIsAdmin(true);
          fetchData();
        } else {
          router.push('/?auth=login');
        }
      } else {
        router.push('/?auth=login');
      }
    } catch (error) {
      router.push('/?auth=login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/me', { method: 'DELETE' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products?limit=100'),
        fetch('/api/categories'),
      ]);
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      setProducts(productsData.products || []);
      setCategories(categoriesData);
      
      // Set stats
      setStats({
        totalProducts: productsData.products?.length || 0,
        totalCategories: categoriesData.length || 0,
        totalOrders: 0,
        totalRevenue: 0,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      salePrice: '',
      sku: '',
      stock: '0',
      image: '',
      categoryId: '',
      brand: '',
      featured: false,
      weight: '',
      dimensions: '',
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      salePrice: product.salePrice?.toString() || '',
      sku: product.sku,
      stock: product.stock.toString(),
      image: product.image || '',
      categoryId: product.categoryId || '',
      brand: product.brand || '',
      featured: product.featured,
      weight: product.weight?.toString() || '',
      dimensions: product.dimensions || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProducts(products.filter((p) => p.id !== productId));
        alert('Produit supprimé avec succès');
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Type de fichier non autorisé. Utilisez JPG, PNG, GIF ou WebP.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier est trop volumineux. Maximum 5MB.');
      return;
    }

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        setFormData({ ...formData, image: data.url });
      } else {
        alert(data.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Le nom du produit est requis');
      return;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert('Le prix doit être supérieur à 0');
      return;
    }

    setSaving(true);

    try {
      const slug = formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const productData = {
        name: formData.name.trim(),
        slug: editingProduct ? editingProduct.slug : slug,
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        sku: formData.sku.trim() || `SKU-${Date.now()}`,
        stock: parseInt(formData.stock) || 0,
        image: formData.image.trim() || null,
        categoryId: formData.categoryId || null,
        brand: formData.brand.trim() || null,
        featured: formData.featured,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dimensions: formData.dimensions.trim() || null,
      };

      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
        
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Erreur lors de la mise à jour');
        }
        
        const updated = await res.json();
        setProducts(products.map((p) => (p.id === editingProduct.id ? updated : p)));
        alert('Produit mis à jour avec succès');
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
        
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Erreur lors de la création');
        }
        
        const created = await res.json();
        setProducts([created, ...products]);
        alert('Produit créé avec succès');
      }

      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de l\'enregistrement du produit');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-slate-600">Vérification des accès...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <img 
                src="/logo.jpeg" 
                alt="OLUWATOBI" 
                className="h-10 w-10 rounded-lg object-cover"
              />
              <div>
                <h1 className="font-bold text-slate-900">Dashboard Admin</h1>
                <p className="text-xs text-slate-500">OLUWATOBI CORPORATION</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <Home className="h-4 w-4" />
                  Accueil
                </Button>
              </Link>
              <Button variant="outline" className="gap-2 text-red-500 hover:text-red-700" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Produits</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Catégories</p>
                <p className="text-2xl font-bold">{stats.totalCategories}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Commandes</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Revenus</p>
                <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {/* Tabs */}
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('products')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'products'
                    ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Package className="h-4 w-4 inline mr-2" />
                Produits
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'categories'
                    ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Settings className="h-4 w-4 inline mr-2" />
                Catégories
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'orders'
                    ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingCart className="h-4 w-4 inline mr-2" />
                Commandes
              </button>
            </div>
          </div>

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="flex">
              {/* Product List */}
              <div className={`${showForm ? 'w-1/2' : 'w-full'} border-r`}>
                <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    {products.length} produit{products.length > 1 ? 's' : ''}
                  </p>
                  <Button
                    onClick={handleAddNew}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                  {products.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">Aucun produit</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="p-4 hover:bg-slate-50 flex items-center gap-4"
                        >
                          <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="h-6 w-6 text-slate-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium truncate">{product.name}</h3>
                              {product.featured && (
                                <Badge className="bg-orange-500 text-white text-xs">Vedette</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-orange-600 font-semibold">
                                {formatPrice(product.salePrice || product.price)}
                              </span>
                              <span className="text-xs text-slate-500">Stock: {product.stock}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" onClick={() => handleEdit(product)} className="bg-orange-500 hover:bg-orange-600">
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleDelete(product.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Form */}
              {showForm && (
                <div className="w-1/2 bg-slate-50 p-4 max-h-[700px] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">
                      {editingProduct ? '✏️ Modifier' : '➕ Nouveau produit'}
                    </h3>
                    <Button variant="ghost" size="sm" onClick={resetForm}>✕</Button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-xl">
                    <div>
                      <Label>Nom *</Label>
                      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Prix (FCFA) *</Label>
                        <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                      </div>
                      <div>
                        <Label>Prix promo</Label>
                        <Input type="number" value={formData.salePrice} onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>SKU</Label>
                        <Input value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
                      </div>
                      <div>
                        <Label>Stock</Label>
                        <Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <Label>Catégorie</Label>
                      <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Marque</Label>
                      <Input value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
                    </div>
                    <div>
                      <Label>Image</Label>
                      <div className="flex gap-4 items-start mt-2">
                        <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed">
                          {formData.image ? (
                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="h-8 w-8 text-slate-300" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            <span className="ml-2">Uploader</span>
                          </Button>
                          <Input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="URL image" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-orange-50 p-3 rounded-lg">
                      <Checkbox id="featured" checked={formData.featured} onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })} />
                      <Label htmlFor="featured" className="cursor-pointer">⭐ Produit vedette</Label>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600" disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Enregistrer
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm}>Annuler</Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="p-4">
              <div className="mb-4">
                <p className="text-sm text-slate-600">{categories.length} catégories</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-slate-500">{category.productCount} produits</p>
                      </div>
                      <Badge variant="secondary">{category.slug}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="p-8 text-center text-slate-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Gestion des commandes</p>
              <p className="text-sm mt-2">Les commandes apparaîtront ici</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
