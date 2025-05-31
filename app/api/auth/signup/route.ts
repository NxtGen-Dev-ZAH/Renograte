import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { generateVerificationToken, sendVerificationEmail } from "@/utils/email";

// Schema for validating registration data
const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input data
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = body;

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

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: null // Ensure email is not verified by default
      }
    });

    // Generate and send verification email
    const verificationToken = await generateVerificationToken(email);
    const emailSent = await sendVerificationEmail(email, name, verificationToken);

    if (!emailSent) {
      // If email fails to send, still create the user but return a warning
      return NextResponse.json(
        {
          message: "User created successfully, but verification email failed to send. Please contact support.",
          user: { name: user.name, email: user.email },
          redirect: "/verify-email-notice"
        },
        { status: 201 }
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: "User created successfully. Please check your email to verify your account.",
        user: userWithoutPassword,
        redirect: "/verify-email-notice"
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    
    // Improved error handling with more specific messages
    let errorMessage = "Internal server error";
    let statusCode = 500;

    if (error.code === 'P2002') {
      errorMessage = "Email already exists";
      statusCode = 409;
    } else if (error.code === 'P2003') {
      errorMessage = "Database connection error";
      statusCode = 503;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
} 