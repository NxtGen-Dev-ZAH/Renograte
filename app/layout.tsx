import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";
import { RootLayoutContent } from "@/components/RootLayoutContent";

const inter = Inter({
  subsets: ["latin"],
  display: "swap", 
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
      <body className={`${inter.className} text-black bg-white overflow-x-hidden`}>
        <AuthProvider>
          <RootLayoutContent>{children}</RootLayoutContent>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
