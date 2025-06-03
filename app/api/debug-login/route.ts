import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        emailVerified: true
      }
    });
    
    if (!user || !user.password) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check password
    const passwordValid = await compare(password, user.password);
    if (!passwordValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
    
    // Generate a test token
    const testToken = sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }, 
      process.env.NEXTAUTH_SECRET || 'debug-secret',
      { expiresIn: '1h' }
    );
    
    // Return success with user info (excluding password)
    const { password: _, ...userInfo } = user;
    
    return NextResponse.json({
      success: true,
      user: userInfo,
      testToken: testToken,
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasSecret: !!process.env.NEXTAUTH_SECRET,
        nextAuthUrl: process.env.NEXTAUTH_URL || 'Not set'
      }
    });
  } catch (error) {
    console.error('Debug login error:', error);
    return NextResponse.json({ 
      error: 'Login failed',
      message: (error as Error).message
    }, { status: 500 });
  }
} 