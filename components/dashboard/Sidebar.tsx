"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  User,
  Home,
  FileText,
  Calculator,
  Video,
  Megaphone,
  Users,
  Gift,
  PhoneCall,
  AlertTriangle,
  FileCheck,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "My Account", href: "/account", icon: User },
  { name: "Create Listing", href: "/add-listing", icon: Plus },
  { name: "My Listings", href: "/dashboard/my-listings", icon: Home },
  { name: "Create Offer", href: "/create-offer", icon: FileText },
  { name: "Term Sheet", href: "/term-sheet", icon: FileText },
  { name: "Calculator", href: "/calculator", icon: Calculator },
  { name: "University", href: "/university", icon: Video },
  { name: "Marketing", href: "/marketing", icon: Megaphone },
  { name: "Directories", href: "/directories", icon: Users },
  { name: "Property Perks", href: "/perks", icon: Gift },
  { name: "Leads", href: "/leads", icon: PhoneCall },
  { name: "Distressed Homes", href: "/distressed", icon: AlertTriangle },
  { name: "Contracts", href: "/contracts", icon: FileCheck },
];

export function Sidebar({ isExpanded, onExpandedChange }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div 
        className={cn(
          "fixed inset-y-0 z-50 flex flex-col transition-all duration-300",
          isExpanded ? "w-72" : "w-20"
        )}
      >
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            {isExpanded ? (
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Renograte Logo"
                  width={200}
                  height={40}
                  className="h-8 w-auto relative z-50"
                />
              </Link>
            ) : (
              <Link href="/" className="flex items-center justify-center">
                <span className="text-xl font-bold text-[#0C71C3] relative z-50 border rounded-full p-2 border-[#0C71C3]">
                  R
                </span>
              </Link>
            )}
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            "group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6",
                            isActive
                              ? "bg-gray-50 text-[#0C71C3] font-semibold"
                              : "text-gray-700 hover:text-[#0C71C3] hover:bg-gray-50"
                          )}
                          title={!isExpanded ? item.name : undefined}
                        >
                          <item.icon
                            className={cn(
                              "h-6 w-6 shrink-0",
                              isActive ? "text-[#0C71C3]" : "text-gray-400 group-hover:text-[#0C71C3]"
                            )}
                            aria-hidden="true"
                          />
                          {isExpanded && <span>{item.name}</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <button
        onClick={() => onExpandedChange(!isExpanded)}
        className={cn(
          "fixed z-50 p-2 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-300",
          isExpanded 
            ? "left-[17rem] top-[1.5rem]" 
            : "left-[4.5rem] top-[1.5rem]"
        )}
      >
        {isExpanded ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
    </>
  );
} 