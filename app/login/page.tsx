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
// import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
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
  // const { login } = useAuth();
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
    // try {
    setIsLoading(true);
    // await login(data.email, data.password);
    if (
      data.email === "info@renograte.com" &&
      data.password === "123@Reno456"
    ) {
      toast({
        title: "Login Successful",
        description: "Welcome back to Renograte!",
      });
      router.push("/dashboard");
    } else {
      toast({
        title: "Login Failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
    //   toast({
    //     title: "Login Successful",
    //     description: "Welcome back to Renograte!",
    //   });
    //   router.push("/dashboard");
    // } catch (err) {
    //   console.error(err);
    //   toast({
    //     title: "Login Failed",
    //     description: "Please check your credentials and try again.",
    //     variant: "destructive",
    //   });
    // } finally {
    //   setIsLoading(false);
    // }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Dialog defaultOpen onOpenChange={() => router.back()}>
        <DialogContent className="w-[95%] sm:w-[425px] max-w-lg mx-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
              Login to Renograte
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 text-sm sm:text-base">
              Enter your credentials to access your account
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                className={`${
                  errors.email ? "border-red-500" : ""
                } text-sm sm:text-base p-2 sm:p-3`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#0C71C3] hover:bg-[#0C71C3]/90 text-sm sm:text-base p-2 sm:p-3"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            <div className="text-center text-xs sm:text-sm text-gray-500">
              <a
                href="#"
                className="text-[#0C71C3] hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/forgot-password");
                }}
              >
                Forgot your password?
              </a>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginModal;
