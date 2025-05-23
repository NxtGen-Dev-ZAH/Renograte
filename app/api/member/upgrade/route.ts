import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Schema for validating member upgrade data
const upgradeSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  businessType: z.string().min(1, "Business type is required"),
  licenseNumber: z.string().optional(),
  plan: z.string(),
  billingCycle: z.string()
});

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Validate input data
    const result = upgradeSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { userId, name, email, company, phone, businessType, licenseNumber, plan, billingCycle } = body;

    // Extra security check - only allow users to update their own account or admin to update any account
    if (session.user.id !== userId && session.user.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user already has a member role or higher
    if (['member', 'agent', 'contractor', 'admin'].includes(existingUser.role)) {
      return NextResponse.json(
        { error: "User already has member access or higher" },
        { status: 409 }
      );
    }

    // Update user role to member
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,  // Update name if changed
        role: "member" // Upgrade to member role
      }
    });

    // Check if member profile already exists
    const existingProfile = await prisma.memberProfile.findUnique({
      where: { userId }
    });

    let memberProfile;

    if (existingProfile) {
      // Update existing profile
      memberProfile = await prisma.memberProfile.update({
        where: { userId },
        data: {
          company,
          phone,
          businessType,
          licenseNumber,
          plan,
          billingCycle,
          status: "pending" // Will be set to active after payment
        }
      });
    } else {
      // Create new member profile
      memberProfile = await prisma.memberProfile.create({
        data: {
          userId,
          company,
          phone,
          businessType,
          licenseNumber,
          plan,
          billingCycle,
          status: "pending"
        }
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(
      { 
        message: "Member upgrade successful", 
        user: userWithoutPassword,
        memberProfile
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Member upgrade error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 