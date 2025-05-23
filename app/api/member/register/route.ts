import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { hash } from "bcrypt";

// Schema for validating member registration data
const memberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  businessType: z.string().min(1, "Business type is required"),
  licenseNumber: z.string().optional(),
  plan: z.string(),
  billingCycle: z.string()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input data
    const result = memberSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, company, phone, businessType, licenseNumber, plan, billingCycle } = body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hash(tempPassword, 12);

    // Create user with member role
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "member",
        // Add additional fields as needed
      }
    });

    // Create member profile
    const memberProfile = await prisma.memberProfile.create({
      data: {
        userId: user.id,
        company,
        phone,
        businessType,
        licenseNumber,
        plan,
        billingCycle,
        status: "pending" // pending, active, inactive
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        message: "Member registration successful", 
        user: userWithoutPassword,
        memberProfile,
        tempPassword // In production, this should be sent via email
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Member registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 