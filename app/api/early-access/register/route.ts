import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";
import { z } from "zod";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

// Schema for validating early access registration data
const earlyAccessSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  company: z.string().optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  businessType: z.string().min(1, "Business type is required"),
  licenseNumber: z.string().optional(),
  role: z.enum(['agent', 'contractor'], {
    errorMap: () => ({ message: "Role must be either 'agent' or 'contractor'" })
  })
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input data
    const result = earlyAccessSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, company, phone, businessType, licenseNumber, role } = result.data;

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

    // Check quota availability
    const quota = await prisma.earlyAccessQuota.findUnique({
      where: { role }
    });

    if (!quota || quota.currentCount >= quota.maxCount) {
      return NextResponse.json(
        { error: `All ${role} early access spots are filled` },
        { status: 403 }
      );
    }

    // Hash the user-provided password
    const hashedPassword = await hash(password, 12);

    // Create user with basic role (will be updated upon approval)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'user', // Start with basic user role, will be updated to agent/contractor upon approval
      }
    });

    // Create Stripe customer for early access (free subscription)
    const customer = await stripe.customers.create({
      name,
      email,
      phone,
      metadata: {
        userId: user.id,
        company: company || '',
        role,
        licenseNumber: licenseNumber || '',
        businessType,
        isEarlyAccess: 'true'
      }
    });

    // Create early access subscription (free with 1-year trial)
    const earlyAccessPriceId = role === 'agent' 
      ? process.env.STRIPE_EARLY_ACCESS_AGENT_PRICE_ID
      : process.env.STRIPE_EARLY_ACCESS_CONTRACTOR_PRICE_ID;

    if (!earlyAccessPriceId) {
      throw new Error(`Early access price ID not configured for ${role}. Please run the create-early-access-products script first.`);
    }

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: earlyAccessPriceId }],
      trial_period_days: 365, // 1 year free trial
      metadata: {
        userId: user.id,
        role,
        isEarlyAccess: 'true'
      }
    });

    // Create member profile with early access flag
    const memberProfile = await prisma.memberProfile.create({
      data: {
        userId: user.id,
        company,
        phone,
        businessType,
        licenseNumber,
        plan: `Early Access ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        billingCycle: 'yearly',
        status: 'pending', // Pending admin verification
        isEarlyAccess: true,
        stripeCustomerId: customer.id,
        stripeSubscriptionId: subscription.id,
        trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      }
    });

    // Note: Quota count will be incremented only upon admin approval
    // This ensures the counter reflects only approved users

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: `Early access application submitted successfully! Your application is now pending admin approval. You'll receive an email notification once approved.`,
      status: 'pending',
      user: userWithoutPassword,
      memberProfile: {
        ...memberProfile
      },
      quota: {
        role,
        currentCount: quota.currentCount, // No increment until approval
        maxCount: quota.maxCount,
        remaining: quota.maxCount - quota.currentCount
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Early access registration error:", error);
    
    // Handle Stripe errors
    if (error instanceof Error && error.message.includes('Stripe')) {
      return NextResponse.json(
        { error: "Payment processing error. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
