import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

// GET /api/listings/[id] - Get a single listing by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure params.id exists
    if (!params || !params.id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }
    
    const id = params.id;
    
    // Using any type for prisma until proper setup
    const prismaAny = prisma as any;
    
    // Find the listing with the given ID
    const listing = await prismaAny.listing.findUnique({
      where: { id },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            // Remove phone field if it doesn't exist in User model
            // phone: true,
          },
        },
      },
    });
    
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ listing });
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}

// DELETE /api/listings/[id] - Delete a listing
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure params.id exists
    if (!params || !params.id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }
    
    const id = params.id;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to delete a listing' },
        { status: 401 }
      );
    }
    
    // Using any type for prisma until proper setup
    const prismaAny = prisma as any;
    
    // Find the listing first to check ownership
    const listing = await prismaAny.listing.findUnique({
      where: { id },
      select: { agentId: true }
    });
    
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    // Check if user owns the listing
    if (listing.agentId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this listing' },
        { status: 403 }
      );
    }
    
    // Delete the listing
    await prismaAny.listing.delete({
      where: { id }
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
} 