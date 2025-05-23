import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcrypt';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';

// This endpoint should only be used during development or by existing admins
export async function POST(request: Request) {
  try {
    // Check if in development mode or if the user is an admin
    const isDevelopment = process.env.NODE_ENV === 'development';
    const session = await getServerSession(authOptions);
    
    // Define custom user type that includes role
    interface UserWithRole {
      id: string;
      email: string | null;
      name: string | null;
      password: string | null;
      role: string;
    }
    
    // In production, only allow admin creation by existing admins
    if (!isDevelopment) {
      // Check if user is authenticated
      if (!session || !session.user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      // Check if user is an admin
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
      }) as UserWithRole | null;
      
      if (!currentUser || currentUser.role !== 'admin') {
        return NextResponse.json(
          { error: 'Only administrators can create new admin users' },
          { status: 403 }
        );
      }
    }
    
    const { name, email, password, role = 'admin' } = await request.json();
    
    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user with admin role
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      user: userWithoutPassword,
      message: `User created with ${role} role`
    });
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    );
  }
} 