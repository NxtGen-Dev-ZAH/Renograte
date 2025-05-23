'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function PaymentSuccess() {
  const [status, setStatus] = useState<'processing' | 'succeeded' | 'failed'>('processing');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const payment_intent = searchParams.get('payment_intent');
    const payment_intent_client_secret = searchParams.get('payment_intent_client_secret');
    const redirect_status = searchParams.get('redirect_status');

    // If we have a redirect_status, use it directly
    if (redirect_status === 'succeeded') {
      setStatus('succeeded');
      return;
    } else if (redirect_status === 'failed') {
      setStatus('failed');
      return;
    }

    // If no payment intent info, check if we came from a direct success
    if (!payment_intent || !payment_intent_client_secret) {
      const success = searchParams.get('success');
      if (success === 'true') {
        setStatus('succeeded');
        return;
      }
      setStatus('failed');
      return;
    }

    // Verify the payment status with the backend
    const verifyPayment = async () => {
      try {
        const response = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payment_intent,
            payment_intent_client_secret,
          }),
        });

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        setStatus(data.status === 'succeeded' ? 'succeeded' : 'failed');
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('failed');
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              {status === 'processing' && 'Processing Payment...'}
              {status === 'succeeded' && 'Payment Successful!'}
              {status === 'failed' && 'Payment Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {status === 'processing' && (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0C71C3] mx-auto"></div>
            )}
            {status === 'succeeded' && (
              <>
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600 mb-6">
                  Thank you for your payment! Your membership has been activated.
                </p>
                <div className="space-y-4">
                  <Button
                    onClick={() => router.push('/dashboard')}
                    className="w-full bg-[#0C71C3] hover:bg-[#0A5A9C] text-white"
                  >
                    Go to Dashboard
                  </Button>
                  <Button
                    onClick={() => router.push('/')}
                    variant="outline"
                    className="w-full"
                  >
                    Go to Homepage
                  </Button>
                </div>
              </>
            )}
            {status === 'failed' && (
              <>
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-6">
                  There was an issue processing your payment. Please try again.
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 