"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  PhoneCall,
  Mail,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
} from "lucide-react";

const leads = [
  {
    id: 1,
    name: "Zaheer Ahmed",
    email: "zaheer@example.com",
    phone: "(555) 123-4567",
    status: "new",
    source: "website",
    property: "123 Main Street",
    date: "May 1, 2024",
    lastContact: "2 days ago",
  },
  {
    id: 2,
    name: "Darren Young",
    email: "darren@example.com",
    phone: "(555) 987-6543",
    status: "contacted",
    source: "referral",
    property: "456 Oak Avenue",
    date: "April 28, 2024",
    lastContact: "1 day ago",
  },
  // Add more leads as needed
];

const leadStats = [
  {
    title: "Total Leads",
    value: "45",
    change: "+12%",
    icon: Users,
  },
  {
    title: "New This Week",
    value: "8",
    change: "+3",
    icon: AlertCircle,
  },
  {
    title: "Conversion Rate",
    value: "12.5%",
    change: "+2.1%",
    icon: CheckCircle2,
  },
  {
    title: "Response Time",
    value: "2h",
    change: "-15min",
    icon: Clock,
  },
];

export default function LeadsPage() {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLeads = leads.filter(lead => {
    const matchesStatus = selectedStatus === "all" || lead.status === selectedStatus;
    const matchesSearch = !searchQuery || 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Lead Management</h2>
        <p className="text-muted-foreground">
          Track and manage your property leads
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        {leadStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change} from last period
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
        <Button>
          <Mail className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Leads</CardTitle>
          <CardDescription>
            Manage and track your property inquiries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-lg font-medium text-gray-600">
                      {lead.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium">{lead.name}</h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {lead.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <PhoneCall className="h-4 w-4" />
                        {lead.phone}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{lead.property}</p>
                    <p className="text-sm text-muted-foreground">
                      Last contact: {lead.lastContact}
                    </p>
                  </div>
                  <div>
                    <Button variant="outline" size="sm">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest interactions with your leads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-gray-100">
                    <PhoneCall className="h-4 w-4 text-gray-600" />
                  </div>  
                  <div>
                    <p className="font-medium">Call with Zaheer Ahmed</p>
                    <p className="text-sm text-muted-foreground">
                      Discussed property requirements
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 