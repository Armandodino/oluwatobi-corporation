import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

// GET - Get orders
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    // If userId is 'all', return all orders (for admin)
    const whereClause = userId && userId !== 'all' ? { userId } : {};

    const orders = await db.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des commandes' }, { status: 500 });
  }
}

// POST - Create order
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
    const SHIPPING_COST = 0;
    const total = subtotal + SHIPPING_COST;

    // Generate order number
    const orderNumber = `QUIN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber,
        userId: data.userId || null,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: data.paymentMethod,
        shippingName: data.shipping.name,
        shippingEmail: data.shipping.email,
        shippingPhone: data.shipping.phone,
        shippingAddress: data.shipping.address,
        shippingCity: data.shipping.city,
        shippingPostalCode: data.shipping.postalCode,
        subtotal: Math.round(subtotal),
        shippingCost: SHIPPING_COST,
        tax: 0, // TVA incluse dans les prix
        total: Math.round(total),
        notes: data.notes,
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
        items: true,
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

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de la commande' }, { status: 500 });
  }
}
