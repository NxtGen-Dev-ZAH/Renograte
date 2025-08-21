import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema for validating update role data
const updateRoleSchema = z.object({
  userId: z.string(),
  newRole: z.string(),
  planType: z.string().optional(),
  billingCycle: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    // Verify the user is authenticated (but make an exception for payment processing)
    const session = await getServerSession(authOptions);
    
    // We'll still allow requests with valid user IDs for payment processing
    // so we don't require authentication here
    
    // Parse request body
    const body = await req.json();
    
    // Validate input data
    const validationResult = updateRoleSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    
    const { userId, newRole, planType, billingCycle } = validationResult.data;
    
    // For payment processing, we'll allow the request if it has a valid user ID
    // but we'll still check session if it exists
    if (
      session?.user && 
      session.user.id !== userId && 
      session.user.role !== 'admin'
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { memberProfile: true }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Determine the appropriate role based on the plan type
    let role = newRole;
    if (planType && planType.toLowerCase().includes('agent')) {
      role = 'agent';
    } else if (planType && planType.toLowerCase().includes('service provider') || planType?.toLowerCase().includes('contractor')) {
      role = 'contractor';
    }
    
    // Transaction to update both user and member profile
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update user role in database
      const user = await tx.user.update({
        where: { id: userId },
        data: { role: role },
      });
      
      // Ensure member profile is updated or created
      if (existingUser.memberProfile) {
        // Update existing profile
        await tx.memberProfile.update({
          where: { userId },
          data: {
            status: "active",
            ...(planType && { plan: planType }),
            ...(billingCycle && { billingCycle })
          }
        });
      } else if (planType && billingCycle) {
        // Create new profile if it doesn't exist
        await tx.memberProfile.create({
          data: {
            userId,
            plan: planType,
            billingCycle,
            status: "active",
            // Set default values for required fields
            phone: "",
            businessType: "Other"
          }
        });
      }
      
      return user;
    });
    
    // Return success response without sensitive data
    return NextResponse.json({ 
      success: true, 
      message: "User role updated successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      }
    });
    
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 