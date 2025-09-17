"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircleIcon, AlertTriangleIcon, RefreshCwIcon } from "lucide-react";

export default function EarlyAccessRejectedPage() {
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

          // If status is no longer rejected, redirect appropriately
          if (data.status === "active") {
            router.push("/dashboard");
          } else if (data.status === "pending") {
            router.push("/early-access-pending");
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
          <CardHeader className="text-center bg-gradient-to-r from-red-50 to-orange-50 border-b">
            <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
              <XCircleIcon className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Application Not Approved
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                We're sorry, but your early access application was not approved.
              </h3>
              <p className="text-gray-600 mb-4">
                Don't worry - you can still join Renograte through our standard
                membership plans.
              </p>
            </div>

            {memberStatus?.adminFeedback && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Admin Feedback:
                </h4>
                <p className="text-sm text-gray-700">
                  {memberStatus.adminFeedback}
                </p>
              </div>
            )}

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-900 mb-1">
                    What this means:
                  </h4>
                  <ul className="text-sm text-red-800 space-y-1">
                    <li>• Your early access application was not approved</li>
                    <li>• You no longer have access to the dashboard</li>
                    <li>• Your account has been reset to basic user status</li>
                    <li>• You can still join through our standard plans</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <RefreshCwIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">
                    Next Steps:
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Review our standard membership plans</li>
                    <li>• Consider upgrading to a paid membership</li>
                    <li>• Contact support if you have questions</li>
                    <li>• You can reapply for early access in the future</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={() => router.push("/become-member")}
                className="flex-1 bg-[#0C71C3] hover:bg-[#0A5A9C]"
              >
                View Membership Plans
              </Button>
              <Button
                onClick={() => router.push("/early-access")}
                variant="outline"
                className="flex-1"
              >
                Reapply for Early Access
              </Button>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-500">
                Need help? Contact us at{" "}
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
