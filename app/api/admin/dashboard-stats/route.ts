import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCachedData, setCachedData, generateCacheKey } from '@/lib/redis-cache';

// GET /api/admin/dashboard-stats - Get consolidated dashboard statistics
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

    // Create cache key for admin dashboard stats
    const cacheKey = generateCacheKey('admin-dashboard-stats', { 
      userId: session.user.id 
    });
    
    // Check cache first (2-minute TTL for dashboard stats)
    const cached = await getCachedData(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Fetch all stats in parallel for maximum performance
    const [
      leadsCount,
      listingCounts,
      earlyAccessStats,
      marketingStats
    ] = await Promise.all([
      // Get total leads count
      prisma.lead.count(),
      
      // Get listing counts by status
      prisma.listing.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      
      // Get early access stats
      Promise.all([
        prisma.memberProfile.count({
          where: { isEarlyAccess: true, status: "pending" }
        }),
        prisma.earlyAccessQuota.findMany({
          where: { isActive: true },
          orderBy: { role: 'asc' }
        })
      ]),
      
      // Get marketing stats
      Promise.all([
        prisma.campaign.count(),
        prisma.marketingAsset.count()
      ])
    ]);

    // Process listing counts into a more usable format
    const listingCountsFormatted = {
      pending: listingCounts.find(l => l.status === 'pending')?._count.status || 0,
      approved: listingCounts.find(l => l.status === 'approved')?._count.status || 0,
      rejected: listingCounts.find(l => l.status === 'rejected')?._count.status || 0,
    };

    // Process early access stats
    const [pendingEarlyAccess, quotas] = earlyAccessStats;
    const quotaStats = quotas.map(quota => ({
      role: quota.role,
      currentCount: quota.currentCount,
      maxCount: quota.maxCount,
      available: quota.maxCount - quota.currentCount,
      percentage: Math.round((quota.currentCount / quota.maxCount) * 100)
    }));

    // Process marketing stats
    const [campaignCount, assetCount] = marketingStats;

    const responseData = {
      leads: {
        total: leadsCount
      },
      listings: listingCountsFormatted,
      earlyAccess: {
        pending: pendingEarlyAccess,
        quotas: quotaStats
      },
      marketing: {
        campaigns: campaignCount,
        assets: assetCount
      },
      timestamp: new Date().toISOString()
    };

    // Cache the response for 2 minutes
    await setCachedData(cacheKey, responseData, 120);
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
