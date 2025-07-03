"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,

  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface User {
  name: string;
  email: string;
}

interface Offer {
  id: string;
  propertyAddress: string;
  propertyType: string;
  listingPrice: string;
  offerAmount: string;
  status: string;
  createdAt: string;
  user: User;
}

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch("/api/term-sheets");
        if (!response.ok) {
          throw new Error("Failed to fetch offers");
        }
        const data = await response.json();
        setOffers(data.offers);
      } catch (error) {
        console.error("Error fetching offers:", error);
        toast({
          title: "Error",
          description: "Failed to load offers. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [toast]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(value));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Offers Management</h2>
        <p className="text-muted-foreground">
          View and manage all property offers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Offers</CardTitle>
          <CardDescription>
            A list of all property offers submitted by members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No offers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property Address</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Offer Amount</TableHead>
                    <TableHead>Listing Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium">
                        {offer.propertyAddress}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{offer.user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {offer.user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(offer.offerAmount)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(offer.listingPrice)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {offer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(offer.createdAt)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() => {
                            // View offer details
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 