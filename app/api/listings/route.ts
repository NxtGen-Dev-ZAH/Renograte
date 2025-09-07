import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { sendNewListingNotificationEmail } from '../../../utils/email';

// POST /api/listings - Create a new listing
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to create a listing' },
        { status: 401 }
      );
    }
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    
    if (!user || user.role !== 'agent') {
      return NextResponse.json(
        { error: 'Only agents can create listings' },
        { status: 403 }
      );
    }

    
    // Parse the request body
    const data = await request.json();
    
    // Using any type to bypass TypeScript errors until proper Prisma setup
    const prismaAny = prisma as any;
    
    // Create the listing
    const newListing = await prismaAny.listing.create({
      data: {
        ...data,
        agentId: session.user.id,
        status: 'pending', // Start with pending status
        isVisible: false,  // Not visible until approved
      },
    });

    // Send email notification to admin about the new listing
    try {
      const emailSent = await sendNewListingNotificationEmail(
        {
          id: newListing.id,
          title: newListing.title,
          address: newListing.address,
          city: newListing.city,
          state: newListing.state,
          zipCode: newListing.zipCode,
          listingPrice: newListing.listingPrice,
          bedrooms: newListing.bedrooms,
          bathrooms: newListing.bathrooms,
          squareFootage: newListing.squareFootage,
          propertyType: newListing.propertyType,
          description: newListing.description,
          createdAt: newListing.createdAt.toISOString(),
        },
        user.name || 'Unknown Agent'
      );

      if (emailSent) {
        console.log(`✅ Admin notification email sent for listing: ${newListing.title}`);
      } else {
        console.warn(`⚠️ Failed to send admin notification email for listing: ${newListing.title}`);
      }
    } catch (emailError) {
      // Don't fail the listing creation if email fails
      console.error('Error sending admin notification email:', emailError);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Listing created successfully and sent for review',
      listing: newListing 
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}

// GET /api/listings - Get all listings (with filters and search)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filter parameters
    const status = searchParams.get('status');
    const isVisible = searchParams.get('isVisible');
    const agentId = searchParams.get('agentId');
    const propertyType = searchParams.get('propertyType');
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const bedrooms = searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined;
    const bathrooms = searchParams.get('bathrooms') ? Number(searchParams.get('bathrooms')) : undefined;
    const search = searchParams.get('search');
    
    // Pagination
    const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string, 10) : 9;
    const skip = (page - 1) * limit;
    
    // Sorting
    const sortBy = searchParams.get('sortBy') || 'newest';
    let orderBy: any = { createdAt: 'desc' }; // default to newest first
    
    if (sortBy === 'priceAsc') {
      orderBy = { listingPrice: 'asc' };
    } else if (sortBy === 'priceDesc') {
      orderBy = { listingPrice: 'desc' };
    }
    
    // Build filter conditions
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (isVisible !== null) {
      where.isVisible = isVisible === 'true';
    }
    
    if (agentId) {
      where.agentId = agentId;
    }
    
    if (propertyType) {
      where.propertyType = propertyType;
    }
    
    if (minPrice !== undefined) {
      where.listingPrice = {
        ...where.listingPrice,
        gte: minPrice
      };
    }
    
    if (maxPrice !== undefined) {
      where.listingPrice = {
        ...where.listingPrice,
        lte: maxPrice
      };
    }
    
    if (bedrooms !== undefined) {
      where.bedrooms = {
        gte: bedrooms
      };
    }
    
    if (bathrooms !== undefined) {
      where.bathrooms = {
        gte: bathrooms
      };
    }
    
    // Search term handling
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
        { zipCode: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Using any type to bypass TypeScript errors until proper Prisma setup
    const prismaAny = prisma as any;
    
    // Count total matching records for pagination
    const total = await prismaAny.listing.count({ where });
    const totalPages = Math.ceil(total / limit);
    
    // Get listings based on filters with pagination
    const listings = await prismaAny.listing.findMany({
      where,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });
    
    return NextResponse.json({ 
      listings,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
} 