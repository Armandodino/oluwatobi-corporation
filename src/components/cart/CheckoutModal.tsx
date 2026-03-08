'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Truck, CheckCircle, Loader2, ChevronLeft, Smartphone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/currency';

// Numéro WhatsApp de l'admin
const ADMIN_WHATSAPP = '22507155414';

interface CheckoutModalProps {
  onClose: () => void;
}

export default function CheckoutModal({ onClose }: CheckoutModalProps) {
  const { items, total, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [user, setUser] = useState<{ id: string; name: string | null; email: string } | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    address: '',
    city: 'Abidjan',
    postalCode: '',
    paymentMethod: 'orange_money',
  });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setFormData((prev) => ({
          ...prev,
          email: data.user.email,
          name: data.user.name || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const grandTotal = total;

  // Générer le message WhatsApp pour l'admin avec les détails complets de la commande
  const generateAdminWhatsAppMessage = (orderNum: string) => {
    const itemsList = items
      .map((item, index) => {
        const price = item.product.salePrice || item.product.price;
        return `${index + 1}. ${item.product.name} (x${item.quantity}) - ${formatPrice(price * item.quantity)}`;
      })
      .join('\n');

    const paymentMethodLabel = 
      formData.paymentMethod === 'orange_money' ? 'Orange Money' :
      formData.paymentMethod === 'mtn_money' ? 'MTN Mobile Money' :
      formData.paymentMethod === 'wave' ? 'Wave' :
      formData.paymentMethod === 'card' ? 'Carte bancaire' : 'Paiement à la livraison';

    const message = `🛒 *COMMANDE #${orderNum} - OLUWATOBI CORPORATION*

📅 ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}

👤 *Client:*
• Nom: ${formData.name}
• Téléphone: ${formData.phone}
• Email: ${formData.email || 'Non renseigné'}

📍 *Adresse de livraison:*
${formData.address}
${formData.postalCode ? formData.postalCode + ', ' : ''}${formData.city}

📦 *Articles commandés:*
${itemsList}

💰 *Récapitulatif:*
• Sous-total: ${formatPrice(total)}
• Livraison: À définir avec le vendeur
• Mode de paiement: ${paymentMethodLabel}
• TOTAL: *${formatPrice(grandTotal)}*

---
OLUWATOBI CORPORATION
📞 +225 07 15 54 14
📍 Abidjan, Cocody - Côte d'Ivoire`;

    return encodeURIComponent(message);
  };

  // Envoyer la notification WhatsApp à l'admin
  const sendWhatsAppNotification = (orderNum: string) => {
    const message = generateAdminWhatsAppMessage(orderNum);
    const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          paymentMethod: formData.paymentMethod,
          shipping: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrderNumber(data.orderNumber);
        setOrderComplete(true);
        clearCart();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Erreur lors de la création de la commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Commande confirmée !</h2>
          <p className="text-slate-600 mb-4">
            Merci pour votre commande. Vous recevrez une confirmation par SMS au{' '}
            <strong>{formData.phone}</strong>
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Numéro de commande: <strong>{orderNumber}</strong>
          </p>
          
          {/* Bouton pour envoyer la notification WhatsApp à l'admin */}
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white mb-3"
            onClick={() => sendWhatsAppNotification(orderNumber)}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Notifier l&apos;admin via WhatsApp
          </Button>
          
          <Button onClick={onClose} className="w-full bg-amber-500 hover:bg-amber-600">
            Continuer mes achats
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button variant="ghost" size="icon" onClick={() => setStep(step - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <h2 className="text-xl font-bold">Finaliser la commande</h2>
          </div>
        </div>

        {/* Progress */}
        <div className="flex justify-center gap-4 py-4 border-b">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {s}
              </div>
              <span className={`text-sm hidden sm:block ${step >= s ? 'text-slate-900' : 'text-slate-400'}`}>
                {s === 1 ? 'Livraison' : s === 2 ? 'Paiement' : 'Confirmation'}
              </span>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6 p-6">
          {/* Form */}
          <div className="md:col-span-2 space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5 text-amber-500" />
                  Adresse de livraison
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom complet *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      placeholder="+225 07 XX XX XX XX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="address">Adresse *</Label>
                  <Input
                    id="address"
                    placeholder="Quartier, Rue, N°"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Ville *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Commune</Label>
                    <Input
                      id="postalCode"
                      placeholder="Cocody, Plateau, Treichville..."
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-amber-500" />
                  Mode de paiement
                </h3>

                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="orange_money" id="orange_money" />
                    <Label htmlFor="orange_money" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-orange-500" />
                        <span>Orange Money</span>
                      </div>
                    </Label>
                    <span className="text-orange-500 font-bold text-sm">OM</span>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="mtn_money" id="mtn_money" />
                    <Label htmlFor="mtn_money" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-yellow-500" />
                        <span>MTN Mobile Money</span>
                      </div>
                    </Label>
                    <span className="text-yellow-500 font-bold text-sm">MTN</span>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="wave" id="wave" />
                    <Label htmlFor="wave" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-blue-500" />
                        <span>Wave</span>
                      </div>
                    </Label>
                    <span className="text-blue-500 font-bold text-sm">Wave</span>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-slate-500" />
                        <span>Carte bancaire</span>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-bold">💵</span>
                        <span>Paiement à la livraison</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                <p className="text-sm text-slate-500">
                  Paiement sécurisé via Mobile Money ou carte bancaire.
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Récapitulatif de la commande</h3>

                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div>
                    <h4 className="font-medium">Adresse de livraison</h4>
                    <p className="text-sm text-slate-600">
                      {formData.name}<br />
                      {formData.address}<br />
                      {formData.postalCode && `${formData.postalCode}, `}{formData.city}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium">Mode de paiement</h4>
                    <p className="text-sm text-slate-600">
                      {formData.paymentMethod === 'orange_money' ? 'Orange Money' :
                       formData.paymentMethod === 'mtn_money' ? 'MTN Mobile Money' :
                       formData.paymentMethod === 'wave' ? 'Wave' :
                       formData.paymentMethod === 'card' ? 'Carte bancaire' : 'Paiement à la livraison'}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium">Articles ({items.length})</h4>
                    {items.map((item) => (
                      <p key={item.id} className="text-sm text-slate-600">
                        {item.quantity}x {item.product.name} - {formatPrice((item.product.salePrice || item.product.price) * item.quantity)}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="md:col-span-1">
            <div className="bg-slate-50 rounded-lg p-4 sticky top-4">
              <h3 className="font-semibold mb-4">Récapitulatif</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span>À définir</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <Button
                className="w-full mt-4 bg-amber-500 hover:bg-amber-600"
                onClick={() => {
                  if (step < 3) {
                    setStep(step + 1);
                  } else {
                    handleSubmit();
                  }
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : step === 3 ? (
                  'Confirmer la commande'
                ) : (
                  'Continuer'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
