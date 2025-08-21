"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import Link from "next/link";
import { 
  Loader2, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Clock, 
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  updatedAt?: string;
  agent?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function MyListingsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 0
  });
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  
  // Get user ID from session
  const userId = session?.user?.id;

  // Fetch listings for the logged-in user
  useEffect(() => {
    const fetchListings = async () => {
      if (sessionStatus === "loading") return;
      
      if (!session?.user) {
        setError("You must be logged in to view your listings");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Build URL with query parameters
        const queryParams = new URLSearchParams();
        queryParams.append('agentId', userId as string);
        queryParams.append('page', pagination.page.toString());
        queryParams.append('limit', pagination.limit.toString());
        
        if (statusFilter !== "all") {
          queryParams.append('status', statusFilter);
        }
        
        if (searchTerm) {
          queryParams.append('search', searchTerm);
        }
        
        if (sortBy) {
          queryParams.append('sortBy', sortBy);
        }
        
        const response = await fetch(`/api/listings?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }
        
        const data = await response.json();
        setListings(data.listings || []);
        setPagination(data.pagination);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchListings();
  }, [session, sessionStatus, userId, pagination.page, pagination.limit, statusFilter, searchTerm, sortBy]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on new search
  };
  
  // Handle delete listing
  const handleDeleteListing = async (listingId: string) => {
    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete listing');
      }
      
      // Remove the deleted listing from state
      setListings(listings.filter(listing => listing.id !== listingId));
    } catch (err) {
      console.error('Error deleting listing:', err);
      alert('Failed to delete listing. Please try again.');
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {  
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      maximumFractionDigits: 0 
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  // Get visibility badge
  const getVisibilityBadge = (isVisible: boolean) => {
    return isVisible 
      ? <Badge className="bg-blue-100 text-blue-800">Visible</Badge>
      : <Badge className="bg-gray-100 text-gray-800">Hidden</Badge>;
  };

  if (sessionStatus === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">You need to be logged in to view your listings.</p>
        <Link href="/login">
          <Button>Log In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Listings</h1>
          <p className="text-muted-foreground">Manage your property listings</p>
        </div>
        <Link href="/add-listing">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Add New Listing
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="sm:w-1/3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:w-1/3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="priceAsc">Price: Low to High</SelectItem>
              <SelectItem value="priceDesc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:flex-1">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center my-12">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600">Loading your listings...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && listings.length === 0 && (
        <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-800 mb-2">No listings found</h3>
            {statusFilter !== "all" ? (
              <p className="text-gray-600 mb-6">You don&apos;t have any listings with the selected status. Try changing your filters.</p>
            ) : searchTerm ? (
              <p className="text-gray-600 mb-6">No listings match your search. Try a different search term.</p>
            ) : (
              <p className="text-gray-600 mb-6">You haven&apos;t created any property listings yet. Add your first listing now!</p>
            )}
            
            <div className="flex justify-center gap-4">
              {(statusFilter !== "all" || searchTerm) && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setStatusFilter("all");
                    setSearchTerm("");
                  }}
                >
                  Clear Filters
                </Button>
              )}
              <Link href="/add-listing">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Listing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Listings Grid */}
      {!loading && !error && listings.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-0">
                  <div className="flex justify-between items-start">
                    <CardTitle className="line-clamp-2 text-lg">{listing.title}</CardTitle>
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {getStatusBadge(listing.status)}
                    {getVisibilityBadge(listing.isVisible)}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">{listing.address}</p>
                    <p className="text-sm text-gray-600">{listing.city}, {listing.state} {listing.zipCode}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div>
                      <p className="text-xs text-gray-500">PRICE</p>
                      <p className="font-semibold">{formatCurrency(listing.listingPrice)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">RENO BUDGET</p>
                      <p className="font-semibold text-cyan-600">{formatCurrency(listing.renovationCost)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">ARV</p>
                      <p className="font-semibold text-emerald-600">{formatCurrency(listing.afterRepairValue)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Created: {formatDate(listing.createdAt)}</span>
                    </div>
                    <div>
                      {listing.bedrooms} bed · {listing.bathrooms} bath · {listing.squareFootage.toLocaleString()} sqft
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-0">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/listings/renograte-listings/${listing.id}`}>
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/add-listing?edit=${listing.id}`}>
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Link>
                    </Button>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Listing</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this listing? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteListing(listing.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={pagination.page === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Feedback and Status Guide */}
      {!loading && listings.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-medium text-blue-800 mb-4">Understanding Listing Statuses</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Approved</p>
                <p className="text-sm text-gray-600">Your listing has been reviewed and approved. It is visible to potential buyers.</p>
              </div>
            </div>
            <div className="flex items-start">
              <Clock className="h-5 w-5 mr-2 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium">Pending Review</p>
                <p className="text-sm text-gray-600">Your listing is being reviewed by our team. This typically takes 1-2 business days.</p>
              </div>
            </div>
            <div className="flex items-start">
              <XCircle className="h-5 w-5 mr-2 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium">Rejected</p>
                <p className="text-sm text-gray-600">Your listing was rejected. Please check your email for feedback and make necessary changes.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 