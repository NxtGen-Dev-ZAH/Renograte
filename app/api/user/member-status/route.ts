import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get member profile for the user
    const memberProfile = await prisma.memberProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        status: true,
        isEarlyAccess: true,
        adminFeedback: true
      }
    });

    if (!memberProfile) {
      // User doesn't have a member profile, so they're not an early access user
      return NextResponse.json({
        status: null,
        isEarlyAccess: false,
        adminFeedback: null
      });
    }

    return NextResponse.json({
      status: memberProfile.status,
      isEarlyAccess: memberProfile.isEarlyAccess,
      adminFeedback: memberProfile.adminFeedback
    });

  } catch (error) {
    console.error("Error fetching member status:", error);
    return NextResponse.json(
      { error: "Failed to fetch member status" },
      { status: 500 }
    );
  }
}
