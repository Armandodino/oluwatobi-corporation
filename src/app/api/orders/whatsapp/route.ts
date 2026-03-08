import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

// POST - Create order from WhatsApp
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('cart_session')?.value;

    // Get cart items
    const cartItems = await db.cartItem.findMany({
      where: { sessionId },
      include: { Product: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Le panier est vide' }, { status: 400 });
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.Product.salePrice || item.Product.price;
      return sum + price * item.quantity;
    }, 0);

    // Frais de livraison à définir par l'admin (0 par défaut)
    const shippingCost = 0;
    const total = subtotal + shippingCost;

    // Generate order number
    const orderNumber = `OLW-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create or find guest user for this order
    const guestEmail = `guest_${Date.now()}@oluwatobi-guest.com`;
    const guestUser = await db.user.create({
      data: {
        email: guestEmail,
        name: `${data.prenom} ${data.nom}`,
        phone: data.telephone,
        address: data.localisation,
        city: 'Abidjan',
        role: 'guest',
      },
    });

    // Create order with guest user
    const order = await db.order.create({
      data: {
        orderNumber,
        userId: guestUser.id,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'whatsapp',
        shippingName: `${data.prenom} ${data.nom}`,
        shippingEmail: data.email || guestEmail,
        shippingPhone: data.telephone,
        shippingAddress: data.localisation,
        shippingCity: 'Abidjan',
        shippingPostalCode: '',
        subtotal: Math.round(subtotal),
        shippingCost,
        tax: 0,
        total: Math.round(total),
        notes: `Commande passée via WhatsApp. Email client: ${data.email || 'Non renseigné'}`,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            name: item.Product.name,
            price: item.Product.salePrice || item.Product.price,
            quantity: item.quantity,
            total: Math.round((item.Product.salePrice || item.Product.price) * item.quantity),
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Update stock
    for (const item of cartItems) {
      await db.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Clear cart
    await db.cartItem.deleteMany({
      where: { sessionId },
    });

    return NextResponse.json({ 
      success: true, 
      orderNumber: order.orderNumber,
      order 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating WhatsApp order:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de la commande' }, { status: 500 });
  }
}
