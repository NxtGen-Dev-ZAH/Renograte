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

export function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardRoute = pathname?.includes("/dashboard") || pathname?.startsWith("/account") || pathname?.startsWith("/add-listing") || pathname?.startsWith("/calculator") || pathname?.startsWith("/university") || pathname?.startsWith("/directories") || pathname?.startsWith("/leads") || pathname?.startsWith("/term-sheet") || pathname?.startsWith("/distressed") || pathname?.startsWith("/contracts") || pathname?.startsWith("/perks") || pathname?.startsWith("/marketing")  || pathname?.startsWith("/create-offer") || pathname?.startsWith("/reports") ;

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
      <Memberchat />
      <ProfessionalChatbot />
      <Footer />
      <Toaster />
    </>
  );
} 