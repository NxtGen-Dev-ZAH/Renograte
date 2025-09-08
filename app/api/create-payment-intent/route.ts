import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { formatAmountForStripe } from '@/lib/stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function POST(req: Request) {
  try {
    const { amount, currency, plan, billingCycle, userId } = await req.json();

    // Create a PaymentIntent with the order amount and currency
    const params: Stripe.PaymentIntentCreateParams = {
      amount: formatAmountForStripe(amount, currency),
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        plan,
        billingCycle,
        ...(userId && { userId }),
      },
    };

    // Generate idempotency key to prevent duplicate charges
    const idempotencyKey = userId 
      ? `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      : `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const paymentIntent = await stripe.paymentIntents.create(params, {
      idempotencyKey,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error('Error creating payment intent:', err);
    return NextResponse.json(
      { error: 'Error creating payment intent' },
      { status: 500 }
    );
  }
} 