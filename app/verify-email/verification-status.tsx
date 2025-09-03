import { CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import VerificationToast from "./verification-toast";

async function verifyEmail(token: string) {
  try {
    // Use a dynamic base URL based on environment
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_APP_URL || "https://www.renograte.com"
        : "http://localhost:3000";

    const response = await fetch(
      `${baseUrl}/api/auth/verify-email?token=${token}`,
      {
        method: "GET",
        cache: "no-store", // Disable caching for this request
      }
    );

    // Check if response is OK before parsing JSON
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      return { error: `Verification failed: ${response.status}` };
    }

    return await response.json();
  } catch (error) {
    console.error("Error verifying email:", error);
    return { error: "Failed to verify email" };
  }
}

export default async function VerificationStatus({
  token,
}: {
  token?: string;
}) {
  if (!token) {
    return (
      <>
        <VerificationToast
          status="invalid"
          message="The verification link is invalid or has expired."
        />
        <div className="text-center space-y-4">
          <XCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold">Invalid Verification Link</h2>
          <p className="text-gray-600">
            The verification link is invalid or has expired. This can happen if:
          </p>
          <ul className="text-sm text-gray-500 text-left max-w-sm mx-auto space-y-1">
            <li>• The link was copied incorrectly</li>
            <li>• The verification link has expired (30 minutes)</li>
            <li>• You've already verified your email</li>
          </ul>
          <div className="space-y-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/verify-email-notice">Resend Verification Email</Link>
            </Button>
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  const result = await verifyEmail(token);

  if (result.error) {
    return (
      <>
        <VerificationToast status="error" message={result.error} />
        <div className="text-center space-y-4">
          <XCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold">Verification Failed</h2>
          <p className="text-gray-600">{result.error}</p>
          <div className="space-y-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/verify-email-notice">Resend Verification Email</Link>
            </Button>
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <VerificationToast
        status="success"
        message="Your email has been verified successfully."
      />
      <div className="text-center space-y-4">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <h2 className="text-xl font-semibold">Email Verified Successfully</h2>
        <p className="text-gray-600">
          Your email has been verified. You can now log in to your account and
          access all features.
        </p>
        <div className="space-y-2">
          <Button asChild className="w-full bg-green-600 hover:bg-green-700">
            <Link href="/login">Sign In Now</Link>
          </Button>
          <p className="text-sm text-gray-500">
            Welcome to Renograte! We're excited to have you on board.
          </p>
        </div>
      </div>
    </>
  );
}
