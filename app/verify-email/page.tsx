import { Suspense } from 'react';
import VerificationStatus from "./verification-status";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function VerifyEmailPage({
  searchParams,
}: PageProps) {
  const token = await searchParams.token as string | undefined;

  return (
    <div className="flex items-center justify-center min-h-screen py-10">
      <Toaster />
      <div className="container flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold">Email Verification</h1>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Verifying your email...</div>}>
            <VerificationStatus token={token} />
          </Suspense>
        </CardContent>
      </Card>
      </div>
    </div>
  );
} 