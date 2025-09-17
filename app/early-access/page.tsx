"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckIcon, StarIcon, ClockIcon, UsersIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  company: z.string().optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  businessType: z.string().min(1, "Business type is required"),
  licenseNumber: z.string().optional(),
  role: z.enum(["agent", "contractor"], {
    errorMap: () => ({ message: "Please select your role" }),
  }),
});

type FormData = z.infer<typeof formSchema>;

interface QuotaStatus {
  role: string;
  currentCount: number;
  maxCount: number;
  available: number;
  isAvailable: boolean;
  percentage: number;
}

export default function EarlyAccessPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus[]>([]);
  const [isEarlyAccessActive, setIsEarlyAccessActive] = useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      company: "",
      phone: "",
      businessType: "",
      licenseNumber: "",
      role: undefined,
    },
  });

  // Fetch quota status on component mount
  useEffect(() => {
    fetchQuotaStatus();
  }, []);

  // Auto-fill form with user data if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      form.setValue("name", user.name || "");
      form.setValue("email", user.email || "");
    }
  }, [isAuthenticated, user, form]);

  const fetchQuotaStatus = async () => {
    try {
      const response = await fetch("/api/early-access/quota");
      const data = await response.json();

      if (response.ok) {
        setQuotaStatus(data.quotas);
        setIsEarlyAccessActive(data.isEarlyAccessActive);
      }
    } catch (error) {
      console.error("Error fetching quota status:", error);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/early-access/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      toast({
        title: "Early Access Application Submitted! ⏳",
        description: result.message,
      });

      // Update quota status
      await fetchQuotaStatus();

      // Redirect to login with success message
      router.push(
        `/login?message=early_access_registered&email=${encodeURIComponent(data.email)}`
      );
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Registration Failed",
        description:
          error instanceof Error ? error.message : "An error occurred",
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
    "Other",
  ];

  const getQuotaForRole = (role: string) => {
    return quotaStatus.find((q) => q.role === role);
  };

  const agentQuota = getQuotaForRole("agent");
  const contractorQuota = getQuotaForRole("contractor");

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
            <StarIcon className="h-4 w-4" />
            Limited Time Early Access
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Join Renograte Free for 1 Year
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            Be among the first <strong>500 agents</strong> and{" "}
            <strong>50 contractors</strong> to join Renograte with full access
            for an entire year - completely free!
          </p>

          {/* Progress Counters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Real Estate Agents
                </span>
                <UsersIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {agentQuota
                  ? `${agentQuota.currentCount}/${agentQuota.maxCount}`
                  : "0/500"}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${agentQuota?.percentage || 0}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {agentQuota
                  ? `${agentQuota.available} spots remaining`
                  : "500 spots available"}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Contractors
                </span>
                <UsersIcon className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {contractorQuota
                  ? `${contractorQuota.currentCount}/${contractorQuota.maxCount}`
                  : "0/50"}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${contractorQuota?.percentage || 0}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {contractorQuota
                  ? `${contractorQuota.available} spots remaining`
                  : "50 spots available"}
              </div>
            </div>
          </div>
        </div>

        {/* Early Access Benefits */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            What You Get with Early Access
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <ClockIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">1 Year Free Access</h3>
                <p className="text-sm text-gray-600">
                  Full platform access for 12 months at no cost
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <StarIcon className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Exclusive Access</h3>
                <p className="text-sm text-gray-600">
                  Be among the first to experience Renograte's features
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <CheckIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">All Features Included</h3>
                <p className="text-sm text-gray-600">
                  Complete access to all tools and resources
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Registration Form */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              Claim Your Early Access Spot
            </CardTitle>
            <CardDescription>
              Fill in your details below to apply for early access. Your
              application will be reviewed by our admin team.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {!isEarlyAccessActive ? (
              <div className="text-center py-8">
                <div className="text-red-600 text-lg font-semibold mb-2">
                  Early Access Spots Are Full
                </div>
                <p className="text-gray-600 mb-4">
                  All early access spots have been claimed. You can still join
                  Renograte with our standard plans.
                </p>
                <Button
                  onClick={() => router.push("/become-member")}
                  className="bg-[#0C71C3] hover:bg-[#0A5A9C]"
                >
                  View Standard Plans
                </Button>
              </div>
            ) : (
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name*
                    </Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      className="focus-visible:ring-[#0C71C3]"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address*
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      className="focus-visible:ring-[#0C71C3]"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password*
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      {...form.register("password")}
                      className="focus-visible:ring-[#0C71C3]"
                      placeholder="Create a secure password"
                    />
                    {form.formState.errors.password && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm font-medium">
                      Company Name
                    </Label>
                    <Input
                      id="company"
                      {...form.register("company")}
                      className="focus-visible:ring-[#0C71C3]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number*
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...form.register("phone")}
                      className="focus-visible:ring-[#0C71C3]"
                    />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-medium">
                      Your Role*
                    </Label>
                    <Select
                      value={form.watch("role")}
                      onValueChange={(value) =>
                        form.setValue("role", value as "agent" | "contractor")
                      }
                    >
                      <SelectTrigger className="focus:ring-[#0C71C3]">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agent">Real Estate Agent</SelectItem>
                        <SelectItem value="contractor">Contractor</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.role && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.role.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="businessType"
                      className="text-sm font-medium"
                    >
                      Business Type*
                    </Label>
                    <Select
                      value={form.watch("businessType")}
                      onValueChange={(value) =>
                        form.setValue("businessType", value)
                      }
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
                      <p className="text-sm text-red-500">
                        {form.formState.errors.businessType.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label
                      htmlFor="licenseNumber"
                      className="text-sm font-medium"
                    >
                      License Number (if applicable)
                    </Label>
                    <Input
                      id="licenseNumber"
                      {...form.register("licenseNumber")}
                      className="focus-visible:ring-[#0C71C3]"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Submitting Application..."
                    : "Submit Early Access Application"}
                </Button>
              </form>
            )}

            <div className="pt-4">
              <p className="text-center text-xs text-gray-500 mt-4">
                By registering, you agree to our{" "}
                <a href="/terms" className="text-[#0C71C3] hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-[#0C71C3] hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Trust Signals */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            Join thousands of real estate professionals already using Renograte
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
            {/* Replace with actual partner/client logos */}
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="w-32 h-12 bg-gray-200 rounded-md"></div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
