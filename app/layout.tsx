import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Calculator from "@/components/Calculator";
import Memberchat from "@/components/Memberchat";
import ProfessionalChatbot from "@/components/Chaticon";
import { Suspense } from "react";
import Loading from "./loading";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Optimize font loading
});

export const metadata: Metadata = {
  title: "Renograte",
  description: "Renograte - Revolutionizing Real Estate Renovation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} text-black bg-white overflow-x-hidden`}
      >
        <AuthProvider>
          <Header />
          <Suspense fallback={<Loading />}>
            <main>{children}</main>
          </Suspense>
          <Suspense>
            <Calculator />
            <Memberchat />
            <ProfessionalChatbot />
          </Suspense>
          <Footer />
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
