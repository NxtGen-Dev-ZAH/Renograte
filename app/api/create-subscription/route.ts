import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { formatAmountForStripe } from '@/lib/stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export async function POST(req: Request) {
  try {
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
    } else {
      // Create a new customer if not found
      customer = await stripe.customers.create({
        name,
        email,
        phone,
        metadata: {
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

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        plan,
        billingCycle
      }
    });

    // Get the payment intent from the subscription
    const paymentIntent = (subscription.latest_invoice as any).payment_intent;

    // Update the payment intent with the subscription ID
    await stripe.paymentIntents.update(paymentIntent.id, {
      metadata: {
        subscriptionId: subscription.id
      }
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
      'monthly': 'price_1RQWnqPQcXidxFd9KtXcZP6y',
      'annual': 'price_1RRCh7PQcXidxFd9goZZOKYL'
    },
    'Service Providers (Contractors) monthly membership': {
      'monthly': 'price_1RQWsSPQcXidxFd9tsnmlVAG',
      'annual': 'price_1RRCiwPQcXidxFd9bGdROkqI'
    }
  };

  return priceMap[plan]?.[billingCycle] || null;
} 