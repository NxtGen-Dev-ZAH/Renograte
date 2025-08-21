import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailNoticePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="container flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Mail className="mx-auto h-12 w-12 text-blue-500 mb-4" />
            <h1 className="text-2xl font-bold">Verify Your Email</h1>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Please check your email for a verification link. You need to verify your email address before accessing this page.
            </p>
            <p className="text-sm text-gray-500">
              If you haven&apos;t received the email, please check your spam folder.
            </p>
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Back to Login</Link>
              </Button>
              <p className="text-sm text-gray-500">
                Need help? Contact our support team.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}