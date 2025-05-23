import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { formatAmountForStripe } from '@/lib/stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export async function POST(req: Request) {
  try {
    const { amount, currency, plan, billingCycle } = await req.json();

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
      },
    };

    const paymentIntent = await stripe.paymentIntents.create(params);

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