// app/listings/page.tsx (continued)
"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Calendar } from "lucide-react";

interface Listing {
  id: number;
  title: string;
  price: number;
  renovationPotential: number;
  afterrenovatedallowance: number;
  location: string;
  type: string;
  status: string;
  daysListed: number;
  image: string;
  features: string[];
  renovationHighlights: string[];
}

export default function ListingsPage() {
  const [sortBy, setSortBy] = useState("newest");

  const listings: Listing[] = [
    {
      id: 1,
      title: "Charming Victorian Home",
      price: 550000,
      renovationPotential: 150000,
      afterrenovatedallowance: 720000,
      location: "Historic District, Downtown",
      type: "Single Family",
      status: "Active",
      daysListed: 5,
      image: "/property1.png",
      features: ["4 Beds", "3 Baths", "2,800 sqft", "Built 1890"],
      renovationHighlights: [
        "Original hardwood floors",
        "Period details",
        "High ceilings",
      ],
    },
    {
      id: 2,
      title: "Mid-Century Modern Ranch",
      price: 425000,
      renovationPotential: 75000,
      afterrenovatedallowance: 520000,
      location: "Sunset Hills",
      type: "Ranch",
      status: "Active",
      daysListed: 3,
      image: "/property2.png",
      features: ["3 Beds", "2 Baths", "1,800 sqft", "Built 1962"],
      renovationHighlights: [
        "Open floor plan",
        "Large windows",
        "Original features",
      ],
    },
    {
      id: 3,
      title: "Urban Townhouse",
      price: 675000,
      renovationPotential: 100000,
      afterrenovatedallowance: 788000,
      location: "City Center",
      type: "Townhouse",
      status: "Active",
      daysListed: 7,
      image: "/property3.png",
      features: ["3 Beds", "2.5 Baths", "2,200 sqft", "Built 2000"],
      renovationHighlights: [
        "Modern kitchen",
        "Rooftop potential",
        "Basement unit",
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Section */}
      <div className="text-center mb-12 mt-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Renograte Listings
        </h1>
        <p className="text-xl text-gray-600">
          Explore listings with approved renovation allowances
        </p>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input placeholder="Search locations..." className="w-full" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="potential">Renovation Potential</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="single">Single Family</SelectItem>
              <SelectItem value="townhouse">Townhouse</SelectItem>
              <SelectItem value="condo">Condo</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-[#0C71C3] hover:bg-[#0C71C3]/90">
            Apply Filters
          </Button>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {listings.map((listing) => (
          <Card
            key={listing.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative">
                <Image
                  src={listing.image}
                  alt={listing.title}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
                <Badge className="absolute top-4 left-4 bg-[#0C71C3]">
                  {listing.status}
                </Badge>
              </div>

              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">{listing.title}</h3>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{listing.location}</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Listed Price</p>
                    <p className="text-lg font-bold text-[#0C71C3]">
                      ${listing.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex justify-center items-end space-x-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Renovation Potential
                      </p>
                      <p className="text-lg font-bold text-cyan-600">
                        ${listing.renovationPotential.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        After Renovated Allowance
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        ${listing.afterrenovatedallowance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {listing.features.map((feature, index) => (
                      <Badge key={index} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">
                      Renovation Highlights:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {listing.renovationHighlights.map((highlight, index) => (
                        <li key={index}>• {highlight}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {listing.daysListed} days on market
                    </span>
                    <Button className="bg-[#0C71C3] hover:bg-[#0C71C3]/90">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center">
        <nav className="flex items-center space-x-2">
          <Button variant="outline" className="w-24">
            Previous
          </Button>
          <Button variant="outline" className="w-10">
            1
          </Button>
          <Button variant="outline" className="w-10 bg-[#0C71C3] text-white">
            2
          </Button>
          <Button variant="outline" className="w-10">
            3
          </Button>
          <Button variant="outline" className="w-24">
            Next
          </Button>
        </nav>
      </div>
    </div>
  );
}
