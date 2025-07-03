import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET a single asset by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await Promise.resolve(params);
    
    const asset = await prisma.marketingAsset.findUnique({
      where: { id },
      include: {
        campaigns: {
          include: {
            campaign: true,
          },
        },
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json(asset);
  } catch (error) {
    console.error("Error fetching asset:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset" },
      { status: 500 }
    );
  }
}

// UPDATE a marketing asset by ID
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
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
        { error: "Only admins can update assets" },
        { status: 403 }
      );
    }

    const { id } = await Promise.resolve(params);
    const data = await req.json();

    // Update the asset
    const updatedAsset = await prisma.marketingAsset.update({
      where: { id },
      data,
      include: {
        campaigns: {
          include: {
            campaign: true,
          },
        },
      },
    });

    return NextResponse.json(updatedAsset);
  } catch (error) {
    console.error("Error updating asset:", error);
    return NextResponse.json(
      { error: "Failed to update asset" },
      { status: 500 }
    );
  }
}

// DELETE a marketing asset by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
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
        { error: "Only admins can delete assets" },
        { status: 403 }
      );
    }

    const { id } = await Promise.resolve(params);

    // Check if the asset is used in any campaigns
    const campaignAssets = await prisma.campaignAsset.findMany({
      where: { assetId: id },
    });

    // Delete campaign asset associations first
    if (campaignAssets.length > 0) {
      await prisma.campaignAsset.deleteMany({
        where: { assetId: id },
      });
    }

    // Delete the asset
    await prisma.marketingAsset.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Asset deleted successfully" });
  } catch (error) {
    console.error("Error deleting asset:", error);
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 }
    );
  }
} 