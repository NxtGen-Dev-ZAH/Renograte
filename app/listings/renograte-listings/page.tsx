"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ErrorBoundary } from "react-error-boundary";
import { Info, Loader2, BedDouble, Bath, Ruler, Home, Clock, Tag } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock listing data - In a real app, this would come from your backend
const mockListings = [
  {
    id: "re-1001",
    title: "Modern Renovation Project",
    price: 350000,
    renovationBudget: 45000,
    afterRenovationValue: 415000,
    address: "123 Oak Street",
    location: "Tampa, FL 33601",
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1850,
    yearBuilt: 1995,
    image: "/sample-house-1.jpg",
    status: "Available",
    agentName: "Sarah Johnson",
    agentCompany: "Renograte Realty",
    approvedDate: "2023-11-15",
    daysListed: 7
  },
  {
    id: "re-1002",
    title: "Charming Bungalow with Potential",
    price: 275000,
    renovationBudget: 29000,
    afterRenovationValue: 335000,
    address: "456 Maple Avenue",
    location: "Tampa, FL 33602",
    bedrooms: 2,
    bathrooms: 1,
    sqft: 1200,
    yearBuilt: 1962,
    image: "/sample-house-2.jpg",
    status: "Available",
    agentName: "Michael Chen",
    agentCompany: "Renograte Realty",
    approvedDate: "2023-11-10",
    daysListed: 12
  },
  {
    id: "re-1003",
    title: "Executive Home Renovation Project",
    price: 520000,
    renovationBudget: 75000,
    afterRenovationValue: 615000,
    address: "789 Pine Lane",
    location: "Tampa, FL 33607",
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2800,
    yearBuilt: 2001,
    image: "/sample-house-3.jpg",
    status: "Under Contract",
    agentName: "Jessica Rodriguez",
    agentCompany: "Renograte Partners",
    approvedDate: "2023-11-05",
    daysListed: 17
  },
  {
    id: "re-1004",
    title: "Downtown Condo Reimagined",
    price: 299000,
    renovationBudget: 29000,
    afterRenovationValue: 365000,
    address: "101 Riverside Drive, #402",
    location: "Tampa, FL 33606",
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1150,
    yearBuilt: 2008,
    image: "/sample-condo-1.jpg",
    status: "Available",
    agentName: "David Wright",
    agentCompany: "Urban Core Realty",
    approvedDate: "2023-11-18",
    daysListed: 4
  },
];

