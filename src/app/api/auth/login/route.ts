import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { loginSchema, isValidObjectId } from '@/lib/validations';
import { comparePassword, hashPassword, setSessionCookie } from '@/lib/auth';

// POST - Login with validation and hashed password comparison
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input with Zod
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Build query - only search by email OR by id if valid ObjectId
    const orConditions: Array<{ email: string } | { id: string }> = [{ email }];
    
    // Only search by ID if the input looks like a valid ObjectId
    if (isValidObjectId(email)) {
      orConditions.push({ id: email });
    }

    const user = await db.user.findFirst({
      where: {
        OR: orConditions,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Identifiant ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Check if password is already hashed (starts with $2a$ or $2b$ for bcrypt)
    const isPasswordHashed = user.password.startsWith('$2');
    
    let passwordMatches = false;
    
    if (isPasswordHashed) {
      // Compare with bcrypt for hashed passwords
      passwordMatches = await comparePassword(password, user.password);
    } else {
      // Legacy: plain text comparison (will be migrated)
      passwordMatches = user.password === password;
      
      // Auto-migrate to hashed password
      if (passwordMatches) {
        try {
          const hashedPassword = await hashPassword(password);
          await db.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
          });
          console.log(`Password migrated for user: ${user.email}`);
        } catch (migrationError) {
          console.error('Failed to migrate password:', migrationError);
        }
      }
    }

    if (!passwordMatches) {
      return NextResponse.json(
        { error: 'Identifiant ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Set session cookie
    await setSessionCookie(user.id);

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}
