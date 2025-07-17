"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  Loader2, 
  BedDouble, 
  Bath, 
  Ruler, 
  Home, 
  MapPin, 
  Calendar, 
  ArrowLeft, 
  Phone, 
  Mail, 
  CreditCard, 
  Hammer, 
  TrendingUp, 
  Star,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Maximize,
  Image as ImageIcon,
  Video,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSignedFileUrl } from "@/lib/s3";
import dynamic from 'next/dynamic';
import RoleProtected from '@/components/RoleProtected';
import { PDFViewer } from '@/components/PDFViewer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PropertyMap = dynamic(() => import('@/components/maps/GooglePropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center ">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
});

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
  description?: string;
  listingPrice: number;
  renovationCost: number;
  afterRepairValue: number;
  status: string;
  isVisible: boolean;
  createdAt: string;
  agent?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  photos?: string[];
  videoUrl?: string;
  virtualTourUrl?: string;
  latitude?: string;
  longitude?: string;
  
  // Renovation planning fields
  suggestedRenovations?: {
    kitchen?: boolean;
    bathrooms?: boolean;
    floors?: boolean;
    windows?: boolean;
    roofing?: boolean;
    electrical?: boolean;
    plumbing?: boolean;
    painting?: boolean;
    landscaping?: boolean;
  };
  renovationPlans?: Array<{
    id: string;
    title: string;
    price: string;
    size: string;
    description: string;
    imageUrl?: string;
  }>;
  renovationSuggestions?: Array<{
    title: string;
    description: string;
  }>;
  estimatedTimeframe?: string;
  suggestedContractor?: {
    name: string;
    phone: string;
    email: string;
    socialMedia: string;
  };
  quoteFileUrl?: string;
}

