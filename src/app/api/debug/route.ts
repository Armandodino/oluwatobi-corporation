import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';

// GET - Debug endpoint to check database status
export async function GET() {
  try {
    // Check all users
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
      },
    });

    // Check categories count
    const categoryCount = await db.category.count();
    
    // Check products count
    const productCount = await db.product.count();

    return NextResponse.json({
      users,
      categoryCount,
      productCount,
      message: 'Database connection successful',
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ 
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Test login
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { email, password } = data;

    // Check if string is a valid MongoDB ObjectId
    const isValidObjectId = (str: string): boolean => /^[0-9a-fA-F]{24}$/.test(str);
    
    // Build query
    const orConditions: Array<{ email: string } | { id: string }> = [{ email: email }];
    if (isValidObjectId(email)) {
      orConditions.push({ id: email });
    }

    const user = await db.user.findFirst({
      where: {
        OR: orConditions,
      },
    });

    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'Utilisateur non trouvé',
        searchedEmail: email 
      });
    }

    const passwordMatch = user.password === password;

    return NextResponse.json({
      success: passwordMatch,
      error: passwordMatch ? null : 'Mot de passe incorrect',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      inputPassword: password,
      storedPassword: user.password,
      passwordsMatch: passwordMatch,
    });
  } catch (error) {
    console.error('Debug login error:', error);
    return NextResponse.json({ 
      error: 'Error during login test',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
