import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

// This is your Stripe webhook secret for testing locally
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    // Get the raw body as text
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    console.log("🔍 Webhook Debug Info:");
    console.log("- Body length:", body.length);
    console.log("- Signature present:", !!signature);
    console.log("- Endpoint secret present:", !!endpointSecret);
    console.log("- Endpoint secret starts with:", endpointSecret?.substring(0, 10));

    if (!signature) {
      console.error("❌ Missing stripe-signature header");
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    if (!endpointSecret) {
      console.error("❌ Missing webhook secret in environment variables");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
      console.log("✅ Webhook signature verified successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(`❌ Webhook signature verification failed: ${errorMessage}`);
      console.error("- Signature received:", signature);
      console.error("- Body preview:", body.substring(0, 200));
      return NextResponse.json(
        { error: `Webhook Error: ${errorMessage}` },
        { status: 400 }
      );
    }

    console.log("✅ Webhook received:", event.type);

    try {
      switch (event.type) {
        case "payment_intent.succeeded":
          await handlePaymentIntentSucceeded(
            event.data.object as Stripe.PaymentIntent
          );
          break;

        case "payment_intent.payment_failed":
          await handlePaymentIntentFailed(
            event.data.object as Stripe.PaymentIntent
          );
          break;

        case "customer.subscription.created":
          await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;

        case "customer.subscription.updated":
          await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case "customer.subscription.deleted":
          await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        default:
          console.log(`⚠️ Unhandled event type: ${event.type}`);
      }

      return NextResponse.json({ received: true });
    } catch (error) {
      console.error("❌ Error processing webhook:", error);
      return NextResponse.json(
        { error: "Error processing webhook" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Error in webhook handler:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// -----------------------------
// Handlers
// -----------------------------
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const userId = paymentIntent.metadata?.userId;
  const planType = paymentIntent.metadata?.plan;
  const billingCycle = paymentIntent.metadata?.billingCycle;

  if (!userId) {
    console.error("Payment succeeded but no userId in metadata");
    return;
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: "member" },
    });

    await prisma.memberProfile.update({
      where: { userId },
      data: {
        status: "active",
        ...(planType && { plan: planType }),
        ...(billingCycle && { billingCycle }),
      },
    });

    console.log(`✅ User ${userId} upgraded to member status`);
  } catch (error) {
    console.error(`❌ Error updating user status for payment ${paymentIntent.id}:`, error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const userId = paymentIntent.metadata?.userId;

  if (!userId) {
    console.error("Payment failed but no userId in metadata");
    return;
  }

  try {
    await prisma.memberProfile.update({
      where: { userId },
      data: { status: "payment_failed" },
    });

    console.log(`❌ Payment failed for user ${userId}`);
  } catch (error) {
    console.error(`❌ Error updating user status for failed payment ${paymentIntent.id}:`, error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer || customer.deleted) return;

    // Try to get userId from subscription metadata first, then customer metadata
    const userId = (subscription.metadata?.userId as string) || 
                   (customer.metadata?.userId as string) || null;
    
    if (!userId) {
      console.error("No userId found in subscription or customer metadata");
      console.error("Subscription metadata:", subscription.metadata);
      console.error("Customer metadata:", customer.metadata);
      return;
    }

    const planItem = subscription.items.data[0];
    const planId = planItem?.price.product as string;
    const product = await stripe.products.retrieve(planId);
    const planName = product.name;

    await prisma.user.update({
      where: { id: userId },
      data: { role: "member" },
    });

    const existingProfile = await prisma.memberProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      await prisma.memberProfile.update({
        where: { userId },
        data: {
          status: "active",
          plan: planName,
          billingCycle:
            subscription.items.data[0]?.price.recurring?.interval || "unknown",
        },
      });
    } else {
      await prisma.memberProfile.create({
        data: {
          userId,
          status: "active",
          plan: planName,
          billingCycle:
            subscription.items.data[0]?.price.recurring?.interval || "unknown",
          phone: "",
          businessType: "Other",
        },
      });
    }

    console.log(`✅ Subscription created for user ${userId}`);
  } catch (error) {
    console.error(`❌ Error processing subscription created ${subscription.id}:`, error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer || customer.deleted) return;

    // Try to get userId from subscription metadata first, then customer metadata
    const userId = (subscription.metadata?.userId as string) || 
                   (customer.metadata?.userId as string) || null;
    
    if (!userId) {
      console.error("No userId found in subscription or customer metadata for update");
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
      default:
        memberStatus = subscription.status;
    }

    await prisma.memberProfile.update({
      where: { userId },
      data: { status: memberStatus },
    });

    console.log(`✅ Subscription updated for user ${userId} to ${memberStatus}`);
  } catch (error) {
    console.error(`❌ Error processing subscription update ${subscription.id}:`, error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer || customer.deleted) return;

    // Try to get userId from subscription metadata first, then customer metadata
    const userId = (subscription.metadata?.userId as string) || 
                   (customer.metadata?.userId as string) || null;
    
    if (!userId) {
      console.error("No userId found in subscription or customer metadata for deletion");
      return;
    }

    await prisma.memberProfile.update({
      where: { userId },
      data: { status: "canceled" },
    });

    console.log(`✅ Subscription canceled for user ${userId}`);
  } catch (error) {
    console.error(`❌ Error processing subscription deletion ${subscription.id}:`, error);
  }
}
