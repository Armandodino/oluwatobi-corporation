'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Plus, Pencil, Trash2, Save, Loader2, Package, Image as ImageIcon, Upload, ShoppingCart, Eye, CheckCircle, Clock, Truck, XCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/currency';
import type { Product, Category } from '@/types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  product?: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

type TabType = 'products' | 'orders';

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

  // Fetch data based on active tab
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'products') {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products?limit=100'),
          fetch('/api/categories'),
        ]);
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        setProducts(productsData.products || []);
        setCategories(categoriesData);
      } else if (activeTab === 'orders') {
        const ordersRes = await fetch('/api/orders?userId=all');
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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

      console.log('Sending product data:', productData);

      if (editingProduct) {
        // Update existing product
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
        // Create new product
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

  // Update order status
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status });
        }
        alert('Statut mis à jour');
      } else {
        alert('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  // Update payment status
  const updatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus }),
      });

      if (res.ok) {
        setOrders(orders.map((o) => (o.id === orderId ? { ...o, paymentStatus } : o)));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, paymentStatus });
        }
        alert('Statut de paiement mis à jour');
      } else {
        alert('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      pending: { label: 'En attente', className: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
      processing: { label: 'En traitement', className: 'bg-blue-100 text-blue-800', icon: <Loader2 className="h-3 w-3" /> },
      shipped: { label: 'Expédiée', className: 'bg-purple-100 text-purple-800', icon: <Truck className="h-3 w-3" /> },
      delivered: { label: 'Livrée', className: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
      cancelled: { label: 'Annulée', className: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  // Get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Payé', className: 'bg-green-100 text-green-800' },
      failed: { label: 'Échoué', className: 'bg-red-100 text-red-800' },
      refunded: { label: 'Remboursé', className: 'bg-gray-100 text-gray-800' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // Get payment method label
  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      orange_money: 'Orange Money',
      mtn_money: 'MTN Mobile Money',
      wave: 'Wave',
      card: 'Carte bancaire',
      cash: 'Paiement à la livraison',
    };
    return methods[method] || method;
  };

  // Send WhatsApp to client
  const sendWhatsAppToClient = (order: Order) => {
    const message = `Bonjour ${order.shippingName},

Votre commande #${order.orderNumber} chez OLUWATOBI CORPORATION est en cours de traitement.

📦 Articles: ${order.items.length} produit(s)
💰 Total: ${formatPrice(order.total)}
📍 Livraison: ${order.shippingAddress}, ${order.shippingCity}

Nous vous tiendrons informé de l'avancement de votre commande.

Merci pour votre confiance !

OLUWATOBI CORPORATION
📞 +225 07 15 54 14`;
    
    const whatsappUrl = `https://wa.me/${order.shippingPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6" />
            <h2 className="text-xl font-bold">Dashboard Admin</h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Tabs */}
            <div className="flex bg-white/20 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'products' ? 'bg-white text-orange-600' : 'text-white hover:bg-white/10'
                }`}
              >
                <Package className="h-4 w-4 inline mr-2" />
                Produits
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'orders' ? 'bg-white text-orange-600' : 'text-white hover:bg-white/10'
                }`}
              >
                <ShoppingCart className="h-4 w-4 inline mr-2" />
                Commandes
                {orders.filter(o => o.status === 'pending').length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {orders.filter(o => o.status === 'pending').length}
                  </span>
                )}
              </button>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <>
              {/* Product List */}
              <div className={`${showForm ? 'w-1/2' : 'w-full'} flex flex-col border-r overflow-hidden`}>
                <div className="p-4 border-b bg-slate-50 shrink-0 flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    {products.length} produit{products.length > 1 ? 's' : ''} enregistré{products.length > 1 ? 's' : ''}
                  </p>
                  <Button onClick={handleAddNew} className="bg-orange-500 hover:bg-orange-600 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="p-8 text-center text-slate-500">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                      Chargement...
                    </div>
                  ) : products.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">Aucun produit</p>
                      <p className="text-sm mt-2">Cliquez sur "Ajouter" pour commencer</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="p-4 hover:bg-slate-50 flex items-center gap-4 transition-colors"
                        >
                          {/* Image */}
                          <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-8 w-8 text-slate-300" />
                            )}
                          </div>

                          {/* Info */}
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
                              {product.salePrice && (
                                <span className="text-sm text-slate-400 line-through">
                                  {formatPrice(product.price)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                              <span>Stock: {product.stock}</span>
                              <span>SKU: {product.sku}</span>
                              {product.category && (
                                <span className="bg-slate-100 px-2 py-0.5 rounded">
                                  {product.category.name}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              onClick={() => handleEdit(product)}
                              className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              Modifier
                            </Button>
                            <Button
                              variant="outline"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                              onClick={() => handleDelete(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
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
                <div className="w-1/2 flex flex-col overflow-hidden bg-slate-50">
                  <div className="p-4 border-b bg-white flex items-center justify-between shrink-0 shadow-sm">
                    <h3 className="font-semibold text-lg">
                      {editingProduct ? '✏️ Modifier le produit' : '➕ Nouveau produit'}
                    </h3>
                    <Button variant="ghost" size="sm" onClick={resetForm} className="hover:bg-slate-100">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-sm">
                      {/* Name */}
                      <div>
                        <Label htmlFor="name" className="font-medium">Nom du produit *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Ex: Marteau professionnel 500g"
                          className="mt-1"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <Label htmlFor="description" className="font-medium">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Décrivez votre produit..."
                          rows={3}
                          className="mt-1"
                        />
                      </div>

                      {/* Price and Sale Price */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="price" className="font-medium">Prix (FCFA) *</Label>
                          <Input
                            id="price"
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="25000"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="salePrice" className="font-medium">Prix promo (FCFA)</Label>
                          <Input
                            id="salePrice"
                            type="number"
                            value={formData.salePrice}
                            onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                            placeholder="20000"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      {/* SKU and Stock */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="sku" className="font-medium">Référence (SKU)</Label>
                          <Input
                            id="sku"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            placeholder="OUT-001"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="stock" className="font-medium">Stock</Label>
                          <Input
                            id="stock"
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            placeholder="10"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      {/* Category */}
                      <div>
                        <Label htmlFor="category" className="font-medium">Catégorie</Label>
                        <Select
                          value={formData.categoryId}
                          onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Brand */}
                      <div>
                        <Label htmlFor="brand" className="font-medium">Marque</Label>
                        <Input
                          id="brand"
                          value={formData.brand}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                          placeholder="Ex: Stanley, Bosch, Makita"
                          className="mt-1"
                        />
                      </div>

                      {/* Image Upload */}
                      <div>
                        <Label className="font-medium">Image du produit</Label>
                        <div className="mt-2 flex gap-4 items-start">
                          {/* Image Preview */}
                          <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 shrink-0">
                            {formData.image ? (
                              <img
                                src={formData.image}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <ImageIcon className="h-10 w-10 text-slate-300" />
                            )}
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            {/* Upload Button */}
                            <div>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="border-orange-500 text-orange-600 hover:bg-orange-50"
                              >
                                {uploading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Upload...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Choisir une image
                                  </>
                                )}
                              </Button>
                              <p className="text-xs text-slate-500 mt-1">
                                JPG, PNG, GIF, WebP. Max 5MB
                              </p>
                            </div>
                            
                            {/* URL Input */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">ou URL:</span>
                            </div>
                            <Input
                              value={formData.image}
                              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                              placeholder="https://exemple.com/image.jpg"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Weight and Dimensions */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="weight" className="font-medium">Poids (kg)</Label>
                          <Input
                            id="weight"
                            type="number"
                            step="0.1"
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            placeholder="1.5"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dimensions" className="font-medium">Dimensions</Label>
                          <Input
                            id="dimensions"
                            value={formData.dimensions}
                            onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                            placeholder="30x20x5 cm"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      {/* Featured */}
                      <div className="flex items-center gap-2 py-2 bg-orange-50 px-4 rounded-lg">
                        <Checkbox
                          id="featured"
                          checked={formData.featured}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, featured: checked as boolean })
                          }
                        />
                        <Label htmlFor="featured" className="cursor-pointer font-medium">
                          ⭐ Produit vedette (affiché en promotion)
                        </Label>
                      </div>

                      {/* Submit */}
                      <div className="flex gap-3 pt-4 border-t">
                        <Button
                          type="submit"
                          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3"
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Enregistrement...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              {editingProduct ? 'Mettre à jour le produit' : 'Créer le produit'}
                            </>
                          )}
                        </Button>
                        <Button type="button" variant="outline" onClick={resetForm} className="px-6">
                          Annuler
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="w-full flex flex-col overflow-hidden">
              <div className="p-4 border-b bg-slate-50 shrink-0">
                <p className="text-sm text-slate-600">
                  {orders.length} commande{orders.length > 1 ? 's' : ''} au total
                  {orders.filter(o => o.status === 'pending').length > 0 && (
                    <span className="ml-2 text-orange-600 font-medium">
                      ({orders.filter(o => o.status === 'pending').length} en attente)
                    </span>
                  )}
                </p>
              </div>
              
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              ) : orders.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
                  <ShoppingCart className="h-16 w-16 mb-4 opacity-50" />
                  <p className="font-medium text-lg">Aucune commande</p>
                  <p className="text-sm mt-2">Les commandes apparaîtront ici</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  <div className="divide-y">
                    {orders.map((order) => (
                      <div key={order.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          {/* Order Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">#{order.orderNumber}</h3>
                              {getStatusBadge(order.status)}
                              {getPaymentStatusBadge(order.paymentStatus)}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-slate-500">Client</p>
                                <p className="font-medium">{order.shippingName}</p>
                                <p className="text-slate-600">{order.shippingPhone}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Livraison</p>
                                <p className="font-medium">{order.shippingCity}</p>
                                <p className="text-slate-600 text-xs">{order.shippingAddress}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Paiement</p>
                                <p className="font-medium">{getPaymentMethodLabel(order.paymentMethod)}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Total</p>
                                <p className="font-bold text-orange-600 text-lg">{formatPrice(order.total)}</p>
                              </div>
                            </div>

                            {/* Items */}
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm text-slate-500 mb-2">{order.items.length} article(s)</p>
                              <div className="flex flex-wrap gap-2">
                                {order.items.map((item) => (
                                  <div key={item.id} className="bg-slate-100 rounded px-3 py-1 text-sm">
                                    {item.quantity}x {item.name}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <p className="text-xs text-slate-400 mt-2">
                              {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2 shrink-0">
                            <Select
                              value={order.status}
                              onValueChange={(value) => updateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">En attente</SelectItem>
                                <SelectItem value="processing">En traitement</SelectItem>
                                <SelectItem value="shipped">Expédiée</SelectItem>
                                <SelectItem value="delivered">Livrée</SelectItem>
                                <SelectItem value="cancelled">Annulée</SelectItem>
                              </SelectContent>
                            </Select>

                            <Select
                              value={order.paymentStatus}
                              onValueChange={(value) => updatePaymentStatus(order.id, value)}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Paiement en attente</SelectItem>
                                <SelectItem value="paid">Payé</SelectItem>
                                <SelectItem value="failed">Échoué</SelectItem>
                                <SelectItem value="refunded">Remboursé</SelectItem>
                              </SelectContent>
                            </Select>

                            <Button
                              variant="outline"
                              className="w-40 text-green-600 hover:bg-green-50 border-green-200"
                              onClick={() => sendWhatsAppToClient(order)}
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              WhatsApp client
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
