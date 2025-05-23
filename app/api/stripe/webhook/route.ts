import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Stripe secret key and webhook secret from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const buf = await req.arrayBuffer();
  const body = Buffer.from(buf);

  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) {
      return NextResponse.json({ error: 'Webhook signature or secret missing' }, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Webhook Error: Invalid signature' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      // TODO: Mark subscription as active in your DB (invoice.subscription, invoice.customer)
      console.log('Invoice paid:', invoice.id);
      break;
    }
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      // TODO: Mark one-time payment as complete in your DB (paymentIntent.id, paymentIntent.metadata)
      console.log('PaymentIntent succeeded:', paymentIntent.id);
      break;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      // TODO: Update subscription status in your DB (subscription.id, subscription.status)
      console.log('Subscription event:', subscription.id, subscription.status);
      break;
    }
    default:
      // Unexpected event type
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({ received: true });
} 