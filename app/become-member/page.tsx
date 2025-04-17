"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckIcon, StarIcon } from "lucide-react";

export default function BecomeMember() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [activePlan, setActivePlan] = useState<string>("Professional");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    role: "",
    licenseNumber: "",
    businessType: "",
  });

  const plans = {
    monthly: [
      {
        name: "Basic",
        price: "$49",
        period: "/month",
        features: [
          "Access to Renograte Calculator",
          "Basic Market Analysis Tools",
          "Processing .....",
        //   "Limited Property Listings (25)",
        //   "Basic Communication Hub",
        //   "Email Support",
        ],
        // nonFeatures: [
        //   "Lead Generation Tools",
        //   "Advanced ROI Calculator",
        //   "Unlimited Property Listings",
        // ],
      },
      {
        name: "Professional",
        price: "$99",
        period: "/month",
        features: [
          "All Basic features",
          "Full Market Analysis Tools",
          "Processing .....",

        //   "Unlimited Property Listings",
        //   "Advanced ROI Calculator",
        //   "Lead Generation Tools",
        //   "Priority Support",
        //   "Access to Contractor Network",
        ],
        // nonFeatures: [
        //   "Custom Branding",
        //   "API Access",
        // ],
      },
      {
        name: "Enterprise",
        price: "$199",
        period: "/month",
        features: [
          "All Professional features",
          "Custom Branding",
          "Processing .....",
        //   "Team Management (up to 10 users)",
        //   "API Access",
        //   "Dedicated Account Manager",
        //   "Training Sessions (2/month)",
        //   "White-labeled Reports",
        //   "Advanced Analytics Dashboard",
        ],
        nonFeatures: [],
      },
    ],
    annual: [
      {
        name: "Basic",
        price: "$39",
        period: "/month",
        saveAmount: "Save $120/year",
        features: [
          "Access to Renograte Calculator",
          "Basic Market Analysis Tools",
          "Processing .....",
        //   "Limited Property Listings (25)",
        //   "Basic Communication Hub",
        //   "Email Support",
        ],
        // nonFeatures: [
        //   "Lead Generation Tools",
        //   "Advanced ROI Calculator",
        //   "Unlimited Property Listings",
        // ],
      },
      {
        name: "Professional",
        price: "$79",
        period: "/month",
        saveAmount: "Save $240/year",
        features: [
          "All Basic features",
          "Full Market Analysis Tools",
          "Processing .....",
        //   "Unlimited Property Listings",
        //   "Advanced ROI Calculator",
        //   "Lead Generation Tools",
        //   "Priority Support",
        //   "Access to Contractor Network",
        ],
        // nonFeatures: [
        //   "Custom Branding",
        //   "API Access",
        // ],
      },
      {
        name: "Enterprise",
        price: "$159",
        period: "/month",
        saveAmount: "Save $480/year",
        features: [
          "All Professional features",
          "Processing .....",
        //   "Custom Branding",
        //   "Team Management (up to 10 users)",
        //   "API Access",
        //   "Dedicated Account Manager",
          "Training Sessions (2/month)",
        //   "White-labeled Reports",
        //   "Advanced Analytics Dashboard",
        ],
        nonFeatures: [],
      },
    ],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement Stripe integration similar to free-trial page
      // 1. Create customer
      // 2. Set up subscription
      // 3. Process payment
      // 4. Redirect to dashboard
      
      console.log("Form submitted:", {
        ...formData,
        plan: activePlan,
        billingCycle: selectedPlan
      });
      
      // Simulate processing
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
      
    } catch (error) {
      console.error("Error:", error);
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                  {plans[billingPeriod as keyof typeof plans].map((plan, index) => (
                    <Card 
                      key={index} 
                      className={`relative hover:shadow-xl transition-all duration-300 ${
                        plan.name === activePlan
                          ? "border-2 border-[#0C71C3] shadow-lg shadow-[#0C71C3]/10"
                          : "border border-gray-200"
                      }`}
                    >
                      {plan.name === "Professional" && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#0C71C3] to-[#0A5A9C] text-white px-4 py-1 rounded-full text-sm font-medium shadow-md">
                          Most Popular
                        </div>
                      )}
                      <CardHeader className={`pb-8 ${plan.name === "Enterprise" ? "bg-gradient-to-br from-blue-50 to-indigo-50" : ""}`}>
                        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                        <CardDescription className="text-gray-500">
                          {plan.name === "Basic" 
                            ? "For individual agents just getting started" 
                            : plan.name === "Professional"
                              ? "Perfect for established real estate professionals"
                              : "For agencies and teams with advanced needs"
                          }
                        </CardDescription>
                        <div className="mt-6">
                          <div className="flex items-baseline">
                            <span className="text-4xl font-extrabold">{plan.price}</span>
                            <span className="text-gray-500 ml-1">{plan.period}</span>
                          </div>
                          {(plan as any).saveAmount && (
                            <div className="mt-1">
                              <span className="text-green-600 text-sm font-medium">{(plan as any).saveAmount}</span>
                            </div>
                          )}
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
                          
                          {plan.nonFeatures && plan.nonFeatures.length > 0 && (
                            <>
                              <li className="pt-2 border-t border-gray-100 mt-4"></li>
                              {plan.nonFeatures.map((feature, idx) => (
                                <li key={idx} className="flex items-start opacity-50">
                                  <span className="h-5 w-5 border border-gray-300 rounded-full mr-2 shrink-0 mt-0.5"></span>
                                  <span className="text-sm text-gray-500">{feature}</span>
                                </li>
                              ))}
                            </>
                          )}
                        </ul>
                        <Button
                          className={`w-full mt-8 ${
                            plan.name === activePlan
                              ? "bg-[#0C71C3] hover:bg-[#0A5A9C]" 
                              : "bg-white text-[#0C71C3] border border-[#0C71C3] hover:bg-[#0C71C3] hover:text-white"
                          }`}
                          onClick={() => {
                            setActivePlan(plan.name);
                            document.getElementById("registration-form")?.scrollIntoView({ 
                              behavior: "smooth",
                              block: "start" 
                            });
                          }}
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
              Complete Your Registration
              <div className="text-sm font-normal px-2 py-0.5 bg-[#0C71C3]/10 text-[#0C71C3] rounded-md">
                {activePlan} Plan
              </div>
            </CardTitle>
            <CardDescription>
              Fill in your details below to create your account and start your membership
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name*</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="focus-visible:ring-[#0C71C3]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address*</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="focus-visible:ring-[#0C71C3]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium">Company Name</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="focus-visible:ring-[#0C71C3]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number*</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="focus-visible:ring-[#0C71C3]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessType" className="text-sm font-medium">Business Type*</Label>
                  <Select 
                    value={formData.businessType} 
                    onValueChange={(value) => setFormData({ ...formData, businessType: value })}
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber" className="text-sm font-medium">License Number (if applicable)</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, licenseNumber: e.target.value })
                    }
                    className="focus-visible:ring-[#0C71C3]"
                  />
                </div>
              </div>
              
              <div className="space-y-2 pt-4 border-t border-gray-100 mt-4">
                <Label className="text-sm font-medium">Payment Information*</Label>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700">Selected Plan:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{activePlan}</span>
                      <span className="text-gray-500">({selectedPlan})</span>
                      <span className="font-bold text-[#0C71C3]">
                        {plans[selectedPlan as keyof typeof plans].find(p => p.name === activePlan)?.price}{plans[selectedPlan as keyof typeof plans].find(p => p.name === activePlan)?.period}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg bg-white">
                    {/* Stripe Card Element will be integrated here */}
                    <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Your payment information is securely processed
                  </p>
                </div>
              </div>
              
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-[#0C71C3] hover:bg-[#0A5A9C] text-white font-medium py-2.5 h-12 rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Complete Registration & Start Membership"
                  )}
                </Button>
                <p className="text-center text-xs text-gray-500 mt-4">
                  By completing registration, you agree to our <a href="#" className="text-[#0C71C3] hover:underline">Terms of Service</a> and <a href="#" className="text-[#0C71C3] hover:underline">Privacy Policy</a>
                </p>
              </div>
            </form>
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