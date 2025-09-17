import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCachedData, setCachedData, invalidateCache, generateCacheKey } from "@/lib/redis-cache";
import Stripe from "stripe";

// Initialize Stripe with proper error handling
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function GET() {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    console.log(`🔍 Admin ${session.user.id} fetching early access users`);

    // Create cache key
    const cacheKey = generateCacheKey("early-access", { userId: session.user.id });
    
    // Check cache first (3-minute TTL for early access data)
    const cached = await getCachedData(cacheKey);
    if (cached) {
      console.log(`✅ Early access data served from cache`);
      return NextResponse.json(cached);
    }

    // Get all early access users with pending status only
    // Rejected users will disappear from the admin dashboard
    const earlyAccessUsers = await prisma.memberProfile.findMany({
      where: {
        isEarlyAccess: true,
        status: "pending" // Only show pending applications
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Found ${earlyAccessUsers.length} pending early access users`);

    // Get quota status
    const quotas = await prisma.earlyAccessQuota.findMany({
      where: { isActive: true },
      orderBy: { role: 'asc' }
    });

    const responseData = {
      users: earlyAccessUsers,
      quotas: quotas.map(quota => ({
        role: quota.role,
        currentCount: quota.currentCount,
        maxCount: quota.maxCount,
        available: quota.maxCount - quota.currentCount,
        percentage: Math.round((quota.currentCount / quota.maxCount) * 100)
      }))
    };

    // Cache the response for 3 minutes
    await setCachedData(cacheKey, responseData, 180);

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("❌ Error fetching early access users:", error);
    return NextResponse.json(
      { error: "Failed to fetch early access users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const { userId, action, feedback } = await request.json();

    // Enhanced input validation
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: "Invalid userId - must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action - must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    if (feedback && typeof feedback !== 'string') {
      return NextResponse.json(
        { error: "Invalid feedback - must be a string" },
        { status: 400 }
      );
    }

    console.log(`🔍 Admin ${session.user.id} ${action}ing user ${userId}`);

    const memberProfile = await prisma.memberProfile.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!memberProfile) {
      console.error(`❌ Member profile not found for userId: ${userId}`);
      return NextResponse.json(
        { error: "Member profile not found" },
        { status: 404 }
      );
    }

    if (!memberProfile.isEarlyAccess) {
      return NextResponse.json(
        { error: "User is not an early access member" },
        { status: 400 }
      );
    }

    if (memberProfile.status !== 'pending') {
      return NextResponse.json(
        { error: `User status is already ${memberProfile.status}` },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // Determine role from the plan name
      let targetRole = 'agent'; // default
      if (memberProfile.plan?.toLowerCase().includes('contractor')) {
        targetRole = 'contractor';
      } else if (memberProfile.plan?.toLowerCase().includes('agent')) {
        targetRole = 'agent';
      }

      // Use transaction to ensure data consistency
      await prisma.$transaction(async (tx) => {
        // Increment quota count for the approved role
        await tx.earlyAccessQuota.update({
          where: { role: targetRole },
          data: {
            currentCount: {
              increment: 1
            }
          }
        });

        // Update member profile
        await tx.memberProfile.update({
          where: { userId },
          data: {
            status: "active",
            adminFeedback: feedback || "Application approved by admin"
          }
        });

        // Update user role to the appropriate role (agent or contractor)
        await tx.user.update({
          where: { id: userId },
          data: { role: targetRole }
        });
      });

      console.log(`✅ User ${userId} approved by admin ${session.user.id} - role updated to ${targetRole}, quota incremented`);
      
      // Invalidate caches after approval
      await invalidateCache("early-access:*");
      await invalidateCache("admin-dashboard-stats:*");
      
      return NextResponse.json({
        message: "User approved successfully and access granted",
        status: "approved"
      });

    } else if (action === 'reject') {
      // Reject the user and clean up their account
      // Determine the original role from the plan name (not user's current role)
      let originalRole = 'agent'; // default
      if (memberProfile.plan?.toLowerCase().includes('contractor')) {
        originalRole = 'contractor';
      } else if (memberProfile.plan?.toLowerCase().includes('agent')) {
        originalRole = 'agent';
      }
      
      // Use transaction to ensure data consistency
      await prisma.$transaction(async (tx) => {
        // Decrement quota count for the original role
        // First check if the quota record exists
        const quotaRecord = await tx.earlyAccessQuota.findUnique({
          where: { role: originalRole }
        });
        
        if (quotaRecord && quotaRecord.currentCount > 0) {
          await tx.earlyAccessQuota.update({
            where: { role: originalRole },
            data: {
              currentCount: {
                decrement: 1
              }
            }
          });
        } else {
          console.warn(`⚠️ Quota record not found or already at 0 for role: ${originalRole}`);
        }

        // Update member profile with rejection status and feedback
        await tx.memberProfile.update({
          where: { userId },
          data: {
            status: "rejected",
            adminFeedback: feedback || "Application rejected by admin"
          }
        });

        // Reset user role to 'user' to remove dashboard access
        await tx.user.update({
          where: { id: userId },
          data: { 
            role: 'user' // Reset to basic user role
          }
        });
      });

      // Cancel Stripe subscription if exists
      if (memberProfile.stripeSubscriptionId) {
        try {
          await stripe.subscriptions.cancel(memberProfile.stripeSubscriptionId);
          console.log(`✅ Stripe subscription ${memberProfile.stripeSubscriptionId} canceled`);
        } catch (error) {
          console.error(`❌ Error canceling Stripe subscription ${memberProfile.stripeSubscriptionId}:`, error);
          // Don't fail the entire operation if Stripe cancellation fails
        }
      }

      console.log(`✅ User ${userId} rejected by admin ${session.user.id} - role reset to 'user', quota decremented for ${originalRole}`);
      
      // Invalidate caches after rejection
      await invalidateCache("early-access:*");
      await invalidateCache("admin-dashboard-stats:*");
      
      return NextResponse.json({
        message: "User rejected successfully and access revoked",
        status: "rejected"
      });
    }

  } catch (error) {
    console.error("❌ Error processing admin action:", error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: "User already processed" },
          { status: 409 }
        );
      }
      if (error.message.includes('Record to update not found')) {
        return NextResponse.json(
          { error: "User or quota not found" },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Failed to process admin action" },
      { status: 500 }
    );
  }
}

