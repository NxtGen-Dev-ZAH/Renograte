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
import { Progress } from "@/components/ui/progress";
import {
  Home,
  DollarSign,
  AlertTriangle,
  MapPin,
  Calendar,
  TrendingDown,
  BarChart,
  Search,
  Filter,
} from "lucide-react";

const properties = [
  {
    id: 1,
    address: "123 Main Street",
    city: "New York",
    state: "NY",
    price: 450000,
    marketValue: 650000,
    status: "pre-foreclosure",
    daysListed: 15,
    opportunity: 85,
    image: "/placeholder.jpg",
  },
  {
    id: 2,
    address: "456 Oak Avenue",
    city: "Los Angeles",
    state: "CA",
    price: 525000,
    marketValue: 750000,
    status: "bank-owned",
    daysListed: 30,
    opportunity: 92,
    image: "/placeholder.jpg",
  },
  // Add more properties as needed
];

const marketStats = [
  {
    title: "Total Properties",
    value: "124",
    change: "+8",
    icon: Home,
  },
  {
    title: "Avg. Discount",
    value: "32%",
    change: "+2.5%",
    icon: TrendingDown,
  },
  {
    title: "Market Value",
    value: "$4.2M",
    change: "+$320K",
    icon: BarChart,
  },
];

export default function DistressedPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredProperties = properties.filter(property => {
    const matchesSearch = !searchQuery || 
      property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || property.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Distressed Properties</h2>
        <p className="text-muted-foreground">
          Find and track distressed property opportunities
        </p>
      </div>

      {/* Market Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        {marketStats.map((stat) => {
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
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by address or city..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all ">All Statuses</SelectItem>
            <SelectItem value="pre-foreclosure">Pre-Foreclosure</SelectItem>
            <SelectItem value="bank-owned">Bank Owned</SelectItem>
            <SelectItem value="short-sale">Short Sale</SelectItem>
            <SelectItem value="auction">Auction</SelectItem>
          </SelectContent>
        </Select>
        <Button>
          <Filter className="mr-2 h-4 w-4" />
          More Filters
        </Button>
      </div>

      {/* Property Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="overflow-hidden">
            <div className="aspect-video bg-gray-100 relative">
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  {property.status}
                </span>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg">{property.address}</h3>
                  <p className="text-sm text-muted-foreground">
                    {property.city}, {property.state}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">List Price</p>
                    <p className="text-lg font-bold">
                      ${property.price.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Market Value</p>
                    <p className="text-lg font-bold">
                      ${property.marketValue.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Opportunity Score</span>
                    <span className="font-medium text-[#0C71C3]">
                      {property.opportunity}%
                    </span>
                  </div>
                  <Progress value={property.opportunity} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {property.daysListed} days listed
                  </span>
                  <Button>View Details</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Market Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Market Insights</CardTitle>
          <CardDescription>
            Current trends and opportunities in distressed properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Hot Areas</h4>
              <div className="space-y-2">
                {["Downtown", "West Side", "North Hills"].map((area) => (
                  <div
                    key={area}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{area}</span>
                    <span className="text-[#0C71C3] font-medium">
                      12 properties
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Price Trends</h4>
              <div className="h-[100px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Price trend chart</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 