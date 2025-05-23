import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export async function POST(req: Request) {
  try {
    const { payment_intent, payment_intent_client_secret } = await req.json();

    if (!payment_intent || !payment_intent_client_secret) {
      return NextResponse.json(
        { error: 'Missing payment information' },
        { status: 400 }
      );
    }

    // Retrieve the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent);

    // Verify the client secret matches
    if (paymentIntent.client_secret !== payment_intent_client_secret) {
      return NextResponse.json(
        { error: 'Invalid payment information' },
        { status: 400 }
      );
    }

    // Check if the payment was successful
    if (paymentIntent.status === 'succeeded') {
      // If we have a subscription ID, check its status
      if (paymentIntent.metadata?.subscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(
            paymentIntent.metadata.subscriptionId
          );

          return NextResponse.json({
            status: subscription.status === 'active' ? 'succeeded' : 'failed',
            subscription: {
              id: subscription.id,
              status: subscription.status,
            },
          });
        } catch (err) {
          console.error('Error retrieving subscription:', err);
          // If we can't get the subscription, but payment succeeded, return success
          return NextResponse.json({
            status: 'succeeded',
            message: 'Payment successful, but subscription status could not be verified'
          });
        }
      }

      // If no subscription ID but payment succeeded
      return NextResponse.json({
        status: 'succeeded',
        message: 'Payment successful'
      });
    }

    // If payment is not succeeded
    return NextResponse.json({
      status: 'failed',
      message: 'Payment not successful'
    });

  } catch (err) {
    console.error('Error verifying payment:', err);
    return NextResponse.json(
      { error: 'Error verifying payment' },
      { status: 500 }
    );
  }
} 