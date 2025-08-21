"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ListingStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export default function ListingStats() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [stats, setStats] = useState<ListingStats>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch listing stats
  useEffect(() => {
    const fetchListingStats = async () => {
      if (!session?.user) return;

      setLoading(true);
      try {
        // Fetch all user listings to calculate stats
        const response = await fetch(
          `/api/listings?agentId=${session.user.id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch listings");
        }

        const data = await response.json();
        const listings = data.listings || [];

        // Calculate stats
        const approved = listings.filter(
          (listing: Record<string, unknown>) => listing.status === "approved"
        ).length;
        const pending = listings.filter(
          (listing: Record<string, unknown>) => listing.status === "pending"
        ).length;
        const rejected = listings.filter(
          (listing: Record<string, unknown>) => listing.status === "rejected"
        ).length;

        setStats({
          total: listings.length,
          approved,
          pending,
          rejected,
        });
      } catch (error) {
        console.error("Error fetching listing stats:", error);
        toast({
          title: "Error",
          description: "Failed to load listing statistics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchListingStats();
  }, [session, toast]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
        <div className="p-2 rounded-full bg-blue-50">
          <Building className="h-4 w-4 text-blue-600" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 flex items-center">
            <div className="animate-pulse bg-gray-200 h-6 w-12 rounded"></div>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pending > 0 && (
                <span className="text-amber-600">
                  +{stats.pending} pending review
                </span>
              )}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
