import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema for validating campaign data
const campaignSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  assets: z.array(z.object({
    id: z.string(),
    order: z.number().optional(),
  })).optional(),
});

// GET /api/marketing/campaigns
export async function GET(req: NextRequest) {
  try {
    // Verify the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has access to campaigns
    if (!['member', 'agent', 'contractor', 'admin'].includes(session.user.role || '')) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const id = searchParams.get('id');

    // If ID is provided, return a single campaign
    if (id) {
      const campaign = await prisma.campaign.findUnique({
        where: { id },
        include: {
          assets: {
            include: {
              asset: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      });

      if (!campaign) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
      }

      return NextResponse.json(campaign);
    }

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }

    // Get campaigns with their assets
    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        assets: {
          include: {
            asset: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/marketing/campaigns
export async function POST(req: NextRequest) {
  try {
    // Verify the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can create campaigns
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse request body
    const body = await req.json();
    
    // Validate input data
    const validationResult = campaignSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { assets, ...campaignData } = validationResult.data;

    // Create campaign with assets
    const campaign = await prisma.campaign.create({
      data: {
        ...campaignData,
        createdBy: session.user.id,
        assets: assets ? {
          create: assets.map((asset, index) => ({
            assetId: asset.id,
            order: asset.order ?? index,
          })),
        } : undefined,
      },
      include: {
        assets: {
          include: {
            asset: true,
          },
        },
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/marketing/campaigns
export async function PATCH(req: NextRequest) {
  try {
    // Verify the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can update campaigns
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse request body
    const body = await req.json();
    const { id, assets, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Validate input data
    const validationResult = campaignSchema.partial().safeParse({ ...updateData, assets });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Start a transaction to update campaign and assets
    const campaign = await prisma.$transaction(async (tx) => {
      // Update campaign data
      const updatedCampaign = await tx.campaign.update({
        where: { id },
        data: updateData,
      });

      // If assets are provided, update them
      if (assets) {
        // Delete existing assets
        await tx.campaignAsset.deleteMany({
          where: { campaignId: id },
        });

        // Create new assets
        await tx.campaignAsset.createMany({
          data: assets.map((asset: any, index: number) => ({
            campaignId: id,
            assetId: asset.id,
            order: asset.order ?? index,
          })),
        });
      }

      // Return updated campaign with assets
      return tx.campaign.findUnique({
        where: { id },
        include: {
          assets: {
            include: {
              asset: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      });
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/marketing/campaigns
export async function DELETE(req: NextRequest) {
  try {
    // Verify the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can delete campaigns
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get campaign ID from query parameters
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Delete campaign (this will cascade delete campaign assets)
    await prisma.campaign.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 