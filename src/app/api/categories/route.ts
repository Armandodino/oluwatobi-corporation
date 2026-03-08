import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { categoryCreateSchema, sanitizeString } from '@/lib/validations';

// GET - List all categories (public)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const withProducts = searchParams.get('withProducts') === 'true';

    const categories = await db.category.findMany({
      include: {
        children: true,
        _count: {
          select: {
            products: {
              where: { active: true },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const categoriesWithCount = categories.map((cat) => ({
      ...cat,
      productCount: cat._count.products,
      _count: undefined,
    }));

    if (withProducts) {
      const categoriesWithProducts = await Promise.all(
        categories.map(async (cat) => {
          const products = await db.product.findMany({
            where: {
              categoryId: cat.id,
              active: true,
            },
            take: 4,
          });
          return {
            ...cat,
            products,
          };
        })
      );
      return NextResponse.json(categoriesWithProducts);
    }

    return NextResponse.json(categoriesWithCount);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des catégories' }, { status: 500 });
  }
}

// POST - Create category (admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: 'Accès non autorisé. Connexion admin requise.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = categoryCreateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const category = await db.category.create({
      data: {
        name: sanitizeString(data.name),
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: data.description ? sanitizeString(data.description) : null,
        image: data.image || null,
        parentId: data.parentId || null,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de la catégorie' }, { status: 500 });
  }
}
