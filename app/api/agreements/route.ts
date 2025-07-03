import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// This is a simple API endpoint to handle agreement submissions
// In a production environment, you would likely connect to a database
// to store the agreement data

// Define validation schema for agreement data
const agreementSchema = z.object({
  // Common fields
  agreementId: z.string().optional(),
  type: z.enum(["option-contract", "service-provider", "lease-option", "joint-venture"]),
  
  // The rest of the data can be any JSON structure
  // We'll validate specific fields based on the agreement type
  data: z.record(z.any()),
});

// Validate and sanitize agreement data based on type
function validateAgreementData(data: any, type: string) {
  // Common validation for all agreement types
  if (!data) {
    throw new Error("Agreement data is required");
  }
  
  // Type-specific validation could be added here
  switch (type) {
    case "option-contract":
      // Validate option contract specific fields
      if (!data.propertyAddress) {
        throw new Error("Property address is required for option contracts");
      }
      break;
    case "service-provider":
      // Validate service provider specific fields
      if (!data.contractorName) {
        throw new Error("Contractor name is required for service provider agreements");
      }
      break;
    case "lease-option":
      // Validate lease option specific fields
      if (!data.landlordName || !data.tenantName) {
        throw new Error("Landlord and tenant names are required for lease option agreements");
      }
      break;
    case "joint-venture":
      // Validate joint venture specific fields
      if (!data.partner1Name || !data.partner2Name) {
        throw new Error("Partner names are required for joint venture agreements");
      }
      break;
  }
  
  return data;
}

// POST /api/agreements - Create a new agreement
export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to create an agreement" },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    
    // Extract the agreement type and data
    const { type, data } = body;
    
    try {
      // Validate the agreement data using Zod
      const validatedData = agreementSchema.parse({
        type,
        data,
      });
      
      // Additional validation based on agreement type
      validateAgreementData(data, type);
      
      // Generate a unique agreement ID if not provided
      const agreementId = body.agreementId || 
        `${type.substring(0, 2).toUpperCase()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Create the agreement in the database
      const agreement = await prisma.agreement.create({
        data: {
          agreementId,
          type,
          title: getAgreementTitle(type, data),
          status: "PENDING",
          data: data,
          userId: session.user.id,
          createdBy: session.user.name || session.user.email || "Unknown",
        },
      });
      
      // Return success response with the created agreement
      return NextResponse.json({ 
        success: true, 
        message: "Agreement submitted successfully",
        agreement,
      }, { status: 201 });
      
    } catch (validationError: any) {
      console.error("Validation error:", validationError);
      
      // Return validation error response
      return NextResponse.json({ 
        success: false, 
        message: validationError.message || "Invalid agreement data",
        errors: validationError.errors || [],
      }, { status: 400 });
    }
    
  } catch (error: any) {
    console.error("Error processing agreement submission:", error);
    
    // Return error response
    return NextResponse.json({ 
      success: false, 
      message: "Failed to process agreement submission",
      error: error.message,
    }, { status: 500 });
  }
}

// GET /api/agreements - Get agreements for the current user
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to view agreements" },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    
    // Filter parameters
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    
    // Pagination
    const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string, 10) : 10;
    const skip = (page - 1) * limit;
    
    // Build filter conditions
    const where: any = {
      userId: session.user.id
    };
    
    if (type) {
      where.type = type;
    }
    
    if (status) {
      where.status = status;
    }
    
    // Allow admin users to see all agreements
    if (session.user.role === "admin") {
      delete where.userId;
    }
    
    // Count total matching records for pagination
    const total = await prisma.agreement.count({ where });
    const totalPages = Math.ceil(total / limit);
    
    // Get agreements based on filters with pagination
    const agreements = await prisma.agreement.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit,
    });
    
    return NextResponse.json({ 
      agreements,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
    
  } catch (error: any) {
    console.error("Error retrieving agreements:", error);
    
    return NextResponse.json({ 
      success: false, 
      message: "Failed to retrieve agreements",
      error: error.message,
    }, { status: 500 });
  }
}

// Helper function to generate a title for the agreement based on type and data
function getAgreementTitle(type: string, data: any): string {
  switch (type) {
    case "option-contract":
      return `Option Contract - ${data.propertyAddress || "No Address"}`;
    case "service-provider":
      return `Service Provider Agreement - ${data.contractorName || "No Contractor"}`;
    case "lease-option":
      return `Lease Option - ${data.propertyAddress || "No Address"}`;
    case "joint-venture":
      return `Joint Venture - ${data.projectName || data.projectAddress || "No Project"}`;
    default:
      return `Agreement - ${new Date().toLocaleDateString()}`;
  }
} 