export default function RenograteListingsPage() {
  const [listings, setListings] = useState(mockListings);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPrice, setFilterPrice] = useState("all");
  const [sortOption, setSortOption] = useState("newest");

  // In a real application, you would fetch data from your API
  useEffect(() => {
    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    // Here you would normally fetch your data
    // const fetchListings = async () => {
    //   const response = await fetch('/api/renograte-listings');
    //   const data = await response.json();
    //   setListings(data);
    //   setLoading(false);
    // };
    // fetchListings();
  }, []);

  // Filter and sort listings
  const filteredListings = listings.filter(listing => {
    if (filterStatus !== "all" && listing.status !== filterStatus) {
      return false;
    }
    
    if (filterPrice === "under300k" && listing.price >= 300000) {
      return false;
    } else if (filterPrice === "300k-500k" && (listing.price < 300000 || listing.price > 500000)) {
      return false;
    } else if (filterPrice === "over500k" && listing.price <= 500000) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    if (sortOption === "newest") {
      return b.daysListed - a.daysListed;
    } else if (sortOption === "price-asc") {
      return a.price - b.price;
    } else if (sortOption === "price-desc") {
      return b.price - a.price;
    } else if (sortOption === "renovation-budget") {
      return b.renovationBudget - a.renovationBudget;
    }
    return 0;
  });

  const formatCurrency = (amount: number) => {  
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      maximumFractionDigits: 0 
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-6 sm:mb-8 mt-6 sm:mt-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
          Renograte Exclusive Listings
        </h1>
        <div className="flex items-center justify-center gap-2">
          <p className="text-base sm:text-lg md:text-xl text-gray-600">
            Properties with verified renovation allowances
          </p>
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <button className="inline-flex items-center justify-center text-blue-500 rounded-full border border-blue-200 w-8 h-8 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
                  <Info className="w-4 h-4" />
                  <span className="sr-only">More information</span>
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-md p-4 text-left">
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">Renograte Exclusive Listings</span> are properties submitted by our vetted agent network. Each listing has a <span className="font-semibold text-gray-900">Verified Renovation Allowance</span> approved by both the seller and Renograte.
                  </p>
                  <p className="text-sm text-gray-700">
                    These listings provide <span className="font-semibold text-gray-900">Pre-Approved Renovation Budgets</span> that streamline financing and renovation planning. The <span className="font-semibold text-gray-900">After Renovation Value (ARV)</span> is calculated using our proprietary algorithm and verified by listing agents.
                  </p>
                  <p className="text-xs text-gray-500 italic">
                    <span className="font-semibold text-gray-900">Note:</span> All Renograte Exclusive Listings are backed by our <span className="font-semibold text-gray-900">Quality Assurance</span> process, ensuring accurate renovation estimates and property details.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 mb-8 rounded-lg border border-blue-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Under Contract">Under Contract</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Price Range</label>
            <Select value={filterPrice} onValueChange={setFilterPrice}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Filter by price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under300k">Under $300,000</SelectItem>
                <SelectItem value="300k-500k">$300,000 - $500,000</SelectItem>
                <SelectItem value="over500k">Over $500,000</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Sort By</label>
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Sort listings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="renovation-budget">Highest Renovation Budget</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center my-12">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600">Loading Renograte Exclusive Listings...</p>
          </div>
        </div>
      )}
      
      {/* Results Count */}
      {!loading && filteredListings.length > 0 && (
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredListings.length} Renograte Exclusive {filteredListings.length === 1 ? 'Listing' : 'Listings'}
          </p>
        </div>
      )}

      {/* Listings Grid */}
      {!loading && filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                {/* Status Badge */}
                <div className="absolute top-2 right-2 z-10">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    listing.status === "Available" 
                      ? "bg-green-500 text-white" 
                      : listing.status === "Under Contract"
                        ? "bg-yellow-500 text-white"
                        : "bg-blue-500 text-white"
                  }`}>
                    {listing.status}
                  </span>
                </div>
                
                {/* Days on Market Badge */}
                <div className="absolute top-2 left-2 z-10">
                  <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {listing.daysListed} {listing.daysListed === 1 ? 'day' : 'days'}
                  </span>
                </div>
                
                {/* Property Image */}
                <Link href={`/listings/renograte-listings/${listing.id}`}>
                  <div className="h-56 w-full relative overflow-hidden">
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Home className="h-12 w-12 text-gray-400" />
                    </div>
                  </div>
                </Link>

                {/* Agent Badge */}
                <div className="absolute -bottom-3 right-4 z-10">
                  <div className="bg-white shadow-md rounded-full px-3 py-1 border border-gray-200 text-xs flex items-center">
                    <span className="text-gray-700 font-medium mr-1">Listed by:</span>
                    <span className="text-blue-700">{listing.agentName}</span>
                  </div>
                </div>
              </div>

              <CardContent className="pt-6">
                {/* Price Information with Renovation */}
                <div className="mb-4 bg-blue-50 rounded-lg p-3 border-l-4 border-blue-500">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">LIST PRICE</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(listing.price)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">RENO ALLOWANCE</p>
                      <p className="text-lg font-bold text-cyan-600">{formatCurrency(listing.renovationBudget)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">ARV</p>
                      <p className="text-lg font-bold text-emerald-600">{formatCurrency(listing.afterRenovationValue)}</p>
                    </div>
                  </div>
                </div>

                {/* Property Title */}
                <Link href={`/listings/renograte-listings/${listing.id}`}>
                  <h3 className="text-xl font-semibold mb-1 hover:text-blue-600 transition-colors">{listing.title}</h3>
                </Link>
                <p className="text-gray-600 mb-3 text-sm">{listing.address}, {listing.location}</p>

                {/* Property Details */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="flex flex-col items-center">
                    <BedDouble className="h-5 w-5 text-blue-500 mb-1" />
                    <p className="text-sm text-gray-600">
                      {listing.bedrooms} {listing.bedrooms === 1 ? 'bed' : 'beds'}
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <Bath className="h-5 w-5 text-blue-500 mb-1" />
                    <p className="text-sm text-gray-600">
                      {listing.bathrooms} {listing.bathrooms === 1 ? 'bath' : 'baths'}
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <Ruler className="h-5 w-5 text-blue-500 mb-1" />
                    <p className="text-sm text-gray-600">{listing.sqft.toLocaleString()} sqft</p>
                  </div>
                </div>

                {/* Year Built and Renograte Verified Badge */}
                <div className="flex justify-between mb-4 items-center">
                  <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                    <Tag className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Built {listing.yearBuilt}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">Renograte Verified</span>
                  </div>
                </div>

                {/* View Details Button */}
                <Link href={`/listings/renograte-listings/${listing.id}`}>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium text-gray-800 mb-2">No listings found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filters to see more results.</p>
          <Button 
            variant="outline" 
            className="border-blue-500 text-blue-500 hover:bg-blue-50"
            onClick={() => {
              setFilterStatus("all");
              setFilterPrice("all");
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Call to Action for Agents */}
      <div className="mt-16 text-center bg-gradient-to-r from-blue-50 to-cyan-50 p-8 rounded-lg border border-blue-100">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Are You a Real Estate Agent?</h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Login to List your properties with Renograte to get approved renovation allowances and reach more buyers interested in renovation projects.
        </p>
       
      </div>
    </div>
  );
} 