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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    async function verifyRole() {
      if (status === 'loading') return;
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
  }, [session, status, router, allowedRoles, redirectTo]);

  if (status === 'loading' || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return isVerified ? <>{children}</> : null;
} 