import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Initialize database (create admin user)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminPassword } = body;

    // Validation
    if (!adminPassword) {
      return NextResponse.json({ 
        error: 'Mot de passe requis' 
      }, { status: 400 });
    }

    // Check if admin exists
    const existingAdmin = await db.user.findUnique({
      where: { email: 'admin@oluwatobi-ci.com' },
    });

    let admin;
    if (existingAdmin) {
      // Update existing admin
      admin = await db.user.update({
        where: { email: 'admin@oluwatobi-ci.com' },
        data: {
          password: adminPassword,
          name: 'Administrateur',
          role: 'admin',
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new admin - MongoDB auto-generates ObjectId
      admin = await db.user.create({
        data: {
          email: 'admin@oluwatobi-ci.com',
          name: 'Administrateur',
          password: adminPassword,
          role: 'admin',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Administrateur créé avec succès',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'initialisation' 
    }, { status: 500 });
  }
}

// GET - Check if database is initialized
export async function GET() {
  try {
    const adminCount = await db.user.count({
      where: { role: 'admin' },
    });

    const categoryCount = await db.category.count();
    const productCount = await db.product.count({
      where: { active: true },
    });

    return NextResponse.json({
      initialized: adminCount > 0,
      adminCount,
      categoryCount,
      productCount,
    });
  } catch (error) {
    console.error('Error checking database:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la vérification' 
    }, { status: 500 });
  }
}
