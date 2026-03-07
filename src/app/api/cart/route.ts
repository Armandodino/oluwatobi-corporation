import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

// GET - Get cart items
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('cart_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ items: [], total: 0 });
    }

    const cartItems = await db.cartItem.findMany({
      where: { sessionId },
      include: {
        Product: {
          include: {
            category: true,
          },
        },
      },
    });

    // Transform to lowercase for frontend compatibility
    const items = cartItems.map(item => ({
      ...item,
      product: item.Product,
    }));

    const total = items.reduce((sum, item) => {
      const price = item.product.salePrice || item.product.price;
      return sum + price * item.quantity;
    }, 0);

    return NextResponse.json({
      items,
      total: Math.round(total * 100) / 100,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération du panier' }, { status: 500 });
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const cookieStore = await cookies();
    
    let sessionId = cookieStore.get('cart_session')?.value;
    
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      cookieStore.set('cart_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    // Check if product exists and has stock
    const product = await db.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    if (product.stock < data.quantity) {
      return NextResponse.json({ error: 'Stock insuffisant' }, { status: 400 });
    }

    // Check if item already in cart
    const existingItem = await db.cartItem.findFirst({
      where: {
        sessionId,
        productId: data.productId,
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + data.quantity;
      if (newQuantity > product.stock) {
        return NextResponse.json({ error: 'Stock insuffisant' }, { status: 400 });
      }

      const updatedItem = await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: { Product: true },
      });

      // Transform for frontend
      return NextResponse.json({
        ...updatedItem,
        product: updatedItem.Product,
      });
    }

    const cartItem = await db.cartItem.create({
      data: {
        sessionId,
        productId: data.productId,
        quantity: data.quantity,
      },
      include: {
        Product: true,
      },
    });

    // Transform for frontend
    return NextResponse.json({
      ...cartItem,
      product: cartItem.Product,
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'ajout au panier' }, { status: 500 });
  }
}

// DELETE - Clear cart
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('cart_session')?.value;

    if (sessionId) {
      await db.cartItem.deleteMany({
        where: { sessionId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json({ error: 'Erreur lors du vidage du panier' }, { status: 500 });
  }
}
