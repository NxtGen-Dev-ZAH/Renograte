"use client";

import { useState } from "react";
import { subDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { SimpleDateRangePicker } from "@/components/dashboard/SimpleDateRangePicker";
import {
  Home,
  FileText,
  Calculator,
  Video,
  Users,
  PhoneCall,
  Calendar,
  BarChart3,
} from "lucide-react";
import RoleProtected from '@/components/RoleProtected';
import ListingStats from '@/components/dashboard/ListingStats';
import TaskStats from '@/components/dashboard/TaskStats';
import TaskList from '@/components/dashboard/TaskList';
import RecentActivity from '@/components/dashboard/RecentActivity';
import ActiveListings from '@/components/dashboard/ActiveListings';

// Define a simple DateRange interface
interface DateRange {
  from: Date;
  to?: Date;
}

const quickActions = [
  {
    title: "Create Listing",
    description: "Add a new property listing with renovation potential",
    icon: Home,
    href: "/add-listing",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Agreements",
    description: "Draft and manage property term sheets and agreements",
    icon: FileText,
    href: "/agreements",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Calculator",
    description: "Calculate renovation costs and ROI",
    icon: Calculator,
    href: "/calculator",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "University",
    description: "Access exclusive training materials",
    icon: Video,
    href: "/university",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    title: "Directories",
    description: "Connect with verified service providers",
    icon: Users,
    href: "/directories",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
  },
  {
    title: "Leads",
    description: "Manage and track potential clients",
    icon: PhoneCall,
    href: "/leads",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
];

function DashboardPage() {
  // Set default date range to last 30 days
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your properties and tasks
          </p>
        </div>
        <div className="flex items-center gap-4">
          <SimpleDateRangePicker 
            dateRange={dateRange} 
            onDateRangeChange={setDateRange}
            className="hidden md:block" 
          />
          <Button asChild>
            <Link href="/reports">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Reports
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ListingStats />
        <TaskStats />
      </div>

      {/* Task Management */}
      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-4">
          <TaskList />
        </div>
        
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Add</CardTitle>
              <CardDescription>Create new items quickly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/add-listing">
                  <Home className="mr-2 h-4 w-4" />
                  New Listing
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/agreements">
                  <FileText className="mr-2 h-4 w-4" />
                  New Agreement
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => document.getElementById('add-task-button')?.click()}>
                <span className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  New Task
                </span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Card key={action.title} className="hover:shadow-lg transition-shadow">
              <Link href={action.href}>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                  <div className={cn("p-2 rounded-lg", action.bgColor)}>
                    <action.icon className={cn("h-5 w-5", action.color)} />
                  </div>
                  <CardTitle className="text-lg font-medium">
                    {action.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity and Listings */}
      <div className="grid gap-6 md:grid-cols-7">
        <RecentActivity />
        <ActiveListings />
      </div>
      
      {/* Hidden button for task creation */}
      <button id="add-task-button" className="hidden" />
    </div>
  );
}

export default function DashboardProtectedWrapper() {
  return (
    <RoleProtected allowedRoles={['member', 'agent', 'contractor', 'admin']}>
      <DashboardPage />
    </RoleProtected>
  );
} 