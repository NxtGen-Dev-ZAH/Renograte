"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Star, MapPin, Phone, Mail, Building, Wrench, Briefcase } from "lucide-react";

const categories = [
  { id: "contractors", name: "Contractors", icon: Wrench },
  { id: "agents", name: "Real Estate Agents", icon: Building },
  { id: "lawyers", name: "Real Estate Lawyers", icon: Briefcase },
];

const providers = [
  {
    id: 1,
    name: "Zaheer Ahmed Construction",
    category: "contractors",
    rating: 4.8,
    reviews: 124,
    location: "New York, NY",
    specialties: ["Renovation", "Remodeling", "Custom Homes"],
    phone: "(555) 123-4567",
    email: "contact@zahconstruction.com",
  },
  {
    id: 2,
    name: "Darren Young",
    category: "agents",
    rating: 4.9,
    reviews: 89,
    location: "Los Angeles, CA",
    specialties: ["Residential", "Investment Properties", "Luxury Homes"],
    phone: "(555) 987-6543",
    email: "darren@realestate.com",
  },
  // Add more providers as needed
];

export default function DirectoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = !searchQuery || 
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || provider.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Service Directories</h2>
        <p className="text-muted-foreground">
          Find trusted professionals for your real estate projects
        </p>
      </div>

      {/* Category Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        {categories.map((category) => {
          const Icon = category.icon;
          const count = providers.filter(p => p.category === category.id).length;
          
          return (
            <Card
              key={category.id}
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-[#0C71C3] bg-opacity-10">
                  <Icon className="h-6 w-6 text-[#0C71C3]" />
                </div>
                <div>
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{count} providers</p>
                </div>
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
            placeholder="Search by name or location..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Provider Listings */}
      <div className="grid gap-6">
        {filteredProviders.map((provider) => (
          <Card key={provider.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-lg">{provider.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {categories.find(c => c.id === provider.category)?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{provider.rating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({provider.reviews} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {provider.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {provider.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {provider.email}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {provider.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Message</Button>
                  <Button>Contact</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 