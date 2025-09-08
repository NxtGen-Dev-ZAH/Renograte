import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { formatAmountForStripe } from '@/lib/stripe';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function POST(req: Request) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to create a subscription' },
        { status: 401 }
      );
    }

    const { 
      name,
      email,
      company,
      phone,
      role,
      licenseNumber,
      businessType,
      plan,
      billingCycle,
      paymentMethodId
    } = await req.json();

    // Input validation
    if (!name || !email || !plan || !billingCycle) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, plan, or billingCycle' },
        { status: 400 }
      );
    }

    // Try to find an existing customer by email
    let customer;
    const existingCustomers = await stripe.customers.list({ email, limit: 1 });
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      // Update existing customer with userId if not present
      if (!customer.metadata?.userId) {
        customer = await stripe.customers.update(customer.id, {
          metadata: {
            ...customer.metadata,
            userId: session.user.id,
            company,
            role,
            licenseNumber,
            businessType
          }
        });
      }
    } else {
      // Create a new customer if not found
      customer = await stripe.customers.create({
        name,
        email,
        phone,
        metadata: {
          userId: session.user.id,  // 👈 critical - add userId to metadata
          company,
          role,
          licenseNumber,
          businessType
        }
      });
    }

    // Get the price ID based on the plan and billing cycle
    const priceId = await getPriceId(plan, billingCycle);
    if (!priceId) {
      throw new Error('Invalid plan or billing cycle');
    }

    // Generate idempotency key to prevent duplicate subscriptions
    const subscriptionIdempotencyKey = `sub-${session.user.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: session.user.id,  // 👈 critical - add userId to subscription metadata
        plan,
        billingCycle
      }
    }, {
      idempotencyKey: subscriptionIdempotencyKey,
    });

    // Get the payment intent from the subscription
    const paymentIntent = (subscription.latest_invoice as any).payment_intent;

    // Generate idempotency key for payment intent update
    const paymentIntentIdempotencyKey = `pi-update-${session.user.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Update the payment intent with the subscription ID and userId
    await stripe.paymentIntents.update(paymentIntent.id, {
      metadata: {
        userId: session.user.id,  // 👈 critical - add userId to payment intent metadata
        subscriptionId: subscription.id,
        plan,
        billingCycle
      }
    }, {
      idempotencyKey: paymentIntentIdempotencyKey,
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error('Error creating subscription:', err);
    return NextResponse.json(
      { error: 'Error creating subscription' },
      { status: 500 }
    );
  }
}

async function getPriceId(plan: string, billingCycle: string): Promise<string | null> {
  // Define your price IDs in Stripe and map them here
  const priceMap: Record<string, Record<string, string>> = {
    'Agents Monthly': {
      'monthly': process.env.STRIPE_AGENTS_MONTHLY_PRICE_ID!,
      'annual': process.env.STRIPE_AGENTS_ANNUAL_PRICE_ID!
    },
    'Service Providers (Contractors) monthly membership': {
      'monthly': process.env.STRIPE_CONTRACTORS_MONTHLY_PRICE_ID!,
      'annual': process.env.STRIPE_CONTRACTORS_ANNUAL_PRICE_ID!
    }
  };

  return priceMap[plan]?.[billingCycle] || null;
} 