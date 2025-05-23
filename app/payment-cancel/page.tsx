'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';

export default function PaymentCancel() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Payment Cancelled
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">
              Your payment was cancelled. No charges were made to your account.
            </p>
            <div className="space-y-4">
              <Button
                onClick={() => router.push('/become-member')}
                className="w-full bg-[#0C71C3] hover:bg-[#0A5A9C] text-white"
              >
                Return to Membership Page
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full"
              >
                Go to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 