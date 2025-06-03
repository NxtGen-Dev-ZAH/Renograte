import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Try to count users to test database connectivity
    const userCount = await prisma.user.count();
    
    // Check if there are any admin users
    const adminCount = await prisma.user.count({
      where: {
        role: 'admin'
      }
    });
    
    return NextResponse.json({
      dbConnected: true,
      userCount,
      hasAdminUsers: adminCount > 0,
      adminCount
    });
  } catch (error) {
    return NextResponse.json({
      dbConnected: false,
      error: 'Database connection failed',
      message: (error as Error).message
    }, { status: 500 });
  }
} 