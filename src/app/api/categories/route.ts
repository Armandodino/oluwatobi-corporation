import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all categories
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

    // Transform to include product count
    const categoriesWithCount = categories.map((cat) => ({
      ...cat,
      productCount: cat._count.products,
      _count: undefined,
    }));

    // If withProducts, also fetch products for each category
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

// POST - Create category
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const category = await db.category.create({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
        description: data.description,
        image: data.image,
        parentId: data.parentId,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de la catégorie' }, { status: 500 });
  }
}
