import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Custom user type with role
interface UserWithRole {
  id: string;
  role: string;
}

export async function GET() {
  try {
    // Get session from server
    const session = await getServerSession(authOptions);
    
    // If no session, return unauthorized
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // Check if user has admin role in the database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    }) as UserWithRole | null;
    
    // If user is not an admin, return forbidden
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }
    
    // If user is an admin, return success
    return NextResponse.json(
      { isAdmin: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 