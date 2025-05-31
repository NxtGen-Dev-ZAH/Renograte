"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useRouter, useSearchParams } from "next/navigation";

// Zod schema for validation
const schema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isTokenChecked, setIsTokenChecked] = useState(false);
  
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsTokenChecked(true);
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-reset-token?token=${token}`);
        
        if (response.ok) {
          setIsValidToken(true);
        }
      } catch (error) {
        console.error("Error verifying token:", error);
      } finally {
        setIsTokenChecked(true);
      }
    };

    verifyToken();
  }, [token]);

  const onSubmit = async (data: FormData) => {
    if (!token) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          token,
          password: data.password 
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to reset password");
      }
      
      setIsSuccess(true);
      
      toast({
        title: "Password Reset Successful",
        description: "Your password has been reset successfully. You can now log in with your new password.",
      });
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (!isTokenChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-cyan-100 p-4">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-[#0C71C3] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  if (!token || !isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-cyan-100 p-4">
        <div className="w-[95%] sm:w-[425px] max-w-lg mx-auto p-6 rounded-lg shadow-2xl bg-gradient-to-tr from-gray-50 via-cyan-50 to-gray-50">
          <div className="flex justify-center mb-4">
            <Image 
              className="mx-auto w-44 h-auto" 
              src="/logo.png" 
              alt="Renograte Logo" 
              width={1520} 
              height={164}
            />
          </div>
          
          <h1 className="text-xl sm:text-2xl font-bold text-center text-black mb-2">
            Invalid or Expired Link
          </h1>
          
          <p className="text-center text-black/90 text-sm sm:text-base mb-6">
            This password reset link is invalid or has expired.
          </p>
          
          <div className="text-center mt-6">
            <Button
              type="button"
              className="bg-[#0C71C3] hover:bg-[#0A5A9C] text-white font-medium"
              onClick={() => router.push("/forgot-password")}
            >
              Request New Reset Link
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-cyan-100 p-4">
      <div className="w-[95%] sm:w-[425px] max-w-lg mx-auto p-6 rounded-lg shadow-2xl bg-gradient-to-tr from-gray-50 via-cyan-50 to-gray-50">
        <div className="flex justify-center mb-4">
          <Image 
            className="mx-auto w-44 h-auto" 
            src="/logo.png" 
            alt="Renograte Logo" 
            width={1520} 
            height={164}
          />
        </div>
        
        <h1 className="text-xl sm:text-2xl font-bold text-center text-black mb-2">
          Reset Your Password
        </h1>
        
        <p className="text-center text-black/90 text-sm sm:text-base mb-6">
          {isSuccess 
            ? "Your password has been reset successfully" 
            : "Please enter your new password"}
        </p>

        {!isSuccess ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                <FaLock className="text-[#0C71C3]" />
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  {...register("password")}
                  className={`${
                    errors.password ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-[#0C71C3]"
                  } pr-10 text-sm rounded-md border-gray-300 p-3`}
                  disabled={isLoading}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                <FaLock className="text-[#0C71C3]" />
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  {...register("confirmPassword")}
                  className={`${
                    errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-[#0C71C3]"
                  } pr-10 text-sm rounded-md border-gray-300 p-3`}
                  disabled={isLoading}
                />
                <button 
                  type="button" 
                  onClick={toggleConfirmPasswordVisibility} 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
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
                    <span>Resetting Password...</span>
                  </div>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4">
              <p>Your password has been reset successfully.</p>
              <p className="text-sm mt-2">Redirecting to login page...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 