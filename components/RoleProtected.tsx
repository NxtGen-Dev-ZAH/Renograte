"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface RoleProtectedProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string; // Optional custom redirect for unauthenticated users
}

interface MemberStatus {
  status: string;
  isEarlyAccess: boolean;
}

export default function RoleProtected({
  children,
  allowedRoles,
  redirectTo = "/login",
}: RoleProtectedProps) {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [sessionRefreshed, setSessionRefreshed] = useState<boolean>(false);
  const [memberStatus, setMemberStatus] = useState<MemberStatus | null>(null);

  // Check member profile status for early access users
  useEffect(() => {
    async function checkMemberStatus() {
      if (!session?.user?.id) return;

      try {
        const response = await fetch("/api/user/member-status");
        if (response.ok) {
          const data = await response.json();
          setMemberStatus(data);
        }
      } catch (error) {
        console.error("Error checking member status:", error);
      }
    }

    if (session?.user?.id) {
      checkMemberStatus();
    }
  }, [session?.user?.id]);

  // First, check if we need to refresh the session
  useEffect(() => {
    async function refreshSessionIfNeeded() {
      if (status === "loading") return;

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

  // Then verify the role and member status after potential refresh
  useEffect(() => {
    async function verifyAccess() {
      if (status === "loading") return;

      // Wait a bit if we just refreshed the session
      if (sessionRefreshed && status === "authenticated") {
        setIsChecking(false);
      }

      if (!session) {
        router.push(
          `${redirectTo}?callbackUrl=${encodeURIComponent(window.location.pathname)}`
        );
        return;
      }

      const userRole = session.user?.role;
      if (!userRole || !allowedRoles.includes(userRole)) {
        router.push("/unauthorized");
        return;
      }

      // Additional check for early access users
      if (memberStatus?.isEarlyAccess) {
        if (memberStatus.status === "pending") {
          // Redirect to pending approval page
          router.push("/early-access-pending");
          return;
        } else if (memberStatus.status === "rejected") {
          // Redirect to rejection page
          router.push("/early-access-rejected");
          return;
        }
      }

      setIsVerified(true);
      setIsChecking(false);
    }

    verifyAccess();
  }, [
    session,
    status,
    router,
    allowedRoles,
    redirectTo,
    sessionRefreshed,
    memberStatus,
  ]);

  if (status === "loading" || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return isVerified ? <>{children}</> : null;
}
