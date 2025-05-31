import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Find the token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: { select: { id: true, email: true } } }
    });

    // Check if token exists and is not expired
    if (!resetToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    if (new Date() > resetToken.expires) {
      // Delete expired token
      await prisma.passwordResetToken.delete({
        where: { token }
      });
      return NextResponse.json({ error: 'Token has expired' }, { status: 400 });
    }

    // Token is valid
    return NextResponse.json({ 
      valid: true, 
      email: resetToken.user.email 
    });
  } catch (error) {
    console.error('Error verifying reset token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 