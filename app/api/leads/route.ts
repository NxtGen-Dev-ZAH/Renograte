import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    
    // Build query filters
    const where = status ? { status } : {};
    
    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error("Error retrieving leads:", error);
    return NextResponse.json(
      { error: "Failed to retrieve leads" },
      { status: 500 }
    );
  }
} 