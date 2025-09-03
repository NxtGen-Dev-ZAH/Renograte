import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateVerificationToken, sendVerificationEmail } from "@/utils/email";
import { z } from "zod";

// Schema for validating resend verification request
const resendSchema = z.object({
  email: z.string().email("Invalid email address")
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input data
    const result = resendSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const { email } = body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }

    // Generate and send new verification email
    const verificationToken = await generateVerificationToken(email);
    const emailSent = await sendVerificationEmail(email, user.name, verificationToken);

    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Verification email sent successfully. Please check your email.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Resend verification error:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
