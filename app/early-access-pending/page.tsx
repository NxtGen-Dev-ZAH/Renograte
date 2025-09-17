"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClockIcon, CheckCircleIcon, AlertCircleIcon } from "lucide-react";

export default function EarlyAccessPendingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [memberStatus, setMemberStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      if (!session?.user?.id) return;

      try {
        const response = await fetch("/api/user/member-status");
        if (response.ok) {
          const data = await response.json();
          setMemberStatus(data);

          // If status is no longer pending, redirect appropriately
          if (data.status === "active") {
            router.push("/dashboard");
          } else if (data.status === "rejected") {
            router.push("/early-access-rejected");
          }
        }
      } catch (error) {
        console.error("Error checking status:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (session?.user?.id) {
      checkStatus();
    }
  }, [session?.user?.id, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
            <div className="mx-auto mb-4 p-3 bg-yellow-100 rounded-full w-fit">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Application Under Review
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Thank you for your early access application!
              </h3>
              <p className="text-gray-600 mb-4">
                Your application is currently being reviewed by our admin team.
                This process typically takes 24-48 hours.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">
                    What happens next?
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Our team will review your application details</li>
                    <li>
                      • We'll verify your credentials and business information
                    </li>
                    <li>
                      • You'll receive an email notification once approved
                    </li>
                    <li>
                      • Upon approval, you'll get full access to the platform
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-900 mb-1">
                    Important Note
                  </h4>
                  <p className="text-sm text-yellow-800">
                    You cannot access the dashboard until your application is
                    approved. Please check back later or wait for our email
                    notification.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="flex-1"
              >
                Check Status
              </Button>
              <Button
                onClick={() => router.push("/")}
                className="flex-1 bg-[#0C71C3] hover:bg-[#0A5A9C]"
              >
                Return to Home
              </Button>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-500">
                Questions? Contact us at{" "}
                <a
                  href="mailto:support@renograte.com"
                  className="text-[#0C71C3] hover:underline"
                >
                  support@renograte.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
