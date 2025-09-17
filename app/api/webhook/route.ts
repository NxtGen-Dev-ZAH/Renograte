import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

// Initialize Stripe with proper error handling
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

// Webhook secret for signature verification
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Webhook event processing timeout (30 seconds)
const WEBHOOK_TIMEOUT = 30000;

// Rate limiting for webhook processing
const processedEvents = new Set<string>();

export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    // Get the raw body as text
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    // Enhanced logging with request ID for tracking
    const requestId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`🔍 [${requestId}] Webhook Debug Info:`);
    console.log(`- Body length: ${body.length}`);
    console.log(`- Signature present: ${!!signature}`);
    console.log(`- Endpoint secret present: ${!!endpointSecret}`);
    console.log(`- Endpoint secret starts with: ${endpointSecret?.substring(0, 10)}`);

    if (!signature) {
      console.error(`❌ [${requestId}] Missing stripe-signature header`);
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    if (!endpointSecret) {
      console.error(`❌ [${requestId}] Missing webhook secret in environment variables`);
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
      console.log(`✅ [${requestId}] Webhook signature verified successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(`❌ [${requestId}] Webhook signature verification failed: ${errorMessage}`);
      console.error(`- Signature received: ${signature}`);
      console.error(`- Body preview: ${body.substring(0, 200)}`);
      return NextResponse.json(
        { error: `Webhook Error: ${errorMessage}` },
        { status: 400 }
      );
    }

    // Check for duplicate event processing
    const eventKey = `${event.id}_${event.type}`;
    if (processedEvents.has(eventKey)) {
      console.log(`⚠️ [${requestId}] Duplicate event detected: ${eventKey}`);
      return NextResponse.json({ received: true, duplicate: true });
    }
    processedEvents.add(eventKey);

    // Clean up old processed events (keep last 1000)
    if (processedEvents.size > 1000) {
      const eventsArray = Array.from(processedEvents);
      processedEvents.clear();
      eventsArray.slice(-500).forEach(event => processedEvents.add(event));
    }

    console.log(`✅ [${requestId}] Webhook received: ${event.type}`);

    // Check for timeout
    if (Date.now() - startTime > WEBHOOK_TIMEOUT) {
      console.error(`❌ [${requestId}] Webhook processing timeout`);
      return NextResponse.json(
        { error: "Webhook processing timeout" },
        { status: 408 }
      );
    }

    try {
      switch (event.type) {
        case "payment_intent.succeeded":
          await handlePaymentIntentSucceeded(
            event.data.object as Stripe.PaymentIntent,
            requestId
          );
          break;

        case "payment_intent.payment_failed":
          await handlePaymentIntentFailed(
            event.data.object as Stripe.PaymentIntent,
            requestId
          );
          break;

        case "customer.subscription.created":
          await handleSubscriptionCreated(
            event.data.object as Stripe.Subscription,
            requestId
          );
          break;

        case "customer.subscription.updated":
          await handleSubscriptionUpdated(
            event.data.object as Stripe.Subscription,
            requestId
          );
          break;

        case "customer.subscription.deleted":
          await handleSubscriptionDeleted(
            event.data.object as Stripe.Subscription,
            requestId
          );
          break;

        case "invoice.payment_succeeded":
          await handleInvoicePaymentSucceeded(
            event.data.object as Stripe.Invoice,
            requestId
          );
          break;

        case "customer.subscription.trial_will_end":
          await handleTrialWillEnd(
            event.data.object as Stripe.Subscription,
            requestId
          );
          break;

        default:
          console.log(`⚠️ [${requestId}] Unhandled event type: ${event.type}`);
      }

      const processingTime = Date.now() - startTime;
      console.log(`✅ [${requestId}] Webhook processed successfully in ${processingTime}ms`);
      return NextResponse.json({ received: true, processingTime });
    } catch (error) {
      console.error(`❌ [${requestId}] Error processing webhook:`, error);
      return NextResponse.json(
        { error: "Error processing webhook" },
        { status: 500 }
      );
    }
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Error in webhook handler (${processingTime}ms):`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// -----------------------------
// Handlers
// -----------------------------
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent, requestId: string) {
  const userId = paymentIntent.metadata?.userId;
  const planType = paymentIntent.metadata?.plan;
  const billingCycle = paymentIntent.metadata?.billingCycle;

  if (!userId) {
    console.error(`❌ [${requestId}] Payment succeeded but no userId in metadata`);
    return;
  }

  try {
    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { role: "member" },
      });

      await tx.memberProfile.update({
        where: { userId },
        data: {
          status: "active",
          ...(planType && { plan: planType }),
          ...(billingCycle && { billingCycle }),
        },
      });
    });

    console.log(`✅ [${requestId}] User ${userId} upgraded to member status`);
  } catch (error) {
    console.error(`❌ [${requestId}] Error updating user status for payment ${paymentIntent.id}:`, error);
    throw error; // Re-throw to trigger webhook retry
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent, requestId: string) {
  const userId = paymentIntent.metadata?.userId;

  if (!userId) {
    console.error(`❌ [${requestId}] Payment failed but no userId in metadata`);
    return;
  }

  try {
    await prisma.memberProfile.update({
      where: { userId },
      data: { status: "payment_failed" },
    });

    console.log(`❌ [${requestId}] Payment failed for user ${userId}`);
  } catch (error) {
    console.error(`❌ [${requestId}] Error updating user status for failed payment ${paymentIntent.id}:`, error);
    throw error; // Re-throw to trigger webhook retry
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, requestId: string) {
  const customerId = subscription.customer as string;

  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer || customer.deleted) {
      console.log(`⚠️ [${requestId}] Customer ${customerId} not found or deleted`);
      return;
    }

    // Try to get userId from subscription metadata first, then customer metadata
    const userId = (subscription.metadata?.userId as string) || 
                   (customer.metadata?.userId as string) || null;
    
    if (!userId) {
      console.error(`❌ [${requestId}] No userId found in subscription or customer metadata`);
      console.error(`- Subscription metadata: ${JSON.stringify(subscription.metadata)}`);
      console.error(`- Customer metadata: ${JSON.stringify(customer.metadata)}`);
      return;
    }

    const planItem = subscription.items.data[0];
    if (!planItem) {
      console.error(`❌ [${requestId}] No plan items found in subscription ${subscription.id}`);
      return;
    }

    const planId = planItem.price.product as string;
    const product = await stripe.products.retrieve(planId);
    const planName = product.name;

    // Check if this is an early access subscription
    const isEarlyAccess = subscription.metadata?.isEarlyAccess === 'true' || 
                         customer.metadata?.isEarlyAccess === 'true';

    // Determine role based on subscription or customer metadata
    const role = subscription.metadata?.role || customer.metadata?.role || 'member';

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { role: role }, // Use the specific role (agent/contractor) instead of generic "member"
      });

      const existingProfile = await tx.memberProfile.findUnique({
        where: { userId },
      });

      if (existingProfile) {
        await tx.memberProfile.update({
          where: { userId },
          data: {
            status: "active",
            plan: planName,
            billingCycle: subscription.items.data[0]?.price.recurring?.interval || "unknown",
            stripeSubscriptionId: subscription.id,
            ...(isEarlyAccess && {
              isEarlyAccess: true,
              trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
            })
          },
        });
      } else {
        await tx.memberProfile.create({
          data: {
            userId,
            status: "active",
            plan: planName,
            billingCycle: subscription.items.data[0]?.price.recurring?.interval || "unknown",
            stripeSubscriptionId: subscription.id,
            phone: customer.phone || "",
            businessType: customer.metadata?.businessType || "Other",
            ...(isEarlyAccess && {
              isEarlyAccess: true,
              trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
            })
          },
        });
      }
    });

    console.log(`✅ [${requestId}] Subscription created for user ${userId}`);
  } catch (error) {
    console.error(`❌ [${requestId}] Error processing subscription created ${subscription.id}:`, error);
    throw error; // Re-throw to trigger webhook retry
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, requestId: string) {
  const customerId = subscription.customer as string;

  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer || customer.deleted) {
      console.log(`⚠️ [${requestId}] Customer ${customerId} not found or deleted for update`);
      return;
    }

    // Try to get userId from subscription metadata first, then customer metadata
    const userId = (subscription.metadata?.userId as string) || 
                   (customer.metadata?.userId as string) || null;
    
    if (!userId) {
      console.error(`❌ [${requestId}] No userId found in subscription or customer metadata for update`);
      return;
    }

    let memberStatus: string;
    switch (subscription.status) {
      case "active":
        memberStatus = "active";
        break;
      case "past_due":
        memberStatus = "past_due";
        break;
      case "unpaid":
        memberStatus = "unpaid";
        break;
      case "canceled":
        memberStatus = "canceled";
        break;
      case "incomplete":
        memberStatus = "incomplete";
        break;
      case "incomplete_expired":
        memberStatus = "incomplete_expired";
        break;
      case "trialing":
        memberStatus = "trialing";
        break;
      default:
        memberStatus = subscription.status;
    }

    await prisma.memberProfile.update({
      where: { userId },
      data: { status: memberStatus },
    });

    console.log(`✅ [${requestId}] Subscription updated for user ${userId} to ${memberStatus}`);
  } catch (error) {
    console.error(`❌ [${requestId}] Error processing subscription update ${subscription.id}:`, error);
    throw error; // Re-throw to trigger webhook retry
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, requestId: string) {
  const customerId = subscription.customer as string;

  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer || customer.deleted) {
      console.log(`⚠️ [${requestId}] Customer ${customerId} not found or deleted for deletion`);
      return;
    }

    // Try to get userId from subscription metadata first, then customer metadata
    const userId = (subscription.metadata?.userId as string) || 
                   (customer.metadata?.userId as string) || null;
    
    if (!userId) {
      console.error(`❌ [${requestId}] No userId found in subscription or customer metadata for deletion`);
      return;
    }

    await prisma.memberProfile.update({
      where: { userId },
      data: { status: "canceled" },
    });

    console.log(`✅ [${requestId}] Subscription canceled for user ${userId}`);
  } catch (error) {
    console.error(`❌ [${requestId}] Error processing subscription deletion ${subscription.id}:`, error);
    throw error; // Re-throw to trigger webhook retry
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, requestId: string) {
  // Webhook invoice events have subscription property
  const subscriptionId = typeof (invoice as any).subscription === 'string' 
    ? (invoice as any).subscription 
    : (invoice as any).subscription?.id;
  
  if (!subscriptionId) {
    console.log(`⚠️ [${requestId}] Invoice ${invoice.id} has no subscription ID`);
    return;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customerId = subscription.customer as string;
    const customer = await stripe.customers.retrieve(customerId);
    
    if (!customer || customer.deleted) {
      console.log(`⚠️ [${requestId}] Customer ${customerId} not found or deleted for invoice`);
      return;
    }

    const userId = (subscription.metadata?.userId as string) || 
                   (customer.metadata?.userId as string) || null;
    
    if (!userId) {
      console.log(`⚠️ [${requestId}] No userId found for invoice ${invoice.id}`);
      return;
    }

    // Check if this is the first payment after trial (early access conversion)
    const isEarlyAccess = subscription.metadata?.isEarlyAccess === 'true' || 
                         customer.metadata?.isEarlyAccess === 'true';

    if (isEarlyAccess && invoice.billing_reason === 'subscription_cycle') {
      // Update member profile to mark trial as ended
      await prisma.memberProfile.update({
        where: { userId },
        data: {
          status: "active",
          isEarlyAccess: false, // Trial has ended, now on paid plan
        },
      });

      console.log(`✅ [${requestId}] Early access trial ended for user ${userId}, now on paid plan`);
    }

  } catch (error) {
    console.error(`❌ [${requestId}] Error handling invoice payment succeeded ${invoice.id}:`, error);
    throw error; // Re-throw to trigger webhook retry
  }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription, requestId: string) {
  const customerId = subscription.customer as string;
  
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer || customer.deleted) {
      console.log(`⚠️ [${requestId}] Customer ${customerId} not found or deleted for trial end`);
      return;
    }

    const userId = (subscription.metadata?.userId as string) || 
                   (customer.metadata?.userId as string) || null;
    
    if (!userId) {
      console.log(`⚠️ [${requestId}] No userId found for trial end notification ${subscription.id}`);
      return;
    }

    // Check if this is an early access subscription
    const isEarlyAccess = subscription.metadata?.isEarlyAccess === 'true' || 
                         customer.metadata?.isEarlyAccess === 'true';

    if (isEarlyAccess) {
      // Send email notification about trial ending
      // You can implement email sending here
      console.log(`⚠️ [${requestId}] Early access trial ending soon for user ${userId}`);
      
      // Update member profile to show trial ending
      await prisma.memberProfile.update({
        where: { userId },
        data: {
          status: "trial_ending",
        },
      });
    }

  } catch (error) {
    console.error(`❌ [${requestId}] Error handling trial will end ${subscription.id}:`, error);
    throw error; // Re-throw to trigger webhook retry
  }
}
