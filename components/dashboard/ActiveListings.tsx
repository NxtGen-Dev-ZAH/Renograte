"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getSignedFileUrl } from "@/lib/s3";
import { useListings } from "@/lib/dashboard-context";

interface Listing {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  listingPrice: number;
  photos?: string[];
  status: string;
}

export default function ActiveListings() {
  const { toast } = useToast();
  const { listings: allListings, loading, error } = useListings();
  const [photoUrls, setPhotoUrls] = useState<{ [key: string]: string }>({});

  // Filter to only approved listings and limit to 2
  const listings = allListings
    .filter((listing) => listing.status === "approved")
    .slice(0, 2);

  // Fetch thumbnail images for each listing using batch API
  useEffect(() => {
    const fetchPhotoUrls = async () => {
      if (listings.length === 0) return;

      // Collect all photo keys
      const photoKeys = listings
        .filter((listing) => listing.photos && listing.photos.length > 0)
        .map((listing) => listing.photos[0]);

      if (photoKeys.length === 0) return;

      try {
        // Use batch API to get all signed URLs at once
        const response = await fetch("/api/s3/batch-signed-urls", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ keys: photoKeys }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch signed URLs");
        }

        const data = await response.json();
        const signedUrls = data.signedUrls || [];

        // Create a map of photo keys to URLs
        const photoKeyToUrl = signedUrls.reduce(
          (acc: any, { key, url }: any) => {
            acc[key] = url;
            return acc;
          },
          {}
        );

        // Map URLs back to listing IDs
        const photoUrlMap = listings.reduce(
          (acc, listing) => {
            if (listing.photos && listing.photos.length > 0) {
              acc[listing.id] = photoKeyToUrl[listing.photos[0]] || "";
            }
            return acc;
          },
          {} as { [key: string]: string }
        );

        setPhotoUrls(photoUrlMap);
      } catch (error) {
        console.error("Error fetching batch signed URLs:", error);
        // Fallback to individual requests if batch fails
        const photoPromises = listings.map(async (listing: Listing) => {
          if (listing.photos && listing.photos.length > 0) {
            try {
              const signedUrl = await getSignedFileUrl(listing.photos[0]);
              return { id: listing.id, url: signedUrl };
            } catch (error) {
              console.error(
                `Error fetching signed URL for listing ${listing.id}:`,
                error
              );
              return { id: listing.id, url: "" };
            }
          }
          return { id: listing.id, url: "" };
        });

        const photoResults = await Promise.all(photoPromises);
        const photoUrlMap = photoResults.reduce(
          (acc, { id, url }) => {
            acc[id] = url;
            return acc;
          },
          {} as { [key: string]: string }
        );

        setPhotoUrls(photoUrlMap);
      }
    };

    fetchPhotoUrls();
  }, [listings]);

  // Show error if there's one
  if (error) {
    toast({
      title: "Error",
      description: "Failed to load active listings",
      variant: "destructive",
    });
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="col-span-full md:col-span-3">
      <CardHeader>
        <CardTitle>Active Listings</CardTitle>
        <CardDescription>Your current property listings</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-lg border p-3"
              >
                <div className="h-12 w-12 rounded-lg bg-gray-200 animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                </div>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No active listings found.</p>
            <Button asChild className="mt-4">
              <Link href="/add-listing">Create Listing</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="flex items-center gap-4 rounded-lg border p-3"
              >
                <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden">
                  {photoUrls[listing.id] ? (
                    <Image
                      src={photoUrls[listing.id]}
                      alt={listing.title}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      No img
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium line-clamp-1">{listing.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(listing.listingPrice)}
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/listings/${listing.id}`}>View</Link>
                </Button>
              </div>
            ))}

            <div className="pt-2">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/dashboard/my-listings">View All Listings</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
