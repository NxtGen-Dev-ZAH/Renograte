import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema for validating marketing asset data
const marketingAssetSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  type: z.string().min(1, "Please select a type"),
  category: z.string().min(1, "Please select a category"),
  fileUrl: z.string().min(1, "File URL is required"),
  thumbnail: z.string().optional().nullable(),
});

// GET /api/marketing/assets
export async function GET(req: NextRequest) {
  try {
    // Verify the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has access to marketing assets
    if (!['member', 'agent', 'contractor', 'admin'].includes(session.user.role || '')) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const id = searchParams.get('id');

    // If ID is provided, return a single asset
    if (id) {
      const asset = await prisma.marketingAsset.findUnique({
        where: { id },
      });

      if (!asset) {
        return NextResponse.json({ error: "Asset not found" }, { status: 404 });
      }

      return NextResponse.json(asset);
    }

    // Build where clause
    const where: any = {
      status: status || 'active',
    };

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    // Get marketing assets
    const assets = await prisma.marketingAsset.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(assets);
  } catch (error) {
    console.error('Error fetching marketing assets:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/marketing/assets
export async function POST(req: NextRequest) {
  try {
    // Verify the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can create marketing assets
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse request body
    const body = await req.json();
    
    // Validate input data
    const validationResult = marketingAssetSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Create marketing asset
    const asset = await prisma.marketingAsset.create({
      data: {
        ...validationResult.data,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error('Error creating marketing asset:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/marketing/assets
export async function PATCH(req: NextRequest) {
  try {
    // Verify the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can update marketing assets
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse request body
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Asset ID is required" },
        { status: 400 }
      );
    }

    // Validate input data
    const validationResult = marketingAssetSchema.partial().safeParse(updateData);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Update marketing asset
    const asset = await prisma.marketingAsset.update({
      where: { id },
      data: validationResult.data,
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error updating marketing asset:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/marketing/assets
export async function DELETE(req: NextRequest) {
  try {
    // Verify the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can delete marketing assets
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get asset ID from query parameters
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "Asset ID is required" },
        { status: 400 }
      );
    }

    // Delete marketing asset
    await prisma.marketingAsset.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting marketing asset:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 