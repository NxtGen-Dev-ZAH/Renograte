"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface RoleProtectedProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string; // Optional custom redirect for unauthenticated users
}

export default function RoleProtected({ children, allowedRoles, redirectTo = "/login" }: RoleProtectedProps) {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [sessionRefreshed, setSessionRefreshed] = useState<boolean>(false);

  // First, check if we need to refresh the session
  useEffect(() => {
    async function refreshSessionIfNeeded() {
      if (status === 'loading') return;
      
      // If we already tried refreshing, don't try again
      if (sessionRefreshed) return;
      
      // If no session, we'll redirect in the next useEffect
      if (!session) return;
      
      // If user has a role but it's not in allowed roles, try refreshing session once
      const userRole = session.user?.role;
      if (userRole && !allowedRoles.includes(userRole)) {
        // Try refreshing the session to get the latest role
        await update();
        setSessionRefreshed(true);
      }
    }
    
    refreshSessionIfNeeded();
  }, [session, status, update, allowedRoles, sessionRefreshed]);

  // Then verify the role after potential refresh
  useEffect(() => {
    async function verifyRole() {
      if (status === 'loading') return;
      
      // Wait a bit if we just refreshed the session
      if (sessionRefreshed && status === 'authenticated') {
        setIsChecking(false);
      }
      
      if (!session) {
        router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      
      const userRole = session.user?.role;
      if (!userRole || !allowedRoles.includes(userRole)) {
        router.push('/unauthorized');
        return;
      }
      
      setIsVerified(true);
      setIsChecking(false);
    }
    
    verifyRole();
  }, [session, status, router, allowedRoles, redirectTo, sessionRefreshed]);

  if (status === 'loading' || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return isVerified ? <>{children}</> : null;
} 