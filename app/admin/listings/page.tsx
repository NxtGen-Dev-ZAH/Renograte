"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  Check, 
  X, 
  Home, 
  Eye, 
  ChevronLeft, 
  Clock, 
  DollarSign,
  Bed,
  Bath,
  Square,
  Tag
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; 
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { getSignedFileUrl } from "@/lib/s3";

// Custom UI components
const Table = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full overflow-auto">
    <table className="w-full caption-bottom text-sm">{children}</table>
  </div>
);

const TableHeader = ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>;
const TableBody = ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>;
const TableHead = ({ children }: { children: React.ReactNode }) => (
  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{children}</th>
);
const TableRow = ({ children }: { children: React.ReactNode }) => (
  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">{children}</tr>
);
const TableCell = ({ children }: { children: React.ReactNode }) => (
  <td className="p-4 align-middle">{children}</td>
);

const Badge = ({ 
  children, 
  variant = "default", 
  className = "" 
}: { 
  children: React.ReactNode, 
  variant?: string, 
  className?: string 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "outline":
        return "border-border bg-background text-foreground";
      default:
        return "border-transparent bg-primary/10 text-primary";
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${getVariantClasses()} ${className}`}>
      {children}
    </span>
  );
};

// Define the Listing interface
interface Agent {
  name?: string;
  email?: string;
}

interface Listing {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  listingPrice: number;
  renovationCost: number;
  afterRepairValue: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  yearBuilt?: number;
  description: string;
  photos?: string[];
  videoUrl?: string;
  virtualTourUrl?: string;
  agent?: Agent;
  createdAt: string;
  reviewedAt?: string;
  status: "pending" | "approved" | "rejected";
  adminFeedback?: string;
  isVisible?: boolean;
}

export default function AdminListingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("pending");
  const [listings, setListings] = useState<Listing[]>([]);
  const { toast } = useToast(); 
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
  const [processingReview, setProcessingReview] = useState(false);
  const [selectedPhotoUrls, setSelectedPhotoUrls] = useState<string[]>([]);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>("");

  // Fetch listings based on current tab
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/listings?status=${activeTab}`);
        if (res.ok) {
          const data = await res.json();
          setListings(data.listings || []);
        } else {
          toast({
            title: "Failed to fetch listings",
            description: "Please try again later",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
        toast({
          title: "An error occurred while fetching listings",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [activeTab]);

  // Add this effect to load media URLs when a listing is selected
  useEffect(() => {
    const loadMediaUrls = async () => {
      if (selectedListing?.photos?.length) {
        const signedUrls = await Promise.all(
          selectedListing.photos.map(photo => getSignedFileUrl(photo))
        );
        setSelectedPhotoUrls(signedUrls);
      } else {
        setSelectedPhotoUrls([]);
      }

      if (selectedListing?.videoUrl) {
        const signedVideoUrl = await getSignedFileUrl(selectedListing.videoUrl);
        setSelectedVideoUrl(signedVideoUrl);
      } else {
        setSelectedVideoUrl("");
      }
    };

    if (selectedListing) {
      loadMediaUrls();
    }
  }, [selectedListing]);

  const handleViewListing = (listing: Listing) => {
    setSelectedListing(listing);
    setViewDialogOpen(true);
  };

  const handleReviewListing = (listing: Listing, action: "approve" | "reject") => {
    setSelectedListing(listing);
    setReviewAction(action);
    setReviewFeedback("");
    setReviewDialogOpen(true);
  };

  const submitReview = async () => {
    if (!selectedListing) return;
    
    setProcessingReview(true);
    try {
      const response = await fetch(`/api/listings/${selectedListing.id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: reviewAction === "approve" ? "approved" : "rejected",
          adminFeedback: reviewFeedback,
          isVisible: reviewAction === "approve", // Only approved listings are visible
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update listing status");
      }

      toast({
        title: "Success",
        description: reviewAction === "approve"
          ? "Listing approved and is now visible on the site"
          : "Listing rejected"
      });

      // Refresh listings
      const updatedListingsRes = await fetch(`/api/listings?status=${activeTab}`);
      if (updatedListingsRes.ok) {
        const data = await updatedListingsRes.json();
        setListings(data.listings || []);
      }

      setReviewDialogOpen(false);
    } catch (error) {
      console.error("Error updating listing:", error);
      toast({
        title: "Error",
        description: "Failed to update listing status",
        variant: "destructive",
      });
    } finally {
      setProcessingReview(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending Review</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Render the selected listing details
  const renderListingDetails = () => {
    if (!selectedListing) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            {selectedPhotoUrls.length > 0 ? (
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={selectedPhotoUrls[0]}
                  alt={selectedListing.title}
                  width={800}
                  height={450}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <Home className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">List Price</span>
                    <span className="font-semibold text-green-600">{formatCurrency(selectedListing.listingPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Renovation Cost</span>
                    <span className="font-semibold text-amber-600">{formatCurrency(selectedListing.renovationCost)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">After Repair Value</span>
                    <span className="font-semibold text-blue-600">{formatCurrency(selectedListing.afterRepairValue)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{selectedListing.bedrooms} {selectedListing.bedrooms === 1 ? "Bedroom" : "Bedrooms"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{selectedListing.bathrooms} {selectedListing.bathrooms === 1 ? "Bathroom" : "Bathrooms"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Square className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{selectedListing.squareFootage} sqft</span>
                  </div>
                  {selectedListing.yearBuilt && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Built in {selectedListing.yearBuilt}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold">{selectedListing.title}</h2>
          <p className="text-gray-600 mt-1">
            {selectedListing.address}, {selectedListing.city}, {selectedListing.state} {selectedListing.zipCode}
          </p>
        </div>

        <div>
          <h3 className="font-medium text-gray-900">Description</h3>
          <p className="mt-1 text-gray-600">{selectedListing.description}</p>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium text-gray-900">Media</h3>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {selectedPhotoUrls.map((photo, index) => (
              <div key={index} className="aspect-square relative">
                <Image
                  src={photo}
                  alt={`Property photo ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
          
          {selectedVideoUrl && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Property Video</h4>
              <video
                controls
                className="w-full rounded-lg"
                src={selectedVideoUrl}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
          
          {selectedListing.virtualTourUrl && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Virtual Tour</h4>
              <a
                href={selectedListing.virtualTourUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Virtual Tour
              </a>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium text-gray-900">Agent Information</h3>
          <div className="mt-2">
            <p className="text-sm">
              <span className="font-medium">Name: </span>
              {selectedListing.agent?.name || "Unknown"}
            </p>
            <p className="text-sm mt-1">
              <span className="font-medium">Email: </span>
              {selectedListing.agent?.email || "Unknown"}
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium text-gray-900">Listing Details</h3>
          <div className="mt-2 space-y-1">
            <p className="text-sm">
              <span className="font-medium">Created: </span>
              {formatDate(selectedListing.createdAt)}
            </p>
            <p className="text-sm">
              <span className="font-medium">Status: </span>
              {getStatusBadge(selectedListing.status)}
            </p>
            {selectedListing.reviewedAt && (
              <p className="text-sm">
                <span className="font-medium">Reviewed: </span>
                {formatDate(selectedListing.reviewedAt)}
              </p>
            )}
            {selectedListing.adminFeedback && (
              <div className="mt-2">
                <p className="text-sm font-medium">Admin Feedback:</p>
                <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md border border-gray-200">
                  {selectedListing.adminFeedback}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="p-4 pt-6 sm:p-6 md:p-8 mt-8 md:mt-12 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-gray-500 hover:text-gray-700">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Listings</h1>
          </div>
          <p className="text-gray-600 mt-1">Review and manage property listings</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Listings Pending Review</CardTitle>
              <CardDescription>
                Review new property listings submitted by agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              ) : listings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Date Submitted</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{listing.title}</p>
                            <p className="text-sm text-gray-500">{listing.city}, {listing.state}</p>
                          </div>
                        </TableCell>
                        <TableCell>{listing.agent?.name || "Unknown"}</TableCell>
                        <TableCell>{formatDate(listing.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewListing(listing)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button 
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleReviewListing(listing, "approve")}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReviewListing(listing, "reject")}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No pending listings</h3>
                  <p className="mt-1 text-gray-500">There are no listings waiting for review at this time.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Listings</CardTitle>
              <CardDescription>
                Listings that have been approved and are visible on the site
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              ) : listings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Approved Date</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{listing.title}</p>
                            <p className="text-sm text-gray-500">{listing.city}, {listing.state}</p>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(listing.listingPrice)}</TableCell>
                        <TableCell>{listing.agent?.name || "Unknown"}</TableCell>
                        <TableCell>{listing.reviewedAt ? formatDate(listing.reviewedAt) : "N/A"}</TableCell>
                        <TableCell>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewListing(listing)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Home className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No approved listings</h3>
                  <p className="mt-1 text-gray-500">There are no approved listings at this time.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Listings</CardTitle>
              <CardDescription>
                Listings that have been rejected and require revision
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              ) : listings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Rejected Date</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{listing.title}</p>
                            <p className="text-sm text-gray-500">{listing.city}, {listing.state}</p>
                          </div>
                        </TableCell>
                        <TableCell>{listing.agent?.name || "Unknown"}</TableCell>
                        <TableCell>{listing.reviewedAt ? formatDate(listing.reviewedAt) : "N/A"}</TableCell>
                        <TableCell>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewListing(listing)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <X className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No rejected listings</h3>
                  <p className="mt-1 text-gray-500">There are no rejected listings at this time.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Listing Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Listing</DialogTitle>
            <DialogDescription>
              Review the listing details
            </DialogDescription>
          </DialogHeader>
          
          {renderListingDetails()}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            {selectedListing?.status === "pending" && (
              <>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setViewDialogOpen(false);
                    if (selectedListing) handleReviewListing(selectedListing, "reject");
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setViewDialogOpen(false);
                    if (selectedListing) handleReviewListing(selectedListing, "approve");
                  }}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "approve" ? "Approve Listing" : "Reject Listing"}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "approve"
                ? "The listing will be visible on the website after approval."
                : "Provide feedback to the agent on why the listing was rejected."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="feedback">
                {reviewAction === "approve" ? "Approval Notes (Optional)" : "Rejection Feedback"}
              </Label>
              <Textarea
                id="feedback"
                placeholder={
                  reviewAction === "approve"
                    ? "Add any notes for the agent (optional)"
                    : "Explain why this listing is being rejected"
                }
                rows={4}
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setReviewDialogOpen(false)}
              disabled={processingReview}
            >
              Cancel
            </Button>
            <Button
              variant={reviewAction === "approve" ? "default" : "destructive"}
              onClick={submitReview}
              disabled={(reviewAction === "reject" && !reviewFeedback) || processingReview}
              className={reviewAction === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {processingReview ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  Processing...
                </span>
              ) : (
                <>
                  {reviewAction === "approve" ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Approve Listing
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-1" />
                      Reject Listing
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
} 