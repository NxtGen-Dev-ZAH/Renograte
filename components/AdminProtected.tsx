"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Client component for admin protection
export default function AdminProtected({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    async function verifyAdmin() {
      // Only proceed if session is fully loaded
      if (status === 'loading') return;
      
      // If no session, redirect to login
      if (!session) {
        router.push('/login?callbackUrl=/admin');
        return;
      }
      
      try {
        // Verify admin status from API
        const response = await fetch('/api/auth/admin');
        
        if (!response.ok) {
          // If not authorized, redirect
          router.push('/unauthorized');
          return;
        }
        
        // If successful, set verified
        setIsVerified(true);
      } catch (error) {
        console.error('Admin verification error:', error);
        router.push('/unauthorized');
      } finally {
        setIsChecking(false);
      }
    }
    
    verifyAdmin();
  }, [session, status, router]);

  // Show loading state while checking
  if (status === 'loading' || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // If verified as admin, render children
  return isVerified ? <>{children}</> : null;
} 