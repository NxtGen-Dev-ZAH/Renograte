"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Home,
  FileText,
  Calculator,
  Video,
  Users,
  PhoneCall,
  TrendingUp,
  ListChecks,
  Building,
  Activity,
  BarChart3,
  Calendar,
} from "lucide-react";

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
    title: "Term Sheet",
    description: "Draft and manage property term sheets",
    icon: FileText,
    href: "/term-sheet",
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

const stats = [
  {
    title: "Active Listings",
    value: "12",
    change: "+2.1%",
    icon: Building,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Total Leads",
    value: "24",
    change: "+5.4%",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Pending Tasks",
    value: "7",
    change: "-1.2%",
    icon: ListChecks,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Engagement Rate",
    value: "87%",
    change: "+3.1%",
    icon: Activity,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
];

const recentActivity = [
  {
    action: "New Listing Added",
    description: "123 Main Street has been listed",
    timestamp: "5 minutes ago",
  },
  {
    action: "Lead Assigned",
    description: "New buyer lead assigned to you",
    timestamp: "2 hours ago",
  },
  {
    action: "Term Sheet Updated",
    description: "Changes made to 456 Oak Avenue term sheet",
    timestamp: "4 hours ago",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your properties
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Select Date Range
          </Button>
          <Button>
            <BarChart3 className="mr-2 h-4 w-4" />
            View Reports
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-full", stat.bgColor)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={cn(
                "text-xs",
                stat.change.startsWith("+") ? "text-green-600" : "text-red-600"
              )}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
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

      {/* Recent Activity and Additional Info */}
      <div className="grid gap-4 md:grid-cols-7">
        {/* Recent Activity - Wider */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 rounded-lg border p-3"
                >
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activity.timestamp}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Listings Preview - Narrower */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Active Listings</CardTitle>
            <CardDescription>Your current property listings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border p-3">
                <div className="h-12 w-12 rounded-lg bg-gray-100" />
                <div className="flex-1 space-y-1">
                  <p className="font-medium">123 Main Street</p>
                  <p className="text-sm text-muted-foreground">
                    Listed: $450,000
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
              <div className="flex items-center gap-4 rounded-lg border p-3">
                <div className="h-12 w-12 rounded-lg bg-gray-100" />
                <div className="flex-1 space-y-1">
                  <p className="font-medium">456 Oak Avenue</p>
                  <p className="text-sm text-muted-foreground">
                    Listed: $525,000
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 