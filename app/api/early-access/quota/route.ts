import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get current quota status for both roles
    const quotas = await prisma.earlyAccessQuota.findMany({
      where: { isActive: true },
      orderBy: { role: 'asc' }
    });

    // Calculate availability
    const quotaStatus = quotas.map(quota => ({
      role: quota.role,
      currentCount: quota.currentCount,
      maxCount: quota.maxCount,
      available: quota.maxCount - quota.currentCount,
      isAvailable: quota.currentCount < quota.maxCount,
      percentage: Math.round((quota.currentCount / quota.maxCount) * 100)
    }));

    return NextResponse.json({
      quotas: quotaStatus,
      totalAvailable: quotaStatus.reduce((sum, q) => sum + q.available, 0),
      isEarlyAccessActive: quotaStatus.some(q => q.isAvailable)
    });

  } catch (error) {
    console.error("Error fetching quota status:", error);
    return NextResponse.json(
      { error: "Failed to fetch quota status" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { role } = await request.json();

    if (!role || !['agent', 'contractor'].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'agent' or 'contractor'" },
        { status: 400 }
      );
    }

    // Check if quota is available
    const quota = await prisma.earlyAccessQuota.findUnique({
      where: { role }
    });

    if (!quota) {
      return NextResponse.json(
        { error: "Quota not found for role" },
        { status: 404 }
      );
    }

    if (quota.currentCount >= quota.maxCount) {
      return NextResponse.json({
        available: false,
        message: `All ${role} early access spots are filled`,
        currentCount: quota.currentCount,
        maxCount: quota.maxCount
      });
    }

    // Increment the count
    const updatedQuota = await prisma.earlyAccessQuota.update({
      where: { role },
      data: {
        currentCount: quota.currentCount + 1
      }
    });

    return NextResponse.json({
      available: true,
      message: `Early access spot claimed for ${role}`,
      currentCount: updatedQuota.currentCount,
      maxCount: updatedQuota.maxCount,
      remaining: updatedQuota.maxCount - updatedQuota.currentCount
    });

  } catch (error) {
    console.error("Error claiming early access spot:", error);
    return NextResponse.json(
      { error: "Failed to claim early access spot" },
      { status: 500 }
    );
  }
}

