"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getSignedFileUrl } from "@/lib/s3";

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
  const { data: session } = useSession();
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [photoUrls, setPhotoUrls] = useState<{ [key: string]: string }>({});

  // Fetch active listings
  useEffect(() => {
    const fetchListings = async () => {
      if (!session?.user) return;
      
      setLoading(true);
      try {
        // Fetch approved listings for the current user
        const response = await fetch(`/api/listings?agentId=${session.user.id}&status=approved&limit=2`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }
        
        const data = await response.json();
        const fetchedListings = data.listings || [];
        
        setListings(fetchedListings);
        
        // Fetch thumbnail images for each listing
        const photoPromises = fetchedListings.map(async (listing: Listing) => {
          if (listing.photos && listing.photos.length > 0) {
            try {
              const signedUrl = await getSignedFileUrl(listing.photos[0]);
              return { id: listing.id, url: signedUrl };
            } catch (error) {
              console.error(`Error fetching signed URL for listing ${listing.id}:`, error);
              return { id: listing.id, url: '' };
            }
          }
          return { id: listing.id, url: '' };
        });
        
        const photoResults = await Promise.all(photoPromises);
        const photoUrlMap = photoResults.reduce((acc, { id, url }) => {
          acc[id] = url;
          return acc;
        }, {} as { [key: string]: string });
        
        setPhotoUrls(photoUrlMap);
      } catch (error) {
        console.error('Error fetching listings:', error);
        toast({
          title: "Error",
          description: "Failed to load listings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchListings();
  }, [session]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
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
            {[1, 2].map(i => (
              <div key={i} className="flex items-center gap-4 rounded-lg border p-3">
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
              <div key={listing.id} className="flex items-center gap-4 rounded-lg border p-3">
                <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden">
                  {photoUrls[listing.id] ? (
                    <img 
                      src={photoUrls[listing.id]} 
                      alt={listing.title}
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