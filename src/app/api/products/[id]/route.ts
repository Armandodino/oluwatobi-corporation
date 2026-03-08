import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { productUpdateSchema, isValidObjectId, sanitizeString } from '@/lib/validations';

// GET - Single product by ID or slug (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'ID produit requis' }, { status: 400 });
    }
    
    const product = await db.product.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
        active: true,
      },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

    const relatedProducts = await db.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        active: true,
      },
      take: 4,
    });

    return NextResponse.json({
      ...product,
      avgRating: Math.round(avgRating * 10) / 10,
      relatedProducts,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération du produit' }, { status: 500 });
  }
}

// PUT - Update product (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: 'Accès non autorisé. Connexion admin requise.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'ID produit requis' }, { status: 400 });
    }

    const body = await request.json();
    
    const validationResult = productUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    
    const updateData: Record<string, unknown> = {};
    
    if (data.name !== undefined) updateData.name = sanitizeString(data.name);
    if (data.slug !== undefined) updateData.slug = sanitizeString(data.slug);
    if (data.description !== undefined) updateData.description = data.description ? sanitizeString(data.description) : '';
    if (data.price !== undefined) updateData.price = Math.max(0, parseFloat(data.price));
    if (data.salePrice !== undefined) updateData.salePrice = data.salePrice ? Math.max(0, parseFloat(data.salePrice)) : null;
    if (data.sku !== undefined) updateData.sku = data.sku ? sanitizeString(data.sku) : data.sku;
    if (data.stock !== undefined) updateData.stock = Math.max(0, parseInt(data.stock || '0'));
    if (data.image !== undefined) updateData.image = data.image || '';
    if (data.images !== undefined) updateData.images = data.images ? JSON.stringify(data.images) : null;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.weight !== undefined) updateData.weight = data.weight ? parseFloat(data.weight) : null;
    if (data.dimensions !== undefined) updateData.dimensions = data.dimensions ? sanitizeString(data.dimensions) : null;
    if (data.brand !== undefined) updateData.brand = data.brand ? sanitizeString(data.brand) : null;
    if (data.active !== undefined) updateData.active = data.active;

    const product = await db.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du produit' }, { status: 500 });
  }
}

// DELETE - Soft delete product (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: 'Accès non autorisé. Connexion admin requise.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'ID produit requis' }, { status: 400 });
    }

    await db.product.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression du produit' }, { status: 500 });
  }
}
