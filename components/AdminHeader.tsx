"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, ListFilter, FileText, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Leads", href: "/admin/leads", icon: Users },
  { name: "Listings", href: "/admin/listings", icon: ListFilter },
  { name: "Offers", href: "/admin/offers", icon: FileText },
  { name: "University", href: "/admin/courses", icon: BookOpen },
];

export default function AdminHeader() {
  const pathname = usePathname();
  
  return (
    <header className="bg-white border-b sticky top-0 z-30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/admin" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">Renograte Admin</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/admin" && pathname.startsWith(item.href));
                
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium flex items-center",
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="flex items-center">
            <Link 
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center"
            >
              <Home className="h-4 w-4 mr-1" />
              Back to Site
            </Link>
          </div>
        </div>
        
        {/* Mobile navigation */}
        <div className="md:hidden py-2 overflow-x-auto scrollbar-hide">
          <div className="flex space-x-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/admin" && pathname.startsWith(item.href));
                
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-xs font-medium flex flex-col items-center whitespace-nowrap",
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-4 w-4 mb-1" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
} 