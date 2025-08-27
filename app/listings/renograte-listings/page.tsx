"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Info,
  Loader2,
  BedDouble,
  Bath,
  Ruler,
  Home,
  Clock,
  Tag,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSignedFileUrl } from "@/lib/s3";

// Define interface for the listing type
interface Listing {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  yearBuilt?: number;
  listingPrice: number;
  renovationCost: number;
  afterRepairValue: number;
  status: string;
  isVisible: boolean;
  createdAt: string;
  agent?: {
    name: string;
  };
  photos?: string[];
}

export function RenograteListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPrice, setFilterPrice] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [photoUrls, setPhotoUrls] = useState<{ [key: string]: string[] }>({});

  // Fetch approved listings from the API
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "/api/listings?status=approved&isVisible=true"
        );
        if (response.ok) {
          const data = await response.json();
          setListings(data.listings || []);

          // Fetch signed URLs for all photos
          const photoPromises = data.listings.map(async (listing: Listing) => {
            if (listing.photos && listing.photos.length > 0) {
              try {
                const signedUrls = await Promise.all(
                  listing.photos.map((photo) => getSignedFileUrl(photo))
                );
                return { id: listing.id, urls: signedUrls };
              } catch (error) {
                console.error(
                  `Error fetching signed URLs for listing ${listing.id}:`,
                  error
                );
                return { id: listing.id, urls: [] };
              }
            }
            return { id: listing.id, urls: [] };
          });

          const photoResults = await Promise.all(photoPromises);
          const photoUrlMap = photoResults.reduce(
            (acc, { id, urls }) => {
              acc[id] = urls;
              return acc;
            },
            {} as { [key: string]: string[] }
          );

          setPhotoUrls(photoUrlMap);
        } else {
          console.error("Failed to fetch listings");
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Filter and sort listings
  const filteredListings = listings
    .filter((listing) => {
      // Filter by price
      if (filterPrice === "under300k" && listing.listingPrice >= 300000) {
        return false;
      } else if (
        filterPrice === "300k-500k" &&
        (listing.listingPrice < 300000 || listing.listingPrice > 500000)
      ) {
        return false;
      } else if (filterPrice === "over500k" && listing.listingPrice <= 500000) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortOption === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else if (sortOption === "price-asc") {
        return a.listingPrice - b.listingPrice;
      } else if (sortOption === "price-desc") {
        return b.listingPrice - a.listingPrice;
      } else if (sortOption === "renovation-budget") {
        return b.renovationCost - a.renovationCost;
      }
      return 0;
    });

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate how long ago a listing was created
  const getDaysListed = (createdAtDate: string): number => {
    const createdAt = new Date(createdAtDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
                    <span className="font-semibold text-gray-900">
                      Renograte Exclusive Listings
                    </span>{" "}
                    are properties submitted by our vetted agent network. Each
                    listing has a{" "}
                    <span className="font-semibold text-gray-900">
                      Verified Renovation Allowance
                    </span>{" "}
                    approved by both the seller and Renograte.
                  </p>
                  <p className="text-sm text-gray-700">
                    These listings provide{" "}
                    <span className="font-semibold text-gray-900">
                      Pre-Approved Renovation Budgets
                    </span>{" "}
                    that streamline financing and renovation planning. The{" "}
                    <span className="font-semibold text-gray-900">
                      After Renovation Value (ARV)
                    </span>{" "}
                    is calculated using our proprietary algorithm and verified
                    by listing agents.
                  </p>
                  <p className="text-xs text-gray-500 italic">
                    <span className="font-semibold text-gray-900">Note:</span>{" "}
                    All Renograte Exclusive Listings are backed by our{" "}
                    <span className="font-semibold text-gray-900">
                      Quality Assurance
                    </span>{" "}
                    process, ensuring accurate renovation estimates and property
                    details.
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
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Price Range
            </label>
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
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Sort By
            </label>
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Sort listings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="renovation-budget">
                  Highest Renovation Budget
                </SelectItem>
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
            <p className="text-gray-600">
              Loading Renograte Exclusive Listings...
            </p>
          </div>
        </div>
      )}

      {/* Results Count */}
      {!loading && filteredListings.length > 0 && (
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredListings.length} Renograte Exclusive{" "}
            {filteredListings.length === 1 ? "Listing" : "Listings"}
          </p>
        </div>
      )}

      {/* Listings Grid */}
      {!loading && filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredListings.map((listing) => (
            <Card
              key={listing.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                {/* Status Badge */}
                <div className="absolute top-2 right-2 z-10">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                    Available
                  </span>
                </div>

                {/* Days on Market Badge */}
                <div className="absolute top-2 left-2 z-10">
                  <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {getDaysListed(listing.createdAt)}{" "}
                    {getDaysListed(listing.createdAt) === 1 ? "day" : "days"}
                  </span>
                </div>

                {/* Property Image */}
                <Link href={`/listings/renograte-listings/${listing.id}`}>
                  <div className="h-56 w-full relative overflow-hidden">
                    {photoUrls[listing.id] &&
                    photoUrls[listing.id].length > 0 ? (
                      <Image
                        src={photoUrls[listing.id][0]}
                        alt={listing.title}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={false}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Home className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Agent Badge */}
                <div className="absolute -bottom-3 right-4 z-10">
                  <div className="bg-white shadow-md rounded-full px-3 py-1 border border-gray-200 text-xs flex items-center">
                    <span className="text-gray-700 font-medium mr-1">
                      Listed by:
                    </span>
                    <span className="text-blue-700">
                      {listing.agent?.name || "Renograte Agent"}
                    </span>
                  </div>
                </div>
              </div>

              <CardContent className="pt-6">
                {/* Price Information with Renovation */}
                <div className="mb-4 bg-blue-50 rounded-lg p-3 border-l-4 border-blue-500">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        LIST PRICE
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(listing.listingPrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        RENO ALLOWANCE
                      </p>
                      <p className="text-lg font-bold text-cyan-600">
                        {formatCurrency(listing.renovationCost)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">ARV</p>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatCurrency(listing.afterRepairValue)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Property Title */}
                <Link href={`/listings/renograte-listings/${listing.id}`}>
                  <h3 className="text-xl font-semibold mb-1 hover:text-blue-600 transition-colors">
                    {listing.title}
                  </h3>
                </Link>
                <p className="text-gray-600 mb-3 text-sm">
                  {listing.address}, {listing.city}, {listing.state}{" "}
                  {listing.zipCode}
                </p>

                {/* Property Details */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="flex flex-col items-center">
                    <BedDouble className="h-5 w-5 text-blue-500 mb-1" />
                    <p className="text-sm text-gray-600">
                      {listing.bedrooms}{" "}
                      {listing.bedrooms === 1 ? "bed" : "beds"}
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <Bath className="h-5 w-5 text-blue-500 mb-1" />
                    <p className="text-sm text-gray-600">
                      {listing.bathrooms}{" "}
                      {listing.bathrooms === 1 ? "bath" : "baths"}
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <Ruler className="h-5 w-5 text-blue-500 mb-1" />
                    <p className="text-sm text-gray-600">
                      {listing.squareFootage.toLocaleString()} sqft
                    </p>
                  </div>
                </div>

                {/* Year Built and Renograte Verified Badge */}
                <div className="flex justify-between mb-4 items-center">
                  {listing.yearBuilt && (
                    <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                      <Tag className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        Built {listing.yearBuilt}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                      Renograte Verified
                    </span>
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
      ) : (
        !loading && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-medium text-gray-800 mb-2">
              No listings found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters to see more results.
            </p>
            <Button
              variant="outline"
              className="border-blue-500 text-blue-500 hover:bg-blue-50"
              onClick={() => {
                setFilterPrice("all");
              }}
            >
              Reset Filters
            </Button>
          </div>
        )
      )}

      {/* Call to Action for Agents */}
      <div className="mt-16 text-center bg-gradient-to-r from-blue-50 to-cyan-50 p-8 rounded-lg border border-blue-100">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Are You a Real Estate Agent?
        </h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Login to List your properties with Renograte to get approved
          renovation allowances and reach more buyers interested in renovation
          projects.
        </p>
        <Link href="/dashboard/add-listing">
          <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
            Submit a Property
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default RenograteListingsPage;
