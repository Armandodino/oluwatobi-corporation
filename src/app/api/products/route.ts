import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/auth';
import { productCreateSchema, sanitizeString } from '@/lib/validations';

// GET - List products with filters (public)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50);
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = { active: true };

    if (category) {
      where.categoryId = category;
    }

    if (search) {
      const sanitizedSearch = sanitizeString(search);
      where.OR = [
        { name: { contains: sanitizedSearch } },
        { description: { contains: sanitizedSearch } },
        { brand: { contains: sanitizedSearch } },
      ];
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (minPrice || maxPrice) {
      const priceFilter: { gte?: number; lte?: number } = {};
      if (minPrice) priceFilter.gte = Math.max(0, parseFloat(minPrice));
      if (maxPrice) priceFilter.lte = Math.min(10000000, parseFloat(maxPrice));
      where.price = priceFilter;
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    const validSortFields = ['createdAt', 'updatedAt', 'price', 'name', 'stock'];
    if (validSortFields.includes(sort)) {
      orderBy[sort as keyof Prisma.ProductOrderByWithRelationInput] = order === 'asc' || order === 'desc' ? order : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: true,
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    const productsWithRating = products.map((product) => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0;
      return {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
        reviews: undefined,
      };
    });

    return NextResponse.json({
      products: productsWithRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des produits' }, { status: 500 });
  }
}

// POST - Create product (admin only)
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
    
    const validationResult = productCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    
    // Generate unique SKU if not provided
    const generateSKU = () => {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `SKU-${timestamp}-${random}`;
    };
    
    const product = await db.product.create({
      data: {
        name: sanitizeString(data.name),
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: data.description ? sanitizeString(data.description) : '',
        price: Math.max(0, parseFloat(data.price)),
        salePrice: data.salePrice ? Math.max(0, parseFloat(data.salePrice)) : null,
        sku: data.slug || generateSKU(),
        stock: data.stock ? Math.max(0, parseInt(data.stock)) : 0,
        image: data.image || '',
        images: data.images ? JSON.stringify(data.images) : null,
        categoryId: data.categoryId,
        featured: data.featured || false,
        weight: data.weight ? parseFloat(data.weight) : null,
        dimensions: data.dimensions ? sanitizeString(data.dimensions) : null,
        brand: data.brand ? sanitizeString(data.brand) : null,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du produit' }, { status: 500 });
  }
}
