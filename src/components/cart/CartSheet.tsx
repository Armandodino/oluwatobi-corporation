'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Minus, ShoppingBag, Trash2, Loader2, MessageCircle, X, User, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/currency';

// Numéro WhatsApp de l'admin
const ADMIN_WHATSAPP = '22507155414';

export default function CartSheet() {
  const { items, total, isOpen, closeCart, fetchCart, updateItem, removeItem } = useCartStore();
  const [updating, setUpdating] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    localisation: '',
  });

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemove(itemId);
      return;
    }
    setUpdating(itemId);
    try {
      await updateItem(itemId, newQuantity);
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    setUpdating(itemId);
    try {
      await removeItem(itemId);
    } finally {
      setUpdating(null);
    }
  };

  const grandTotal = total;

  // Générer le message WhatsApp avec les détails de la commande et infos client
  const generateWhatsAppMessage = (orderNum: string) => {
    const itemsList = items
      .map((item, index) => {
        const price = item.product.salePrice || item.product.price;
        return `${index + 1}. ${item.product.name} (x${item.quantity}) - ${formatPrice(price * item.quantity)}`;
      })
      .join('\n');

    const message = `🛒 *COMMANDE #${orderNum} - OLUWATOBI CORPORATION*

📅 ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}

👤 *Informations client:*
• Nom: ${formData.nom} ${formData.prenom}
• Téléphone: ${formData.telephone}
• Email: ${formData.email || 'Non renseigné'}
• Localisation: ${formData.localisation}

📦 *Articles commandés:*
${itemsList}

💰 *Récapitulatif:*
• Sous-total: ${formatPrice(total)}
• Livraison: À définir avec le vendeur
• TOTAL: *${formatPrice(grandTotal)}*

---
OLUWATOBI CORPORATION
📞 +225 07 15 54 14
📍 Abidjan, Cocody - Côte d'Ivoire`;

    return encodeURIComponent(message);
  };

  // Enregistrer la commande et ouvrir WhatsApp
  const handleWhatsAppOrder = async () => {
    // Vérifier que les champs requis sont remplis
    if (!formData.nom.trim() || !formData.prenom.trim() || !formData.telephone.trim() || !formData.localisation.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Enregistrer la commande en base de données
      const response = await fetch('/api/orders/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la commande');
      }

      // 2. Ouvrir WhatsApp avec le message incluant le numéro de commande
      const message = generateWhatsAppMessage(data.orderNumber);
      const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${message}`;
      window.open(whatsappUrl, '_blank');

      // 3. Afficher le succès
      setOrderNumber(data.orderNumber);
      setOrderSuccess(true);
      setShowForm(false);

      // 4. Rafraîchir le panier (qui est maintenant vide)
      fetchCart();

    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ouvrir le formulaire
  const openOrderForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      telephone: '',
      email: '',
      localisation: '',
    });
    setShowForm(true);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
        <SheetContent className="w-full sm:max-w-md flex flex-col p-0 h-screen">
          {/* Header fixe */}
          <SheetHeader className="p-4 border-b shrink-0">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-orange-500" />
              Mon Panier ({items.length} article{items.length > 1 ? 's' : ''})
            </SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <ShoppingBag className="h-16 w-16 text-slate-300 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Votre panier est vide</h3>
              <p className="text-slate-500 mb-4">Découvrez nos produits et ajoutez-les à votre panier</p>
              <Button onClick={closeCart} asChild className="bg-orange-500 hover:bg-orange-600">
                <Link href="/">Voir les produits</Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Zone scrollable pour les articles */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                <div className="p-4 space-y-3">
                  {items.map((item) => {
                    const price = item.product.salePrice || item.product.price;
                    const itemTotal = price * item.quantity;
                    const isUpdating = updating === item.id;

                    return (
                      <div key={item.id} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                        {/* Image du produit */}
                        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-slate-400 text-xs text-center p-1 shrink-0 overflow-hidden">
                          {item.product.image ? (
                            <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover rounded" />
                          ) : (
                            'IMG'
                          )}
                        </div>

                        {/* Détails du produit */}
                        <div className="flex-1 min-w-0 flex flex-col">
                          <h4 className="font-medium text-sm line-clamp-1">{item.product.name}</h4>
                          <p className="text-orange-600 font-semibold text-sm">
                            {formatPrice(price)}
                            {item.product.salePrice && (
                              <span className="text-slate-400 text-xs line-through ml-1">
                                {formatPrice(item.product.price)}
                              </span>
                            )}
                          </p>

                          {/* Contrôles quantité et suppression */}
                          <div className="flex items-center justify-between mt-auto pt-2">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                disabled={isUpdating}
                              >
                                {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Minus className="h-3 w-3" />}
                              </Button>
                              <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                disabled={isUpdating || item.quantity >= item.product.stock}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-700">{formatPrice(itemTotal)}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleRemove(item.id)}
                                disabled={isUpdating}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section totale fixe en bas */}
              <div className="shrink-0 border-t bg-white p-4 safe-area-pb">
                {/* Récapitulatif */}
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Sous-total</span>
                    <span className="font-medium">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Livraison</span>
                    <span className="text-slate-600">À définir</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-orange-600">{formatPrice(grandTotal)}</span>
                  </div>
                </div>



                {/* Bouton Commander via WhatsApp */}
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold"
                  onClick={openOrderForm}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Commander via WhatsApp
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full mt-2 text-slate-600" 
                  onClick={closeCart} 
                  asChild
                >
                  <Link href="/">Continuer les achats</Link>
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Modal formulaire client */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header du formulaire */}
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Vos informations</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Formulaire */}
            <div className="p-4 space-y-4">
              <p className="text-sm text-slate-600 mb-4">
                Veuillez renseigner vos informations pour finaliser votre commande.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nom">Nom *</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="nom"
                      placeholder="Votre nom"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="prenom">Prénom *</Label>
                  <Input
                    id="prenom"
                    placeholder="Votre prénom"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="telephone">Numéro de téléphone *</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="telephone"
                    placeholder="+225 07 XX XX XX XX"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email (optionnel)</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="localisation">Adresse de livraison *</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <textarea
                    id="localisation"
                    placeholder="Quartier, Rue, N° de maison, Commune..."
                    value={formData.localisation}
                    onChange={(e) => setFormData({ ...formData, localisation: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px]"
                  />
                </div>
              </div>

              {/* Récapitulatif de la commande */}
              <div className="bg-slate-50 rounded-lg p-3 mt-4">
                <h3 className="font-medium text-sm mb-2">Récapitulatif de votre commande</h3>
                <div className="text-xs text-slate-600 space-y-1">
                  <p>{items.length} article{items.length > 1 ? 's' : ''} dans le panier</p>
                  <div className="flex justify-between font-semibold text-sm text-slate-900">
                    <span>Total à payer:</span>
                    <span className="text-orange-600">{formatPrice(grandTotal)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white h-12"
                  onClick={handleWhatsAppOrder}
                  disabled={!formData.nom.trim() || !formData.prenom.trim() || !formData.telephone.trim() || !formData.localisation.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Enregistrement en cours...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Envoyer la commande via WhatsApp
                    </>
                  )}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setShowForm(false)} disabled={isSubmitting}>
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de succès */}
      {orderSuccess && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Commande enregistrée !</h2>
            <p className="text-slate-600 mb-2">
              Votre commande a été enregistrée avec succès.
            </p>
            <p className="text-sm text-slate-500 mb-6">
              Numéro de commande: <strong className="text-orange-600">{orderNumber}</strong>
            </p>
            <p className="text-sm text-slate-500 mb-6">
              Vous allez être contacté via WhatsApp pour confirmer les détails de livraison.
            </p>
            <Button 
              onClick={() => {
                setOrderSuccess(false);
                closeCart();
              }} 
              className="bg-orange-500 hover:bg-orange-600 w-full"
            >
              Continuer mes achats
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
