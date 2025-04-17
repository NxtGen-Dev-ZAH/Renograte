// app/properties/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Search, Home, ChevronDown } from "lucide-react";
import Image from "next/image";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Search & Filter Properties</h2>
        
        {/* Search Location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="relative col-span-3 md:col-span-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input placeholder="Search location or zipcode..." className="pl-10" />
          </div>
          
          <div className="col-span-3 md:col-span-1">
            <Button className="w-full bg-[#0C71C3] hover:bg-[#0A5A9C] text-white font-medium transition-all duration-200">
              Search Properties
            </Button>
          </div>
          
          <div className="col-span-3 md:col-span-1 text-right">
            <Button variant="outline" className="border-[#0C71C3] text-[#0C71C3] hover:bg-[#0C71C3] hover:text-white transition-all duration-200">
              Reset Filters
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Price Range */}
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
          
          {/* Property Status */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <Select defaultValue="Active">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
                <SelectItem value="Coming Soon">Coming Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Property Type */}
          {/* <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Property Type</label>
            <Select defaultValue="Residential">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Residential">Residential</SelectItem>
                <SelectItem value="Condominium">Condominium</SelectItem>
                <SelectItem value="Townhouse">Townhouse</SelectItem>
                <SelectItem value="Land">Land</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
          
          {/* Bedrooms */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
            <Select defaultValue="any">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
                <SelectItem value="5">5+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Bathrooms */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
            <Select defaultValue="any">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Square Footage */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Square Footage</label>
            <Select defaultValue="any">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="1000">1,000+ sqft</SelectItem>
                <SelectItem value="1500">1,500+ sqft</SelectItem>
                <SelectItem value="2000">2,000+ sqft</SelectItem>
                <SelectItem value="2500">2,500+ sqft</SelectItem>
                <SelectItem value="3000">3,000+ sqft</SelectItem>
                <SelectItem value="4000">4,000+ sqft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Year Built */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Year Built</label>
            <Select defaultValue="any">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="2020">2020 or newer</SelectItem>
                <SelectItem value="2010">2010 or newer</SelectItem>
                <SelectItem value="2000">2000 or newer</SelectItem>
                <SelectItem value="1990">1990 or newer</SelectItem>
                <SelectItem value="1980">1980 or newer</SelectItem>
                <SelectItem value="1970">1970 or newer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Renovation Status */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Renovation Allowance</label>
            <Select defaultValue="any">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="has_allowance">Has Renovation Allowance</SelectItem>
                <SelectItem value="25000">$25,000+ Allowance</SelectItem>
                <SelectItem value="50000">$50,000+ Allowance</SelectItem>
                <SelectItem value="75000">$75,000+ Allowance</SelectItem>
                <SelectItem value="100000">$100,000+ Allowance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Advanced Filters Toggle */}
        {/*<div className="mt-6 pt-4 border-t border-gray-200">
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex items-center justify-center w-full text-sm font-medium text-gray-600 hover:text-gray-900 p-0">
                <span>Advanced Filters</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Lot Size</label>
                  <Select defaultValue="any">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="0.25">0.25+ Acres</SelectItem>
                      <SelectItem value="0.5">0.5+ Acres</SelectItem>
                      <SelectItem value="1">1+ Acres</SelectItem>
                      <SelectItem value="2">2+ Acres</SelectItem>
                      <SelectItem value="5">5+ Acres</SelectItem>
                      <SelectItem value="10">10+ Acres</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Features</label>
                  <Select defaultValue="any">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="swimming_pool">Swimming Pool</SelectItem>
                      <SelectItem value="waterfront">Waterfront</SelectItem>
                      <SelectItem value="garage">Garage</SelectItem>
                      <SelectItem value="basement">Basement</SelectItem>
                      <SelectItem value="fireplace">Fireplace</SelectItem>
                      <SelectItem value="air_conditioning">Air Conditioning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Renovation Potential</label>
                  <Select defaultValue="any">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="high">High Potential</SelectItem>
                      <SelectItem value="medium">Medium Potential</SelectItem>
                      <SelectItem value="low">Low Potential</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Days on Market</label>
                  <Select defaultValue="any">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="14">Last 14 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4 mt-4">
                <div className="flex items-center">
                  <Checkbox id="feature-garage" />
                  <label htmlFor="feature-garage" className="ml-2 text-sm text-gray-700">Garage</label>
                </div>
                <div className="flex items-center">
                  <Checkbox id="feature-pool" />
                  <label htmlFor="feature-pool" className="ml-2 text-sm text-gray-700">Swimming Pool</label>
                </div>
                <div className="flex items-center">
                  <Checkbox id="feature-fireplace" />
                  <label htmlFor="feature-fireplace" className="ml-2 text-sm text-gray-700">Fireplace</label>
                </div>
                <div className="flex items-center">
                  <Checkbox id="feature-basement" />
                  <label htmlFor="feature-basement" className="ml-2 text-sm text-gray-700">Basement</label>
                </div>
                <div className="flex items-center">
                  <Checkbox id="feature-waterfront" />
                  <label htmlFor="feature-waterfront" className="ml-2 text-sm text-gray-700">Waterfront</label>
                </div>
                <div className="flex items-center">
                  <Checkbox id="feature-central-ac" />
                  <label htmlFor="feature-central-ac" className="ml-2 text-sm text-gray-700">Central AC</label>
                </div>
                <div className="flex items-center">
                  <Checkbox id="feature-deck" />
                  <label htmlFor="feature-deck" className="ml-2 text-sm text-gray-700">Deck/Patio</label>
                </div>
                <div className="flex items-center">
                  <Checkbox id="feature-fenced-yard" />
                  <label htmlFor="feature-fenced-yard" className="ml-2 text-sm text-gray-700">Fenced Yard</label>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
        */}
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
                  <p className="text-sm text-gray-500">Renovation Allowance</p>
                  <p className="text-lg font-bold text-cyan-600 text-center">
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
        <p className="text-gray-600 mb-4">
          Don&apos;t see what you&apos;re looking for?
        </p>
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
