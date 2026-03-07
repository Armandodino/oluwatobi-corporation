import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

// Check if string is a valid MongoDB ObjectId
function isValidObjectId(str: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(str);
}

// POST - Login
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Build query - only search by email OR by id if valid ObjectId
    const orConditions: Array<{ email: string } | { id: string }> = [{ email: data.email }];
    
    // Only search by ID if the input looks like a valid ObjectId
    if (isValidObjectId(data.email)) {
      orConditions.push({ id: data.email });
    }

    const user = await db.user.findFirst({
      where: {
        OR: orConditions,
      },
    });

    if (!user || user.password !== data.password) {
      return NextResponse.json({ error: 'Identifiant ou mot de passe incorrect' }, { status: 401 });
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json({ error: 'Erreur lors de la connexion' }, { status: 500 });
  }
}
