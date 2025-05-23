import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema for validating update role data
const updateRoleSchema = z.object({
  userId: z.string().uuid(),
  newRole: z.string(),
  planType: z.string().optional(),
  billingCycle: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    // Verify the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
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
    
    // Extra security check - only allow members, admins, or the user themselves to update roles
    if (
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
    
    // Transaction to update both user and member profile
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update user role in database
      const user = await tx.user.update({
        where: { id: userId },
        data: { role: newRole },
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