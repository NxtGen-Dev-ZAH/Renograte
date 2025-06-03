import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const token = await getToken({ 
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET
    });
    
    if (!token || !token.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get user from database with all fields we need to check
    const user = await prisma.user.findUnique({
      where: { id: token.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      user: {
        ...user,
        // Convert Date to string for JSON serialization
        emailVerified: user.emailVerified ? user.emailVerified.toISOString() : null
      },
      token: {
        id: token.id,
        email: token.email,
        name: token.name,
        role: token.role,
        emailVerified: token.emailVerified
      },
      middleware: {
        shouldAllowAdmin: user.role === 'admin',
        shouldRedirectToVerification: !user.emailVerified && user.role === 'admin'
      }
    });
  } catch (error) {
    console.error('Debug user error:', error);
    return NextResponse.json({ 
      error: 'Failed to get user info',
      message: (error as Error).message
    }, { status: 500 });
  }
} 