"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
// import { loadStripe } from "@stripe/stripe-js";
// import { useToast } from "@/components/ui/use-toast";
// import { CardElement } from "@stripe/react-stripe-js";

// Initialize Stripe
// const stripePromise = loadStripe(
//   process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
// );

export default function FreeTrial() {
  // const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    role: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Create customer and subscription in your backend
      const response = await fetch("/api/create-trial-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const { clientSecret, customerId } = await response.json();

      // 2. Initialize Stripe
      // const stripe = await stripePromise;
      // if (!stripe) throw new Error("Stripe failed to initialize");

      // 3. Confirm card setup
      // const { error: stripeError } = await stripe.confirmCardSetup(
      //   clientSecret,
      //   {
      //     payment_method: {
      //       card: elements.getElement("card")!,
      //       billing_details: {
      //         name: formData.name,
      //         email: formData.email,
      //       },
      //     },
      //   }
      // );

      // if (stripeError) {
      //   throw new Error(stripeError.message);
      // }

      //     toast({
      //       title: "Trial Started Successfully",
      //       description:
      //         "Your 90-day free trial has begun. You won't be charged until the trial ends.",
      //     });
      //   } catch (error) {
      //     toast({
      //       title: "Error",
      //       description: "Something went wrong. Please try again.",
      //       variant: "destructive",
      //     });
      //   } finally {
      //     setIsLoading(false);
      //   }
      // };
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Start Your Renograte Journey
          </h1>
          <p className="text-xl text-gray-600">
            Experience the full power of Renograte for 90 days and close more
            deals.
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Free Trial Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="role">Your Role</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    placeholder="e.g., Real Estate Agent, Broker, Investor"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Card Details</Label>
                <div className="p-3 border rounded-lg">
                  {/* <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: "16px",
                          color: "#424770",
                          "::placeholder": {
                            color: "#aab7c4",
                          },
                        },
                      },
                    }}
                  /> */}
                </div>
                <p className="text-sm text-gray-500">
                  Your card won't be charged until after the 90-day trial
                  period.
                </p>
              </div>
              <Button
                type="submit"
                className="w-full bg-[#0C71C3] hover:bg-[#0C71C3]/90"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Start Free Trial"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
