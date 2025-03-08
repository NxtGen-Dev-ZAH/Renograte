"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Zod schema for validation
const schema = z
  .object({
    name: z.string().min(5, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters long"),
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
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:8000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Signup failed");
      }

      toast({
        title: "Account Created",
        description: "Please check your email to verify your account.",
      });
      router.back();
    } catch (error) {
      console.error(error);
      toast({
        title: "Signup Failed",
        description:
          "There was an error creating your account. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white bg-opacity-50 backdrop-blur-lg rounded-lg shadow-lg p-4 sm:p-8 w-full max-w-md">
        <Dialog defaultOpen onOpenChange={() => router.back()}>
          <DialogContent className="w-[95%] sm:w-[425px] max-w-lg mx-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
                Sign Up
              </DialogTitle>
              <DialogDescription className="text-center text-gray-600 text-sm sm:text-base">
                Please fill in the following fields to create a new account.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              <div className="grid gap-3 sm:gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="font-semibold text-sm sm:text-base">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full border border-gray-300 rounded-md p-2 sm:p-3 text-sm sm:text-base"
                    {...register("name")}
                  />
                  {errors.name && (
                    <span className="text-red-500 text-xs sm:text-sm">
                      {errors.name.message?.toString()}
                    </span>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="font-semibold text-sm sm:text-base">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="w-full border border-gray-300 rounded-md p-2 sm:p-3 text-sm sm:text-base"
                    {...register("email")}
                  />
                  {errors.email && (
                    <span className="text-red-500 text-xs sm:text-sm">
                      {errors.email.message?.toString()}
                    </span>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="font-semibold text-sm sm:text-base">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="w-full border border-gray-300 rounded-md p-2 sm:p-3 text-sm sm:text-base"
                    {...register("password")}
                  />
                  {errors.password && (
                    <span className="text-red-500 text-xs sm:text-sm">
                      {errors.password.message?.toString()}
                    </span>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword" className="font-semibold text-sm sm:text-base">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    className="w-full border border-gray-300 rounded-md p-2 sm:p-3 text-sm sm:text-base"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <span className="text-red-500 text-xs sm:text-sm">
                      {errors.confirmPassword.message?.toString()}
                    </span>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="font-semibold text-sm sm:text-base">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    className="w-full border border-gray-300 rounded-md p-2 sm:p-3 text-sm sm:text-base"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <span className="text-red-500 text-xs sm:text-sm">
                      {errors.phone.message?.toString()}
                    </span>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="w-full bg-[#0C71C3] hover:bg-[#0C71C3]/90 text-sm sm:text-base p-2 sm:p-3"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SignUpModal;
