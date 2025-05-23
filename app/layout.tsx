"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { RootLayoutContent } from "@/components/RootLayoutContent";

const inter = Inter({
  subsets: ["latin"],
  display: "swap", 
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Renograte - Revolutionizing Real Estate Renovation</title>
        <meta name="description" content="Renograte - Revolutionizing Real Estate Renovation" />
      </head>
      <body className={`${inter.className} text-black bg-white overflow-x-hidden`}>
        <Providers>
          <RootLayoutContent>{children}</RootLayoutContent>
        </Providers>
      </body>
    </html>
  );
}
