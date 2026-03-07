import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

// PUT - Update cart item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('cart_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session non trouvée' }, { status: 401 });
    }

    // Verify item belongs to session
    const cartItem = await db.cartItem.findFirst({
      where: { id, sessionId },
      include: { Product: true },
    });

    if (!cartItem) {
      return NextResponse.json({ error: 'Article non trouvé dans le panier' }, { status: 404 });
    }

    if (data.quantity <= 0) {
      await db.cartItem.delete({ where: { id } });
      return NextResponse.json({ success: true, deleted: true });
    }

    if (data.quantity > cartItem.Product.stock) {
      return NextResponse.json({ error: 'Stock insuffisant' }, { status: 400 });
    }

    const updatedItem = await db.cartItem.update({
      where: { id },
      data: { quantity: data.quantity },
      include: { Product: true },
    });

    // Transform for frontend
    return NextResponse.json({
      ...updatedItem,
      product: updatedItem.Product,
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du panier' }, { status: 500 });
  }
}

// DELETE - Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('cart_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session non trouvée' }, { status: 401 });
    }

    await db.cartItem.deleteMany({
      where: { id, sessionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression du produit' }, { status: 500 });
  }
}
