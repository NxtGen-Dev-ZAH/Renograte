"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckIcon, StarIcon } from "lucide-react";
import { StripePaymentForm } from '@/components/StripePaymentForm';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  businessType: z.string().min(1, "Business type is required"),
  licenseNumber: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function BecomeMember() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [registrationData, setRegistrationData] = useState<any>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      phone: "",
      businessType: "",
      licenseNumber: "",
    },
  });

  // Auto-fill form with user data if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      // Fill in the form with user data
      form.setValue("name", user.name || "");
      form.setValue("email", user.email || "");
      
      // Check if user has a phone number in their profile
      if (user.phone) {
        form.setValue("phone", user.phone);
      }
      
      // If user has a company in their profile
      if (user.company) {
        form.setValue("company", user.company);
      }
      
      // If user has a business type in their profile
      if (user.businessType) {
        form.setValue("businessType", user.businessType);
      }
    }
  }, [isAuthenticated, user, form]);

  const plans = {
    monthly: [
      {
        name: "Agents Monthly",
        price: "$49",
        period: "/Month",
        features: [
          "Renograte Listing Services",
          "Renovation Allowance Analysis",
          "Renograte Option Agreements",
          "Renograte Sales Trainings",
          "Client Term Sheets and Calculations",
          "Preferred Contractors Network",
          "Receive Qualified Client Leads",
          "Renograte Marketing Materials",
          "Dedicated Customer Support",
          "Document Sharing",
          "Streamlined Communication & Collaboration Tools",
          "Preferred Renograte Agent Ambassador Program",
          "Renograte Conferences and Events"
        ]
      },
      {
        name: "Service Providers (Contractors) monthly membership",
        price: "$19",
        period: "/Month",
        features: [
          "Preferred Agent & Client Network",
          "Receive Qualified Leads",
          "Renograte Marketing Materials",
          "Showcase Your Portfolio & Expertise",
          "Streamlined Communication & Collaboration Tools",
          "Renograte Sales Trainings",
          "Multi-Channel Marketing",
          "Document Sharing",
          "Project Dashboard",
          "Feedback and Reviews",
          "Blogs & Forums",
          "Dedicated Customer Support",
          "Renograte Conferences and Events"
        ]
      }
    ],
    annual: [
      {
        name: "Real Estate Agents",
        price: "$499",
        period: "/Year",
        features: [
          "Renograte Listing Services",
          "Renovation Allowance Analysis",
          "Client Termsheets and Calculations",
          "Renograte Option Agreements",
          "Renograte Sales Trainings",
          "Preferred Contractors Network",
          "Receive Qualified Client Leads",
          "Renograte Marketing Materials",
          "Dedicated Customer Support",
          "Document Sharing",
          "Streamlined Communication & Collaboration Tools",
          "Preferred Renograte Agent Ambassador Program",
          "Renograte Conferences and Events VIP"
        ]
      },
      {
        name: "Service providers (Contractors) yearly membership",
        price: "$199",
        period: "/Year",
        features: [
          "Preferred Agent & Client Network",
          "Receive Qualified Leads",
          "Renograte Marketing Materials",
          "Showcase Your Portfolio & Expertise",
          "Streamlined Communication & Collaboration Tools",
          "Renograte Sales Trainings",
          "Multi-Channel Marketing",
          "Document Sharing",
          "Project Dashboard",
          "Feedback and Reviews",
          "Dedicated Customer Support",
          "Blogs & Forums",
          "Renograte Conferences and Events VIP"
        ]
      }
    ]
  };

  const handlePlanSelect = (plan: string, cycle: string) => {
    setActivePlan(plan);
    setSelectedPlan(cycle);
    // Scroll to registration form
    document.getElementById("registration-form")?.scrollIntoView({ 
      behavior: "smooth",
      block: "start" 
    });
  };

  const handleSubmit = async (data: FormData) => {
    if (!selectedPlan || !activePlan) {
      toast({
        title: "Plan Selection Required",
        description: "Please select a plan before proceeding with registration.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setPaymentError(null);

    try {
      let responseData;

      // Handle differently based on authentication status
      if (isAuthenticated && user) {
        // User is already logged in, check their role
        if (user.role === 'member' || user.role === 'agent' || user.role === 'contractor' || user.role === 'admin') {
          // User is already a member or has a higher role
          toast({
            title: "Already a Member",
            description: "You already have membership access. Redirecting to dashboard.",
            variant: "default",
          });
          setTimeout(() => router.push('/dashboard'), 2000);
          setIsLoading(false);
          return;
        }

        // User exists but is a regular user, just update their profile
        const updateResponse = await fetch('/api/member/upgrade', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            ...data,
            plan: activePlan,
            billingCycle: selectedPlan,
          }),
        });

        responseData = await updateResponse.json();
        
        if (!updateResponse.ok) {
          throw new Error(responseData.error || 'Member upgrade failed');
        }
      } else {
        // New user registration
        const registrationResponse = await fetch('/api/member/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            plan: activePlan,
            billingCycle: selectedPlan,
          }),
        });

        responseData = await registrationResponse.json();
        
        if (!registrationResponse.ok) {
          throw new Error(responseData.error || 'Registration failed');
        }
      }

      // Store registration data and mark registration as complete
      setRegistrationData(responseData);
      setRegistrationComplete(true);
      
      // Create payment intent
      const paymentResponse = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseInt(plans[selectedPlan as keyof typeof plans].find(p => p.name === activePlan)?.price.replace('$', '') || '0'),
          currency: 'usd',
          plan: activePlan,
          billingCycle: selectedPlan,
          userId: responseData.user.id,
        }),
      });

      const paymentData = await paymentResponse.json();
      
      if (!paymentResponse.ok) {
        throw new Error(paymentData.error || 'Payment initialization failed');
      }

      setClientSecret(paymentData.clientSecret);
      
      toast({
        title: "Registration Successful",
        description: "Please complete your payment to activate your membership.",
      });
      
    } catch (error) {
      console.error("Error:", error);
      setPaymentError(error instanceof Error ? error.message : 'An error occurred');
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const businessTypes = [
    "Real Estate Agency", 
    "Individual Agent", 
    "Property Management", 
    "Real Estate Investor",
    "Contractor",
    "Other"
  ];

  const createPaymentIntent = async () => {
    try {
      const selectedPlanData = plans[selectedPlan as keyof typeof plans].find(p => p.name === activePlan);
      if (!selectedPlanData) return;

      const amount = parseInt(selectedPlanData.price.replace('$', ''));
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: 'usd',
          plan: activePlan,
          billingCycle: selectedPlan,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setPaymentError('Failed to initialize payment. Please try again.');
    }
  };

  useEffect(() => {
    if (activePlan) {
      createPaymentIntent();
    }
  }, [activePlan, selectedPlan]);

  const handlePaymentSuccess = async () => {
    try {
      // Update user role to 'member' in the database
      const updateRoleResponse = await fetch('/api/member/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: registrationData?.user?.id,
          newRole: 'member',
          planType: activePlan,
          billingCycle: selectedPlan
        }),
      });

      if (!updateRoleResponse.ok) {
        const errorData = await updateRoleResponse.json();
        throw new Error(errorData.error || 'Failed to update membership status');
      }

      toast({
        title: "Payment Successful",
        description: "Your membership has been activated. You'll be redirected to login for a fresh session.",
      });

      // Instead of trying to wait for the session to update (which can be unreliable),
      // we'll sign the user out and redirect them to login with a callback URL
      // This ensures they get a fresh session with the correct role
      try {
        // Try to sign out the user first
        const res = await fetch('/api/auth/signout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ redirect: false, callbackUrl: '/dashboard' }),
        });
        
        if (res.ok) {
          // If successful, redirect to login with callback to dashboard
          setTimeout(() => {
            router.push('/login?callbackUrl=/dashboard&message=membership_activated');
          }, 1500);
        } else {
          // Fallback if signout fails
          router.push('/login?callbackUrl=/dashboard&message=membership_activated');
        }
      } catch (error) {
        // Fallback if the signout request fails
        console.error('Error during signout:', error);
        router.push('/login?callbackUrl=/dashboard&message=membership_activated');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Membership Update Error",
        description: "Your payment was processed but we couldn't update your membership status. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    toast({
      title: "Payment Error",
      description: error,
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Join the Renograte Community
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Select the plan that best fits your needs and start transforming your real estate business with renovation-ready properties
          </p>
        </div>

        {/* Pricing Section */}
        <div className="mb-16">
          <Tabs defaultValue="monthly" className="w-full max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-[300px] sm:w-[360px] grid-cols-2 p-1 bg-gray-100">
                <TabsTrigger 
                  value="monthly" 
                  onClick={() => setSelectedPlan("monthly")}
                  className="data-[state=active]:bg-[#0C71C3] data-[state=active]:text-white"
                >
                  Monthly Billing
                </TabsTrigger>
                <TabsTrigger 
                  value="annual" 
                  onClick={() => setSelectedPlan("annual")}
                  className="data-[state=active]:bg-[#0C71C3] data-[state=active]:text-white"
                >
                  Annual Billing
                  <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">Save 20%</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {["monthly", "annual"].map((billingPeriod) => (
              <TabsContent key={billingPeriod} value={billingPeriod}>
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8`}>
                  {plans[billingPeriod as keyof typeof plans].map((plan, index) => (
                    <Card 
                      key={index} 
                      className={`relative hover:shadow-xl transition-all duration-300 ${
                        plan.name === activePlan
                          ? "border-2 border-[#0C71C3] shadow-lg shadow-[#0C71C3]/10"
                          : "border border-gray-200"
                      }`}
                    >
                      <CardHeader>
                        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                        <div className="mt-6">
                          <div className="flex items-baseline">
                            <span className="text-4xl font-extrabold">{plan.price}</span>
                            <span className="text-gray-500 ml-1">{plan.period}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-3">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start">
                              <CheckIcon className="h-5 w-5 text-[#0C71C3] mr-2 shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button
                          className={`w-full mt-8 ${
                            plan.name === activePlan
                              ? "bg-[#0C71C3] hover:bg-[#0A5A9C]" 
                              : "bg-white text-[#0C71C3] border border-[#0C71C3] hover:bg-[#0C71C3] hover:text-white"
                          }`}
                          onClick={() => handlePlanSelect(plan.name, billingPeriod)}
                        >
                          {plan.name === activePlan ? "Selected" : "Select Plan"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Registration Form */}
        <Card className="shadow-lg max-w-3xl mx-auto" id="registration-form">
          <CardHeader className="bg-gradient-to-r from-[#0C71C3]/10 to-blue-50 border-b">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              {registrationComplete ? "Complete Your Payment" : "Complete Your Registration"}
              {activePlan && (
                <div className="text-sm font-normal px-2 py-0.5 bg-[#0C71C3]/10 text-[#0C71C3] rounded-md">
                  {activePlan} Plan
                </div>
              )}
            </CardTitle>
            <CardDescription>
              {!activePlan ? (
                <div className="text-amber-600">
                  Please select a plan above before proceeding with registration
                </div>
              ) : registrationComplete ? (
                "Please complete your payment to activate your membership"
              ) : (
                "Fill in your details below to create your account and start your membership"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {!registrationComplete ? (
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Full Name*</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      className="focus-visible:ring-[#0C71C3]"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email Address*</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      className="focus-visible:ring-[#0C71C3]"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm font-medium">Company Name</Label>
                    <Input
                      id="company"
                      {...form.register("company")}
                      className="focus-visible:ring-[#0C71C3]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number*</Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...form.register("phone")}
                      className="focus-visible:ring-[#0C71C3]"
                    />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessType" className="text-sm font-medium">Business Type*</Label>
                    <Select 
                      value={form.watch("businessType")} 
                      onValueChange={(value) => form.setValue("businessType", value)}
                    >
                      <SelectTrigger className="focus:ring-[#0C71C3]">
                        <SelectValue placeholder="Select your business type" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.businessType && (
                      <p className="text-sm text-red-500">{form.formState.errors.businessType.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber" className="text-sm font-medium">License Number (if applicable)</Label>
                    <Input
                      id="licenseNumber"
                      {...form.register("licenseNumber")}
                      className="focus-visible:ring-[#0C71C3]"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#0C71C3] hover:bg-[#0A5A9C] text-white"
                  disabled={isLoading || !activePlan || !selectedPlan}
                >
                  {!activePlan ? "Select a Plan First" : isLoading ? "Processing..." : "Continue to Payment"}
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Registration Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Registration Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Name</p>
                      <p className="font-medium">{form.getValues("name")}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Email</p>
                      <p className="font-medium">{form.getValues("email")}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Phone</p>
                      <p className="font-medium">{form.getValues("phone")}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Business Type</p>
                      <p className="font-medium">{form.getValues("businessType")}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Section */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Payment Information*</Label>
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-700">Selected Plan:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{activePlan}</span>
                        <span className="text-gray-500">({selectedPlan})</span>
                        <span className="font-bold text-[#0C71C3]">
                          {plans[selectedPlan as keyof typeof plans].find(p => p.name === activePlan)?.price}
                          {plans[selectedPlan as keyof typeof plans].find(p => p.name === activePlan)?.period}
                        </span>
                      </div>
                    </div>
                    
                    {paymentError && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {paymentError}
                      </div>
                    )}

                    {clientSecret ? (
                      <StripePaymentForm
                        clientSecret={clientSecret}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    ) : (
                      <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
                    )}

                    <p className="text-sm text-gray-500 mt-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Your payment information is securely processed by Stripe
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="pt-4">
              <p className="text-center text-xs text-gray-500 mt-4">
                By completing registration, you agree to our <a href="#" className="text-[#0C71C3] hover:underline">Terms of Service</a> and <a href="#" className="text-[#0C71C3] hover:underline">Privacy Policy</a>
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Testimonials or Trust Signals */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Trusted by Real Estate Professionals</h2>
            <p className="text-gray-600 mt-2">Join thousands of real estate professionals already using Renograte</p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
            {/* Replace with actual partner/client logos */}
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="w-32 h-12 bg-gray-200 rounded-md"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 