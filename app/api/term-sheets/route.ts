import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/term-sheets - Create a new term sheet
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
    
    // Create the term sheet in the database
    const termSheet = await prisma.termSheet.create({
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
      message: "Term sheet created successfully",
      termSheet 
    });
    
  } catch (error) {
    console.error("Error creating term sheet:", error);
    return NextResponse.json(
      { error: "Failed to create term sheet" },
      { status: 500 }
    );
  }
}

// GET /api/term-sheets - Get all term sheets (with optional filtering)
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
    
    // If user is not admin, only show their own term sheets
    if (session.user.role !== "ADMIN") {
      where.userId = session.user.id;
    } 
    // If admin is requesting specific user's term sheets
    else if (userId) {
      where.userId = userId;
    }
    
    const termSheets = await prisma.termSheet.findMany({
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

    return NextResponse.json({ termSheets });
  } catch (error) {
    console.error("Error retrieving term sheets:", error);
    return NextResponse.json(
      { error: "Failed to retrieve term sheets" },
      { status: 500 }
    );
  }
} 