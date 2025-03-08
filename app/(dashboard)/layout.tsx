"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      
      if (window.innerWidth < 1024) {
        setIsSidebarExpanded(false);
      }
    };
    
    // Check on mount
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={cn("min-h-screen bg-gray-50", isMobile ? "mobile-view" : "desktop-view")}>
      <DashboardHeader onMenuClick={() => setIsSidebarExpanded(!isSidebarExpanded)} />
      <div className="flex">
        <Sidebar 
          isExpanded={isSidebarExpanded} 
          onExpandedChange={setIsSidebarExpanded}
        />
        <main 
          className={cn(
            "flex-1 p-4 sm:p-6 transition-all duration-300",
            isSidebarExpanded ? "lg:ml-72" : "lg:ml-20",
            "mt-16" // Account for fixed header
          )}
        >
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 