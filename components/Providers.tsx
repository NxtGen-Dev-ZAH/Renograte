"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider 
      refetchInterval={5 * 60} // Refresh session every 5 minutes
      refetchOnWindowFocus={true} // Refresh session when window gets focus
    >
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </SessionProvider>
  );
} 