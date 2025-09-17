import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCachedData, setCachedData, invalidateCache, generateCacheKey } from "@/lib/redis-cache";

// POST /api/leads - Create a new lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, role, address } = body;

    // Basic validation
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Name, email, and phone are required" },
        { status: 400 }
      );
    }

    // Create new lead in database
    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        roles: role,
        address,
        status: "new",
      },
    });

    // Invalidate leads cache after creating new lead
    await invalidateCache("leads:*");
    await invalidateCache("admin-dashboard-stats:*");

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}

// GET /api/leads - Get all leads (with optional filtering)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    
    // Create cache key
    const cacheKey = generateCacheKey("leads", { status: status || "all" });
    
    // Check cache first (5-minute TTL for leads)
    const cached = await getCachedData(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }
    
    // Build query filters
    const where = status ? { status } : {};
    
    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const responseData = { leads };

    // Cache the response for 5 minutes
    await setCachedData(cacheKey, responseData, 300);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error retrieving leads:", error);
    return NextResponse.json(
      { error: "Failed to retrieve leads" },
      { status: 500 }
    );
  }
} 