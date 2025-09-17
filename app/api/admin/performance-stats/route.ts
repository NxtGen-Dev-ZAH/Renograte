import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getPerformanceStats } from '@/lib/performance-monitor';
import { checkCacheHealth } from '@/lib/redis-cache';

// GET /api/admin/performance-stats - Get performance monitoring data
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

    // Get performance stats and cache health
    const [performanceStats, cacheHealth] = await Promise.all([
      getPerformanceStats(),
      checkCacheHealth()
    ]);

    const responseData = {
      performance: performanceStats,
      cache: cacheHealth,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching performance stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch performance statistics" },
      { status: 500 }
    );
  }
}

