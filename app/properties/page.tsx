// app/properties/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Search, Home } from "lucide-react";
import Image from "next/image";

interface Property {
  id: number;
  title: string;
  price: number;
  renovationBudget: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  image: string;
}

export default function PropertiesPage() {
  const [priceRange, setPriceRange] = useState([200000, 800000]);

  const properties: Property[] = [
    {
      id: 1,
      title: "Modern Family Home",
      price: 450000,
      renovationBudget: 50000,
      location: "123 Main St, Cityville",
      bedrooms: 3,
      bathrooms: 2,
      sqft: 2000,
      image: "/property1.png",
    },
    {
      id: 2,
      title: "Urban Townhouse",
      price: 375000,
      renovationBudget: 35000,
      location: "456 Park Ave, Townsburg",
      bedrooms: 2,
      bathrooms: 2.5,
      sqft: 1800,
      image: "/property2.png",
    },
    {
      id: 3,
      title: "Suburban Ranch",
      price: 525000,
      renovationBudget: 75000,
      location: "789 Oak Rd, Suburbville",
      bedrooms: 4,
      bathrooms: 3,
      sqft: 2500,
      image: "/property3.png",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ">
      {/* Hero Section */}
      <div className="text-center mb-12 mt-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Find Your Perfect Home
        </h1>
        <p className="text-xl text-gray-600">
          Discover properties with renovation potential
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input placeholder="Search location..." className="pl-10" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Price Range
            </label>
            <Slider
              defaultValue={[200000, 800000]}
              max={1000000}
              step={10000}
              value={priceRange}
              onValueChange={setPriceRange}
              className="py-4"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>${(priceRange[0] / 1000).toFixed(0)}k</span>
              <span>${(priceRange[1] / 1000).toFixed(0)}k</span>
            </div>
          </div>
          <Button className="bg-[#0C71C3] hover:bg-[#0C71C3]/90">
            Search Properties
          </Button>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map((property) => (
          <Card
            key={property.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <CardHeader className="p-0">
              <Image
                src={property.image}
                alt={property.title}
                width={500}
                height={300}
                className="w-full h-48 object-cover"
              />
            </CardHeader>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
              <p className="text-gray-600 mb-4">{property.location}</p>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <Home className="h-5 w-5 mx-auto text-[#0C71C3] mb-1" />
                  <p className="text-sm text-gray-600">
                    {property.bedrooms} beds
                  </p>
                </div>
                <div className="text-center">
                  <span className="block text-[#0C71C3] mb-1">🛁</span>
                  <p className="text-sm text-gray-600">
                    {property.bathrooms} baths
                  </p>
                </div>
                <div className="text-center">
                  <span className="block text-[#0C71C3] mb-1">📏</span>
                  <p className="text-sm text-gray-600">{property.sqft} sqft</p>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-500">Listed Price</p>
                  <p className="text-lg font-bold text-[#0C71C3]">
                    ${property.price.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Renovation Budget</p>
                  <p className="text-lg font-bold text-cyan-600">
                    ${property.renovationBudget.toLocaleString()}
                  </p>
                </div>
              </div>

              <Button className="w-full bg-[#0C71C3] hover:bg-[#0C71C3]/90">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-16 text-center">
        <p className="text-gray-600 mb-4">Don't see what you're looking for?</p>
        <Button
          variant="outline"
          className="border-[#0C71C3] text-[#0C71C3] hover:bg-[#0C71C3] hover:text-white"
        >
          Contact an Agent
        </Button>
      </div>
    </div>
  );
}
