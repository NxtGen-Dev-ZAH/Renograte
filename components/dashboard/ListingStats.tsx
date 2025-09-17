"use client";

import { useToast } from "@/hooks/use-toast";
import { Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useListingStats } from "@/lib/dashboard-context";

export default function ListingStats() {
  const { toast } = useToast();
  const { stats, loading, error } = useListingStats();

  // Show error if there's one
  if (error) {
    toast({
      title: "Error",
      description: "Failed to load listing statistics",
      variant: "destructive",
    });
  }

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
