"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa';
import { signIn } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

// Zod schema for validation
const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type FormData = z.infer<typeof schema>;

const LoginModal = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Check for message parameter when component mounts
  useEffect(() => {
    const message = searchParams.get("message");
    if (message === "membership_activated") {
      toast({
        title: "Membership Activated",
        description: "Your membership has been activated successfully. Please sign in to access your dashboard.",
        variant: "default",
      });
    }
  }, [searchParams, toast]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    
    try {
      const { email, password } = data;
      
      // Get the returnUrl or callbackUrl before login
      const returnUrl = searchParams.get("returnUrl") || searchParams.get("callbackUrl");
      
      // Login with credentials
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        throw new Error(result.error);
      }
      
      // Successful login
      toast({
        title: "Login Successful",
        description: "Welcome to Renograte!",
      });
      
      // Fetch current session to get user role - use await to ensure we have the latest data
      // Make a direct fetch to refresh-session to force a refresh first
      await fetch('/api/auth/refresh-session', { cache: 'no-store' });
      
      // Now get the refreshed session data
      const sessionResponse = await fetch('/api/auth/session', { cache: 'no-store' });
      const sessionData = await sessionResponse.json();
      const userRole = sessionData?.user?.role;
      
      console.log("User role after login:", userRole);
      
      // Add a small delay to ensure session is fully established
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Route based on user role and returnUrl
      if (userRole === 'admin') {
        // If admin, go to admin page - use replace for cleaner navigation history
        router.replace('/admin');
      } else if (userRole === 'member' || userRole === 'agent' || userRole === 'contractor') {
        // If member, agent, or contractor, check if there's a return URL
        if (returnUrl && !returnUrl.includes('admin')) {
          router.replace(returnUrl);
        } else {
          // Default to dashboard for members
          router.replace('/dashboard');
        }
      } else if (userRole === 'user') {
        // Regular users can access listings but not dashboard
        if (returnUrl && (
            returnUrl.includes('/renograte-listings') || 
            returnUrl.includes('/properties')
          )) {
          router.replace(returnUrl);
        } else {
          // Default to listings page for regular users
          router.replace('/properties');
        }
      } else {
        // Default for unknown roles (fallback to home)
        router.replace('/');
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Custom close handler for the dialog/modal
  const handleDialogClose = () => {
    const callbackUrl = searchParams.get("callbackUrl") || searchParams.get("returnUrl") || "/";
    // List of protected routes (add more as needed)
    const protectedRoutes = [
      "/properties",
      "/listings",
      "/dashboard",
      "/admin",
      "/listings/renograte-listings",
      "/listings/property",
      "/listings/distressed-homes"
    ];
    // If callbackUrl is protected, go to home instead
    if (protectedRoutes.some(route => callbackUrl.startsWith(route))) {
      router.push("/");
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-cyan-100 p-4">
      <Dialog defaultOpen onOpenChange={(open) => { if (!open) handleDialogClose(); }}>
        <DialogContent className="w-[95%] sm:w-[425px] max-w-lg mx-auto p-0 overflow-hidden border-none shadow-2xl bg-gradient-to-tr from-gray-50 via-cyan-50 to-gray-50">
          <div className="p-6">
            <div className="flex justify-center mb-4">
              <Image 
                className="mx-auto w-44 h-auto" 
                src="/logo.png" 
                alt="Renograte Logo" 
                width={1520} 
                height={164}
              />
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-center text-black">
              Welcome Back
            </DialogTitle>
            <DialogDescription className="text-center text-black/90 text-sm sm:text-base">
              Log in to access your Renograte dashboard
            </DialogDescription>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <FaEnvelope className="text-[#0C71C3]" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                  className={`${
                    errors.email ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-[#0C71C3]"
                  } text-sm rounded-md border-gray-300 p-3`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                  <FaLock className="text-[#0C71C3]" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...register("password")}
                    className={`${
                      errors.password ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-[#0C71C3]"
                    } pr-10 text-sm rounded-md border-gray-300 p-3`}
                  />
                  <button 
                    type="button" 
                    onClick={togglePasswordVisibility} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-[#0C71C3] hover:bg-[#0A5A9C] text-white font-medium py-2.5 rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Logging in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>

              <div className="text-center space-y-4 pt-1">
                <a
                  href="#"
                  className="text-[#0C71C3] hover:text-[#0A5A9C] text-sm font-medium hover:underline transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/forgot-password");
                  }}
                >
                  Forgot your password?
                </a>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">Don't have an account yet?</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-[#0C71C3] text-[#0C71C3] hover:bg-[#0C71C3] hover:text-white transition-all duration-200 font-medium"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push("/signup", { scroll: false });
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginModal;