export function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [consultationForm, setConsultationForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      if (!params.id) {
        setError('Listing ID is required');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const response = await fetch(`/api/listings/${params.id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch listing');
        }
        
        const data = await response.json();
        setListing(data.listing);
      } catch (err) {
        console.error('Error fetching listing details:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching the listing');
      } finally {
        setLoading(false);
      }
    };
    
    fetchListing();
  }, [params.id]);

  useEffect(() => {
    const loadMediaUrls = async () => {
      if (listing?.photos?.length) {
        const signedUrls = await Promise.all(
          listing.photos.map(photo => getSignedFileUrl(photo))
        );
        setPhotoUrls(signedUrls);
      }

      if (listing?.videoUrl) {
        const signedVideoUrl = await getSignedFileUrl(listing.videoUrl);
        setVideoUrl(signedVideoUrl);
      }
      
      // Load renovation plan images if they exist
      if (listing?.renovationPlans?.length) {
        const updatedPlans = await Promise.all(
          listing.renovationPlans.map(async (plan) => {
            if (plan.imageUrl) {
              // Check if the image URL is already a renovation-plans/ path
              if (plan.imageUrl.startsWith('renovation-plans/')) {
                // Return as is - we'll handle this in the render with the S3 proxy
                return { ...plan };
              } else {
                const signedUrl = await getSignedFileUrl(plan.imageUrl);
                return { ...plan, imageUrl: signedUrl };
              }
            }
            return plan;
          })
        );
        
        // Update the listing with signed URLs for renovation plan images
        setListing(prev => ({
          ...prev!,
          renovationPlans: updatedPlans
        }));
      }
      
      // Load quote file URL if it exists
      if (listing?.quoteFileUrl) {
        try {
          console.log("Getting signed URL for quote file:", listing.quoteFileUrl);
          // Check if the quote URL is already a renovation-quotes/ path
          if (listing.quoteFileUrl.startsWith('renovation-quotes/')) {
            // We'll handle this in the render with the S3 proxy
            console.log("Quote file is a renovation-quotes/ path, will use S3 proxy");
          } else {
            const signedQuoteUrl = await getSignedFileUrl(listing.quoteFileUrl);
            console.log("Received signed URL for quote file:", signedQuoteUrl);
            setListing(prev => ({
              ...prev!,
              quoteFileUrl: signedQuoteUrl
            }));
          }
        } catch (error) {
          console.error("Error getting signed URL for quote file:", error);
        }
      }
    };

    if (listing) {
      loadMediaUrls();
    }
  }, [listing?.id]);

  const formatCurrency = (amount: number): string => {  
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % photoUrls.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + photoUrls.length) % photoUrls.length);
  };

  const renderMediaGallery = () => {
    if (photoUrls.length === 0 && !videoUrl) {
      return (
        <div className="relative h-[500px] w-full bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <Home className="h-24 w-24 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No media available for this property</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative ">
        {/* Property Title and Address */}
        <div className="mb-6 mx-4 mt-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{listing?.title}</h1>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <p className="text-lg">
              {listing?.address}, {listing?.city}, {listing?.state} {listing?.zipCode}
            </p>
          </div>
        </div>

        <Tabs defaultValue="photos" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Photos ({photoUrls.length})
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2" disabled={!videoUrl}>
              <Video className="h-4 w-4" />
              Video Tour
            </TabsTrigger>
          </TabsList>

          <TabsContent value="photos" className="mt-0">
            {/* Photos Gallery */}
            <div className="relative h-[600px] w-full bg-black">
              {photoUrls.length > 0 ? (
                <div className="relative h-full w-full">
                  <Image
                    src={photoUrls[currentImageIndex]}
                    alt={`Property photo ${currentImageIndex + 1}`}
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                    quality={90}
                  />
                  {photoUrls.length > 1 && (
                    <>
                      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                        {currentImageIndex + 1} / {photoUrls.length}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 text-white p-3 rounded-full hover:bg-black/90 transition-colors"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 text-white p-3 rounded-full hover:bg-black/90 transition-colors"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowImageModal(true)}
                    className="absolute top-4 right-4 bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition-colors"
                    aria-label="View full screen"
                  >
                    <Maximize className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <p className="text-white">No photos available</p>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {photoUrls.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {photoUrls.map((url, index) => (
                  <div
                    key={index}
                    className={`relative h-24 w-24 flex-shrink-0 cursor-pointer rounded-lg overflow-hidden transition-transform hover:scale-105 ${
                      currentImageIndex === index ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <Image
                      src={url}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="video" className="mt-0">
            {/* Video Section */}
            <div className="relative h-[600px] w-full bg-black rounded-lg overflow-hidden">
              {videoUrl ? (
                <div className="relative h-full w-full">
                  <video
                    controls
                    className="w-full h-full object-contain bg-black"
                    src={videoUrl}
                    poster={photoUrls[0]}
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                  <button
                    onClick={() => setShowVideoModal(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                    aria-label="Play video"
                  >
                    <div className="bg-white/90 rounded-full p-4 transform hover:scale-105 transition-transform">
                      <Play className="h-8 w-8 text-black" />
                    </div>
                  </button>
                </div>
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <p className="text-white">No video available</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  // Image Modal
  const renderImageModal = () => {
    if (!showImageModal) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
        <button
          onClick={() => setShowImageModal(false)}
          className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="h-6 w-6" />
        </button>
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <Image
            src={photoUrls[currentImageIndex]}
            alt={`Property photo ${currentImageIndex + 1}`}
            fill
            className="object-contain"
            quality={100}
            priority
          />
          {photoUrls.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 text-white p-3 rounded-full hover:bg-black/90 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 text-white p-3 rounded-full hover:bg-black/90 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Video Modal
  const renderVideoModal = () => {
    if (!showVideoModal || !videoUrl) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
        <button
          onClick={() => setShowVideoModal(false)}
          className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="h-6 w-6" />
        </button>
        <div className="relative w-full max-w-5xl aspect-video mx-4">
          <video
            controls
            className="w-full h-full rounded-lg"
            src={videoUrl}
            autoPlay
            poster={photoUrls[0]}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    );
  };

  const handleConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Send the consultation request to the API
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // User input data
          name: consultationForm.name,
          email: consultationForm.email,
          phone: consultationForm.phone,
          date: consultationForm.date,
          time: consultationForm.time,
          message: consultationForm.message,
          
          // Property data
          propertyTitle: listing?.title || '',
          propertyAddress: listing ? `${listing.address}, ${listing.city}, ${listing.state} ${listing.zipCode}` : '',
          
          // Contractor data
          contractorName: listing?.suggestedContractor?.name || '',
          contractorEmail: listing?.suggestedContractor?.email || '',
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to schedule consultation');
      }
      
      toast({
        title: "Success",
        description: "Consultation scheduled successfully! The contractor will contact you shortly."
      });
      setShowConsultationModal(false);
      setConsultationForm({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        message: "",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to schedule consultation. Please try again."
      });
      console.error("Error scheduling consultation:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Consultation Modal
  const renderConsultationModal = () => {
    if (!showConsultationModal || !listing?.suggestedContractor) return null;

    return (
      <Dialog open={showConsultationModal} onOpenChange={setShowConsultationModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule a Renovation Consultation</DialogTitle>
            <DialogDescription>
              Complete the form below to schedule a consultation with {listing.suggestedContractor.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleConsultationSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  value={consultationForm.name}
                  onChange={(e) => setConsultationForm({ ...consultationForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={consultationForm.email}
                    onChange={(e) => setConsultationForm({ ...consultationForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={consultationForm.phone}
                    onChange={(e) => setConsultationForm({ ...consultationForm, phone: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Preferred Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={consultationForm.date}
                    onChange={(e) => setConsultationForm({ ...consultationForm, date: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Preferred Time</Label>
                  <Select
                    onValueChange={(value) => setConsultationForm({ ...consultationForm, time: value })}
                    defaultValue={consultationForm.time}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (9AM - 12PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                      <SelectItem value="evening">Evening (5PM - 8PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Any specific details about your renovation needs..."
                  value={consultationForm.message}
                  onChange={(e) => setConsultationForm({ ...consultationForm, message: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Consultation with:</h4>
                <div className="text-sm">
                  <p className="font-medium">{listing.suggestedContractor.name}</p>
                  {listing.suggestedContractor.phone && (
                    <div className="flex items-center mt-1">
                      <Phone className="h-3 w-3 text-blue-600 mr-2" />
                      <span>{listing.suggestedContractor.phone}</span>
                    </div>
                  )}
                  {listing.suggestedContractor.email && (
                    <div className="flex items-center mt-1">
                      <Mail className="h-3 w-3 text-blue-600 mr-2" />
                      <span>{listing.suggestedContractor.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowConsultationModal(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  "Schedule Consultation"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 mt-10 flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center bg-red-50 p-8 rounded-lg border border-red-100">
          <h2 className="text-2xl font-bold text-red-700 mb-2">Listing Not Found</h2>
          <p className="text-gray-700 mb-6">
            {error || "We couldn't find the property you're looking for. It may have been removed or is no longer available."}
          </p>
          <Button onClick={() => router.push('/listings/renograte-listings')} className="bg-blue-600 hover:bg-blue-700">
            Return to Listings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-10 md:py-12">
      {/* Back Button */}
      <div className="mb-6 mt-10">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/listings/renograte-listings')}
          className="flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Listings
        </Button>
      </div>

      {/* Media Section */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-8">
        {renderMediaGallery()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Tabs for Property Details */}
          <Tabs defaultValue="overview" className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="renovation">Renovation Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Property Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <BedDouble className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">Bedrooms</p>
                  <p className="text-lg font-bold">{listing.bedrooms}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <Bath className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">Bathrooms</p>
                  <p className="text-lg font-bold">{listing.bathrooms}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <Ruler className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">Square Feet</p>
                  <p className="text-lg font-bold">{listing.squareFootage.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <Calendar className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">Year Built</p>
                  <p className="text-lg font-bold">{listing.yearBuilt || 'N/A'}</p>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <div className="text-gray-700 mb-6">
                {listing.description ? (
                  <p>{listing.description}</p>
                ) : (
                  <p>This {listing.bedrooms} bedroom, {listing.bathrooms} bathroom home located in {listing.city}, {listing.state} is a perfect renovation opportunity. With {listing.squareFootage.toLocaleString()} square feet, this property has tremendous potential to increase in value with the right renovations.</p>
                )}
              </div>
              
              <h3 className="text-lg font-semibold mb-2">Property Location</h3>
              <div className="h-96 w-full rounded-lg overflow-hidden shadow-md">
                {listing && (
                  <PropertyMap
                    properties={[{
                      ListingKey: listing.id,
                      Latitude: parseFloat(listing.latitude || '0'),
                      Longitude: parseFloat(listing.longitude || '0'),
                      ListPrice: listing.listingPrice,
                      BedroomsTotal: listing.bedrooms,
                      BathroomsTotalInteger: listing.bathrooms,
                      LivingArea: listing.squareFootage,
                      StreetNumber: listing.address.split(' ')[0],
                      StreetName: listing.address.split(' ').slice(1).join(' '),
                      City: listing.city,
                      StateOrProvince: listing.state,
                      PostalCode: listing.zipCode,
                      StandardStatus: 'Active',
                      PropertyType: 'Residential'
                    }]}
                    height="100%"
                    highlightedPropertyId={listing.id}
                    initialZoom={15}
                  />
                )}
              </div>
              <p className="text-sm text-gray-500 italic mt-2">Map shows exact property location</p>
            </TabsContent>
            
            <TabsContent value="features" className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Property Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Interior Features</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>{listing.bedrooms} Bedrooms</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>{listing.bathrooms} Bathrooms</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>{listing.squareFootage.toLocaleString()} Square Feet</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Kitchen</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Living Room</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Property Details</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Year Built: {listing.yearBuilt || 'N/A'}</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Property Type: Single Family</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Status: Available</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Listed: {formatDate(listing.createdAt)}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="renovation" className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Renovation Potential</h2>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <p className="text-blue-800 font-medium">
                  This property comes with a pre-approved renovation allowance of {formatCurrency(listing.renovationCost)} included in the financing options.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium text-gray-500">LISTING PRICE</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(listing.listingPrice)}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium text-gray-500">RENOVATION BUDGET</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-2xl font-bold text-cyan-600">{formatCurrency(listing.renovationCost)}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium text-gray-500">AFTER REPAIR VALUE</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(listing.afterRepairValue)}</p>
                  </CardContent>
                </Card>
              </div>
              
              {listing.estimatedTimeframe && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Estimated Timeframe</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-blue-500 mr-2" />
                      <p>{listing.estimatedTimeframe}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Suggested Renovations */}
              {listing.suggestedRenovations && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Suggested Renovations</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {listing.suggestedRenovations.kitchen && (
                      <div className="bg-green-50 p-3 rounded-lg flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>Kitchen</span>
                      </div>
                    )}
                    {listing.suggestedRenovations.bathrooms && (
                      <div className="bg-green-50 p-3 rounded-lg flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>Bathrooms</span>
                      </div>
                    )}
                    {listing.suggestedRenovations.floors && (
                      <div className="bg-green-50 p-3 rounded-lg flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>Floors</span>
                      </div>
                    )}
                    {listing.suggestedRenovations.windows && (
                      <div className="bg-green-50 p-3 rounded-lg flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>Windows</span>
                      </div>
                    )}
                    {listing.suggestedRenovations.roofing && (
                      <div className="bg-green-50 p-3 rounded-lg flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>Roofing</span>
                      </div>
                    )}
                    {listing.suggestedRenovations.electrical && (
                      <div className="bg-green-50 p-3 rounded-lg flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>Electrical</span>
                      </div>
                    )}
                    {listing.suggestedRenovations.plumbing && (
                      <div className="bg-green-50 p-3 rounded-lg flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>Plumbing</span>
                      </div>
                    )}
                    {listing.suggestedRenovations.painting && (
                      <div className="bg-green-50 p-3 rounded-lg flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>Painting</span>
                      </div>
                    )}
                    {listing.suggestedRenovations.landscaping && (
                      <div className="bg-green-50 p-3 rounded-lg flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>Landscaping</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Renovation Plans */}
              {listing.renovationPlans && listing.renovationPlans.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Renovation Plans</h3>
                  <div className="space-y-4">
                    {listing.renovationPlans.map((plan, index) => (
                      <Card key={plan.id || index}>
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row gap-4">
                            {plan.imageUrl && (
                              <div className="w-full md:w-1/4">
                                <div className="relative aspect-square rounded-md overflow-hidden">
                                  <Image
                                    src={plan.imageUrl.startsWith('renovation-plans/') 
                                      ? `/api/s3-proxy?key=${encodeURIComponent(plan.imageUrl)}`
                                      : plan.imageUrl}
                                    alt={plan.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium text-lg">{plan.title}</h4>
                              <div className="grid grid-cols-2 gap-2 mt-2 mb-3">
                                <div>
                                  <p className="text-sm text-gray-500">Price</p>
                                  <p className="font-medium">{plan.price}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Size</p>
                                  <p className="font-medium">{plan.size}</p>
                                </div>
                              </div>
                              <p className="text-gray-700">{plan.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Contractor */}
              {listing.suggestedContractor && listing.suggestedContractor.name && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Suggested Contractor</h3>
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium">{listing.suggestedContractor.name}</h4>
                      <div className="mt-2 space-y-1">
                        {listing.suggestedContractor.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-500 mr-2" />
                            <span>{listing.suggestedContractor.phone}</span>
                          </div>
                        )}
                        {listing.suggestedContractor.email && (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-500 mr-2" />
                            <span>{listing.suggestedContractor.email}</span>
                          </div>
                        )}
                        {listing.suggestedContractor.socialMedia && (
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-2">@</span>
                            <span>{listing.suggestedContractor.socialMedia}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Quote File */}
              {listing.quoteFileUrl && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Renovation Quote</h3>
                  <div className="mt-4">
                    {listing.quoteFileUrl.startsWith('renovation-quotes/') ? (
                      <PDFViewer url={`/api/s3-proxy?key=${encodeURIComponent(listing.quoteFileUrl)}`} />
                    ) : (
                      <PDFViewer url={listing.quoteFileUrl} />
                    )}
                  </div>
                </div>
              )}
              
              <h3 className="text-lg font-semibold mb-2">Renovation Suggestions</h3>
              <ul className="space-y-2 mb-6">
                {listing.renovationSuggestions && listing.renovationSuggestions.length > 0 ? (
                  listing.renovationSuggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <Hammer className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                      <div>
                        <span className="font-medium">{suggestion.title}</span>
                        <p className="text-sm text-gray-600">{suggestion.description}</p>
                      </div>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start">
                      <Hammer className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                      <div>
                        <span className="font-medium">Kitchen Remodel</span>
                        <p className="text-sm text-gray-600">Modern appliances, new countertops, and updated cabinetry</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Hammer className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                      <div>
                        <span className="font-medium">Bathroom Upgrades</span>
                        <p className="text-sm text-gray-600">New fixtures, tiling, and modern vanities</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Hammer className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                      <div>
                        <span className="font-medium">Flooring Replacement</span>
                        <p className="text-sm text-gray-600">Hardwood or luxury vinyl throughout main living areas</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Hammer className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                      <div>
                        <span className="font-medium">Fresh Paint</span>
                        <p className="text-sm text-gray-600">Interior and exterior painting with modern colors</p>
                      </div>
                    </li>
                  </>
                )}
              </ul>
              
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                onClick={() => {
                  if (listing?.suggestedContractor?.name) {
                    setShowConsultationModal(true);
                  } else {
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description: "No contractor information available for this property."
                    });
                  }
                }}
              >
                Schedule a Renovation Consultation
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Price Card */}
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle>Property Investment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">Listing Price</span>
                  </div>
                  <span className="font-bold">{formatCurrency(listing.listingPrice)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <div className="flex items-center">
                    <Hammer className="h-5 w-5 text-cyan-500 mr-2" />
                    <span className="text-gray-700">Renovation Budget</span>
                  </div>
                  <span className="font-bold text-cyan-600">{formatCurrency(listing.renovationCost)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-emerald-500 mr-2" />
                    <span className="text-gray-700">After Repair Value</span>
                  </div>
                  <span className="font-bold text-emerald-600">{formatCurrency(listing.afterRepairValue)}</span>
                </div>
                {/* <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Total Investment:</strong> {formatCurrency(listing.listingPrice + listing.renovationCost)}
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>Potential Profit:</strong> {formatCurrency(listing.afterRepairValue - (listing.listingPrice + listing.renovationCost))}
                  </p>
                </div> */}
              </div>
              {/* <div className="mt-4 space-y-3">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  Request a Showing
                </Button>
                <Button variant="outline" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50">
                  Download Property Details
                </Button>
              </div> */}
            </CardContent>
          </Card>

          {/* Agent Card */}
          {listing.agent && (
            <Card>
              <CardHeader>
                <CardTitle>Listed By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 mr-4 overflow-hidden flex items-center justify-center">
                    {listing.agent.image ? (
                      <Image 
                        src={listing.agent.image} 
                        alt={listing.agent.name} 
                        width={64} 
                        height={64} 
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-gray-400">
                        {listing.agent.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{listing.agent.name}</h3>
                    <p className="text-sm text-gray-500">Renograte Verified Agent</p>
                  </div>
                </div>
                {listing.agent.email && (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-500 mr-2" />
                      <a href={`mailto:${listing.agent.email}`} className="text-blue-600 hover:underline">{listing.agent.email}</a>
                    </div>
                  </div>
                )}
                <div className="mt-4">
                  <Button variant="outline" className="w-full">
                    Contact Agent
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Similar Properties */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Similar Properties</h2>
          <Link href="/listings/renograte-listings" className="text-blue-600 hover:underline">
            View All
          </Link>
        </div>
        <div className="flex justify-center">
          <p className="text-gray-500">Similar properties will appear here based on your browsing.</p>
        </div>
      </div>

      {/* Modals */}
      {renderImageModal()}
      {renderVideoModal()}
      {renderConsultationModal()}
    </div>
  );
}

export default function ListingDetailProtectedWrapper() {
  return (
    <RoleProtected allowedRoles={['user', 'member', 'agent', 'contractor', 'admin']}>
      <ListingDetailPage />
    </RoleProtected>
  );
} 