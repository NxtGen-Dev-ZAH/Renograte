import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/offers - Create a new offer
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    
    // Create the offer in the database
    const offer = await prisma.offer.create({
      data: {
        ...data,
        userId: session.user.id,
        status: "PENDING", // Default status
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      message: "Offer submitted successfully",
      offer 
    });
    
  } catch (error) {
    console.error("Error creating offer:", error);
    return NextResponse.json(
      { error: "Failed to create offer" },
      { status: 500 }
    );
  }
}

// GET /api/offers - Get all offers (with optional filtering)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");
    
    // Build query filters
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    // If user is not admin, only show their own offers
    if (session.user.role !== "ADMIN") {
      where.userId = session.user.id;
    } 
    // If admin is requesting specific user's offers
    else if (userId) {
      where.userId = userId;
    }
    
    const offers = await prisma.offer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json({ offers });
  } catch (error) {
    console.error("Error retrieving offers:", error);
    return NextResponse.json(
      { error: "Failed to retrieve offers" },
      { status: 500 }
    );
  }
} 