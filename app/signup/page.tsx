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
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
} from "react-icons/fa";

// Zod schema for validation
const schema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long"),
    phone: z
      .string()
      .regex(
        /^(\+\d{1,3}[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
        "Please enter a valid phone number"
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

const SignUpModal = () => {
  const router = useRouter();

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      // Call the API to register the user
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create account");
      }

      toast({
        title: "Account Created Successfully",
        description:
          result.message || "Please check your email to verify your account.",
      });

      // Use the redirect URL from the API response
      if (result.redirect) {
        router.push(result.redirect);
      } else {
        router.push("/verify-email-notice");
      }
    } catch (error: unknown) {
      console.error("Signup error:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "There was an error creating your account. Please try again.";

      // Handle specific error cases
      if (errorMessage.includes("Email already exists")) {
        toast({
          title: "Registration Failed",
          description:
            "This email is already registered. Please log in instead.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-cyan-100 p-4">
      <Dialog defaultOpen onOpenChange={() => router.back()}>
        <DialogContent className="w-[95%] sm:w-[450px] max-w-lg mx-auto p-0 overflow-hidden border-none shadow-2xl bg-gradient-to-tr from-gray-50 via-cyan-50 to-gray-50">
          <div className="py-4 px-6">
            <div className="flex justify-center mb-4 mt-4">
              <Image
                src="/logo.png"
                alt="Renograte Logo"
                width={180}
                height={40}
                className="h-12 w-fit"
              />
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-center text-black">
              Create Your Account
            </DialogTitle>
            <DialogDescription className="text-center text-black/90 text-sm sm:text-base">
              Join Renograte and start transforming properties
            </DialogDescription>
          </div>

          <div className="p-6 py-0 pb-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <FaUser className="text-[#0C71C3]" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    className={`${
                      errors.name
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "focus-visible:ring-[#0C71C3]"
                    } text-sm rounded-md border-gray-300 p-3`}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <FaEnvelope className="text-[#0C71C3]" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className={`${
                      errors.email
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "focus-visible:ring-[#0C71C3]"
                    } text-sm rounded-md border-gray-300 p-3`}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <FaLock className="text-[#0C71C3]" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      className={`${
                        errors.password
                          ? "border-red-500 focus-visible:ring-red-500"
                          : "focus-visible:ring-[#0C71C3]"
                      } pr-10 text-sm rounded-md border-gray-300 p-3`}
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <FaEyeSlash size={16} />
                      ) : (
                        <FaEye size={16} />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <FaLock className="text-[#0C71C3]" />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className={`${
                        errors.confirmPassword
                          ? "border-red-500 focus-visible:ring-red-500"
                          : "focus-visible:ring-[#0C71C3]"
                      } pr-10 text-sm rounded-md border-gray-300 p-3`}
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash size={16} />
                      ) : (
                        <FaEye size={16} />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <FaPhone className="text-[#0C71C3]" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    className={`${
                      errors.phone
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "focus-visible:ring-[#0C71C3]"
                    } text-sm rounded-md border-gray-300 p-3`}
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 pb-2">
                <Button
                  type="submit"
                  className="w-full bg-[#0C71C3] hover:bg-[#0A5A9C] text-white font-medium py-2.5 rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <p className="text-center text-xs text-gray-500 mt-4">
                  By creating an account, you agree to our{" "}
                  <a href="#" className="text-[#0C71C3] hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-[#0C71C3] hover:underline">
                    Privacy Policy
                  </a>
                </p>
              </div>

              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <a
                    href="#"
                    className="text-[#0C71C3] hover:text-[#0A5A9C] font-medium hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push("/login");
                    }}
                  >
                    Sign In
                  </a>
                </p>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SignUpModal;
