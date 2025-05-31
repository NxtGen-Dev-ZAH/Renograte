"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <ShieldAlert className="h-16 w-16 text-orange-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Membership Required
        </h1>
        
        <p className="text-gray-600 mb-6">
          This area is restricted to members only. Please upgrade your account to access all features and benefits.
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={() => router.push('/become-member')}
            className="w-full bg-[#0C71C3] hover:bg-[#0A5A9C]"
          >
            Become a Member
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => router.push('/')}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
} 