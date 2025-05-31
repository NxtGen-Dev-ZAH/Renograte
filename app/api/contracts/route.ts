import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";

// GET /api/contracts - Get all contracts
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Using type assertion to avoid TypeScript errors
    const prismaAny = prisma as any;
    
    const contracts = await prismaAny.contract.findMany({
      include: {
        sections: {
          include: {
            signature: true,
          },
        },
        signatures: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(contracts);
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contracts" },
      { status: 500 }
    );
  }
}

// POST /api/contracts - Create a new contract
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { title, description, documentUrl, sections } = body;
    
    if (!title || !documentUrl || !sections || !Array.isArray(sections)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Using type assertion to avoid TypeScript errors
    const prismaAny = prisma as any;
    
    // Create contract with sections
    const contract = await prismaAny.contract.create({
      data: {
        title,
        description,
        documentUrl,
        createdBy: session.user.id || "unknown",
        sections: {
          create: sections.map(section => ({
            title: section.title,
            description: section.description,
            pageNumber: section.pageNumber,
            role: section.role,
            required: section.required,
          })),
        },
      },
      include: {
        sections: true,
      },
    });
    
    return NextResponse.json(contract);
  } catch (error) {
    console.error("Error creating contract:", error);
    return NextResponse.json(
      { error: "Failed to create contract" },
      { status: 500 }
    );
  }
} 