import { useEffect, useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { Button } from '@/components/ui/button';

interface StripePaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const PaymentForm = ({ clientSecret, onSuccess, onError }: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message || 'An error occurred during payment');
      } else {
        onSuccess();
      }
    } catch (err) {
      onError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PaymentElement 
        options={{
          paymentMethodOrder: ['card'],
          defaultValues: {
            billingDetails: {
              name: 'Jenny Rosen',
            },
          },
        }}
      />
      <Button
        onClick={handlePaymentSubmit}
        disabled={!stripe || isLoading}
        className="w-full bg-[#0C71C3] hover:bg-[#0A5A9C] text-white"
      >
        {isLoading ? 'Processing...' : 'Pay Now'}
      </Button>
    </div>
  );
};

export const StripePaymentForm = (props: StripePaymentFormProps) => {
  return (
    <Elements 
      stripe={stripePromise} 
      options={{ 
        clientSecret: props.clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#0C71C3',
            colorBackground: '#ffffff',
            colorText: '#1a1a1a',
            colorDanger: '#df1b41',
            fontFamily: 'system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '4px',
          },
        },
      }}
    >
      <PaymentForm {...props} />
    </Elements>
  );
}; 