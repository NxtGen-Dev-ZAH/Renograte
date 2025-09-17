"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Calculator from "@/components/Calculator";
import Memberchat from "@/components/Memberchat";
import ProfessionalChatbot from "@/components/Chaticon";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import Loading from "@/app/loading";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isDashboardRoute =
    pathname?.includes("/dashboard") ||
    pathname?.startsWith("/account") ||
    pathname?.startsWith("/add-listing") ||
    pathname?.startsWith("/calculator") ||
    pathname?.startsWith("/university") ||
    pathname?.startsWith("/directories") ||
    pathname?.startsWith("/leads") ||
    pathname?.startsWith("/agreements") ||
    pathname?.startsWith("/distressed") ||
    pathname?.startsWith("/my-agreements") ||
    pathname?.startsWith("/perks") ||
    pathname?.startsWith("/marketing") ||
    pathname?.startsWith("/create-termsheet") ||
    pathname?.startsWith("/reports");

  // Check if user has member role (admin, contractor, agent)
  const isMember =
    session?.user?.role &&
    ["admin", "contractor", "agent"].includes(session.user.role);

  if (isDashboardRoute) {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  return (
    <>
      <Header />
      <Suspense fallback={<Loading />}>
        <main>{children}</main>
      </Suspense>
      <Calculator />
      <ProfessionalChatbot />
      <Memberchat />
      <Footer />
      <Toaster />
    </>
  );
}
