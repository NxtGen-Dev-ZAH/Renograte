"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { FaEnvelope } from 'react-icons/fa';
import { useRouter } from "next/navigation";

// Zod schema for validation
const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to send reset email");
      }
      
      setEmailSent(true);
      
      toast({
        title: "Email Sent",
        description: "If an account exists with this email, you will receive password reset instructions.",
      });
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
          Forgot Password
        </h1>
        
        <p className="text-center text-black/90 text-sm sm:text-base mb-6">
          {emailSent 
            ? "Check your email for reset instructions" 
            : "Enter your email address to receive a password reset link"}
        </p>

        {!emailSent ? (
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
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
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
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4">
              <p>A password reset link has been sent to your email address.</p>
              <p className="text-sm mt-2">Please check your inbox and spam folder.</p>
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => setEmailSent(false)}
            >
              Try another email
            </Button>
          </div>
        )}

        <div className="text-center mt-6 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="link"
            className="text-[#0C71C3] hover:text-[#0A5A9C] text-sm font-medium"
            onClick={() => router.push("/login")}
          >
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
} 