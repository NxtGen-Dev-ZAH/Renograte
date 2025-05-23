import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';

// Define a custom user type that includes the role
interface UserWithRole {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  password: string | null;
  role: string;
}

// POST /api/listings/[id]/review - Review a listing (approve/reject)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to review listings' },
        { status: 401 }
      );
    }
    
    // User role check - ensure user is an admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    }) as UserWithRole | null;
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can review listings' },
        { status: 403 }
      );
    }
    
    const { id } = params;
    const { status, adminFeedback, isVisible } = await request.json();
    
    // Using any type to bypass TypeScript errors until proper Prisma setup
    const prismaAny = prisma as any;
    
    // Update the listing
    const updatedListing = await prismaAny.listing.update({
      where: { id },
      data: {
        status,
        adminFeedback,
        isVisible: !!isVisible,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `Listing ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      listing: updatedListing
    });
  } catch (error) {
    console.error('Error reviewing listing:', error);
    return NextResponse.json(
      { error: 'Failed to review listing' },
      { status: 500 }
    );
  }
} 