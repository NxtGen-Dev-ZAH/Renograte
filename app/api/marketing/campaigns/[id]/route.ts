import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET a single campaign by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: campaignId } = await params;
    
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        assets: {
          include: {
            asset: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign" },
      { status: 500 }
    );
  }
}

// UPDATE a campaign by ID
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (user?.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can update campaigns" },
        { status: 403 }
      );
    }

    const { id: campaignId } = await params;
    const data = await req.json();
    
    console.log("Received campaign data:", JSON.stringify(data, null, 2));

    // Validate the data
    if (data.status && !["draft", "active", "archived"].includes(data.status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Handle asset associations
    let assetConnections;
    if (data.assets && Array.isArray(data.assets)) {
      // Delete existing connections first
      await prisma.campaignAsset.deleteMany({
        where: { campaignId },
      });

      // Create new connections
      assetConnections = {
        create: data.assets.map((asset: { id: string; order: number }) => ({
          asset: { connect: { id: asset.id } },
          order: asset.order,
        })),
      };

      // Remove assets from data to avoid prisma errors
      delete data.assets;
    }

    // Update the campaign
    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        ...data,
        ...(assetConnections && { assets: assetConnections }),
      },
      include: {
        assets: {
          include: {
            asset: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCampaign);
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}

// DELETE a campaign by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (user?.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can delete campaigns" },
        { status: 403 }
      );
    }

    const { id: campaignId } = await params;

    // Delete campaign assets associations first
    await prisma.campaignAsset.deleteMany({
      where: { campaignId },
    });

    // Delete the campaign
    await prisma.campaign.delete({
      where: { id: campaignId },
    });

    return NextResponse.json({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
} 