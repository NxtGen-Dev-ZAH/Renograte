import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

// This is your Stripe webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      endpointSecret
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent ${paymentIntent.id} was successful!`);
        // Update your database here
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
        
      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed: ${failedPaymentIntent.id}, ${failedPaymentIntent.last_payment_error?.message}`);
        await handlePaymentIntentFailed(failedPaymentIntent);
        break;

      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription created: ${subscription.id}`);
        await handleSubscriptionCreated(subscription);
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription updated: ${updatedSubscription.id}`);
        await handleSubscriptionUpdated(updatedSubscription);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription cancelled: ${deletedSubscription.id}`);
        await handleSubscriptionDeleted(deletedSubscription);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}

// Implementation of webhook handlers
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // Extract user ID from metadata
  const userId = paymentIntent.metadata?.userId;
  const planType = paymentIntent.metadata?.plan;
  const billingCycle = paymentIntent.metadata?.billingCycle;
  
  if (!userId) {
    console.error('Payment succeeded but no userId in metadata');
    return;
  }

  try {
    // Update user role to member
    await prisma.user.update({
      where: { id: userId },
      data: { role: "member" }
    });

    // Update member profile status to active
    await prisma.memberProfile.update({
      where: { userId },
      data: { 
        status: "active",
        // Update plan details if they were passed in metadata
        ...(planType && { plan: planType }),
        ...(billingCycle && { billingCycle })
      }
    });

    console.log(`User ${userId} successfully upgraded to member status`);
  } catch (error) {
    console.error(`Error updating user status for payment ${paymentIntent.id}:`, error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const userId = paymentIntent.metadata?.userId;
  
  if (!userId) {
    console.error('Payment failed but no userId in metadata');
    return;
  }

  try {
    // Update member profile status to failed
    await prisma.memberProfile.update({
      where: { userId },
      data: { status: "payment_failed" }
    });

    console.log(`Payment failed for user ${userId}`);
  } catch (error) {
    console.error(`Error updating user status for failed payment ${paymentIntent.id}:`, error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  // Extract customer ID
  const customerId = subscription.customer as string;
  
  try {
    // Find customer metadata to get user ID
    const customer = await stripe.customers.retrieve(customerId);
    
    if (!customer || customer.deleted) {
      console.error('Customer not found or deleted');
      return;
    }
    
    const userId = (customer.metadata?.userId as string);
    
    if (!userId) {
      console.error('No userId found in customer metadata');
      return;
    }
    
    // Extract plan details from subscription
    const planItem = subscription.items.data[0];
    const planId = planItem?.price.product as string;
    
    // Get plan details if needed
    const product = await stripe.products.retrieve(planId);
    const planName = product.name;
    
    // Update membership in database
    await prisma.user.update({
      where: { id: userId },
      data: { role: "member" }
    });
    
    // Find or create member profile
    const existingProfile = await prisma.memberProfile.findUnique({
      where: { userId }
    });
    
    if (existingProfile) {
      await prisma.memberProfile.update({
        where: { userId },
        data: {
          status: "active",
          plan: planName,
          billingCycle: subscription.items.data[0]?.price.recurring?.interval || "unknown"
        }
      });
    } else {
      // This case should be rare as profile is normally created during registration
      await prisma.memberProfile.create({
        data: {
          userId,
          status: "active",
          plan: planName,
          billingCycle: subscription.items.data[0]?.price.recurring?.interval || "unknown",
          // Set default values for required fields
          phone: "",
          businessType: "Other"
        }
      });
    }
    
    console.log(`Subscription created and activated for user ${userId}`);
  } catch (error) {
    console.error(`Error processing subscription created ${subscription.id}:`, error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Extract customer ID
  const customerId = subscription.customer as string;
  
  try {
    // Find customer metadata to get user ID
    const customer = await stripe.customers.retrieve(customerId);
    
    if (!customer || customer.deleted) {
      console.error('Customer not found or deleted');
      return;
    }
    
    const userId = (customer.metadata?.userId as string);
    
    if (!userId) {
      console.error('No userId found in customer metadata');
      return;
    }
    
    // Update membership status based on subscription status
    let memberStatus: string;
    
    switch (subscription.status) {
      case 'active':
        memberStatus = 'active';
        break;
      case 'past_due':
        memberStatus = 'past_due';
        break;
      case 'unpaid':
        memberStatus = 'unpaid';
        break;
      case 'canceled':
        memberStatus = 'canceled';
        break;
      default:
        memberStatus = subscription.status;
    }
    
    // Update member profile
    await prisma.memberProfile.update({
      where: { userId },
      data: { status: memberStatus }
    });
    
    console.log(`Subscription updated for user ${userId} to status: ${memberStatus}`);
  } catch (error) {
    console.error(`Error processing subscription update ${subscription.id}:`, error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Extract customer ID
  const customerId = subscription.customer as string;
  
  try {
    // Find customer metadata to get user ID
    const customer = await stripe.customers.retrieve(customerId);
    
    if (!customer || customer.deleted) {
      console.error('Customer not found or deleted');
      return;
    }
    
    const userId = (customer.metadata?.userId as string);
    
    if (!userId) {
      console.error('No userId found in customer metadata');
      return;
    }
    
    // Update membership status
    await prisma.memberProfile.update({
      where: { userId },
      data: { status: 'canceled' }
    });
    
    // Optionally revert user role to "user" if membership is fully canceled
    // Uncomment if you want to downgrade their role
    /*
    await prisma.user.update({
      where: { id: userId },
      data: { role: "user" }
    });
    */
    
    console.log(`Subscription canceled for user ${userId}`);
  } catch (error) {
    console.error(`Error processing subscription deletion ${subscription.id}:`, error);
  }
} 