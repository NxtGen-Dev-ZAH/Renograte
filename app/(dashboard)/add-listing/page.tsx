"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Image as ImageIcon, CheckCircle, X, UploadCloud, Video, Loader2, AlertCircle } from "lucide-react";
import { uploadFileToS3, uploadMultipleFilesToS3 } from "@/lib/s3";

interface PropertyDetails {
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  squareFootage: string;
  lotSize: string;
  yearBuilt: string;
  description: string;
  latitude: string;
  longitude: string;
}

interface PricingTerms {
  listingPrice: string;
  afterRepairValue: string;
  renovationCost: string;
  termsAvailable: string;
  additionalTerms: string;
}

const steps = [
  { id: 1, name: "Property Details" },
  { id: 2, name: "Pricing & Terms" },
  { id: 3, name: "Photos & Media" },
  { id: 4, name: "Renovation Planning" },
  { id: 5, name: "Review & Submit" },
];

// Initial state values
const initialPropertyDetails: PropertyDetails = {
  title: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  propertyType: "",
  bedrooms: "",
  bathrooms: "",
  squareFootage: "",
  lotSize: "",
  yearBuilt: "",
  description: "",
  latitude: "",
  longitude: "",
};

// US bounds for validation
const US_BOUNDS = {
  north: 49.38, // Northern border with Canada
  south: 24.52, // Southern tip of Florida
  west: -125.0, // Western coast
  east: -66.93  // Eastern coast
};

// Function to check if coordinates are within US bounds
const isWithinUSBounds = (lat: number, lng: number): boolean => {
  return (
    lat >= US_BOUNDS.south &&
    lat <= US_BOUNDS.north &&
    lng >= US_BOUNDS.west &&
    lng <= US_BOUNDS.east
  );
};

const initialPricingTerms: PricingTerms = {
  listingPrice: "",
  afterRepairValue: "",
  renovationCost: "",
  termsAvailable: "",
  additionalTerms: "",
};

const initialSuggestedRenovations = {
  kitchen: false,
  bathrooms: false,
  floors: false,
  windows: false,
  roofing: false,
  electrical: false,
  plumbing: false,
  painting: false,
  landscaping: false,
};

const initialSuggestedContractor = {
  name: "",
  phone: "",
  email: "",
  socialMedia: "",
};

// Initial renovation suggestions based on the user's request
const initialRenovationSuggestions = [
  {
    title: "Kitchen Remodel",
    description: "Modern appliances, new countertops, and updated cabinetry"
  },
  {
    title: "Bathroom Upgrades",
    description: "New fixtures, tiling, and modern vanities"
  },
  {
    title: "Flooring Replacement",
    description: "Hardwood or luxury vinyl throughout main living areas"
  },
  {
    title: "Fresh Paint",
    description: "Interior and exterior painting with modern colors"
  }
];

export default function AddListingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // Property Details
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails>(initialPropertyDetails);
  
  // Pricing & Terms
  const [pricingTerms, setPricingTerms] = useState<PricingTerms>(initialPricingTerms);
  
  // Photos & Media
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [virtualTourUrl, setVirtualTourUrl] = useState("");

  // Renovation Planning
  interface RenovationPlan {
  id: string;
  title: string;
  price: string;
  size: string;
  description: string;
  image: File | null;
  imageName: string;
  imageSize: string;
}

interface SuggestedContractor {
  name: string;
  phone: string;
  email: string;
  socialMedia: string;
}

interface SuggestedRenovations {
  kitchen: boolean;
  bathrooms: boolean;
  floors: boolean;
  windows: boolean;
  roofing: boolean;
  electrical: boolean;
  plumbing: boolean;
  painting: boolean;
  landscaping: boolean;
}

interface RenovationSuggestion {
  title: string;
  description: string;
}

  const [suggestedRenovations, setSuggestedRenovations] = useState<SuggestedRenovations>(initialSuggestedRenovations);
  const [renovationSuggestions, setRenovationSuggestions] = useState<RenovationSuggestion[]>(initialRenovationSuggestions);

  const [renovationPlans, setRenovationPlans] = useState<RenovationPlan[]>([
  {
    id: Date.now().toString(),
    title: "",
    price: "",
    size: "",
    description: "",
    image: null,
    imageName: "",
    imageSize: "",
  },
]);

const [estimatedTimeframe, setEstimatedTimeframe] = useState("");
const [suggestedContractor, setSuggestedContractor] = useState<SuggestedContractor>(initialSuggestedContractor);
const [quoteFile, setQuoteFile] = useState<File | null>(null);
const [quoteFileName, setQuoteFileName] = useState("");
const [quoteFileSize, setQuoteFileSize] = useState("");
const quoteFileInputRef = useRef<HTMLInputElement>(null);

  const handlePropertyDetailsChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setPropertyDetails(prev => ({ ...prev, [id]: value }));
  };

  const handlePropertyTypeChange = (value: string) => {
    setPropertyDetails(prev => ({ ...prev, propertyType: value }));
  };

  const handlePricingTermsChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setPricingTerms(prev => ({ ...prev, [id]: value }));
  };

  const handleTermsAvailableChange = (value: string) => {
    setPricingTerms(prev => ({ ...prev, termsAvailable: value }));
  };

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB in bytes

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const validUrls: string[] = [];

    files.forEach(file => {
      if (file.size > MAX_IMAGE_SIZE) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: `${file.name} exceeds the 5MB limit. Please compress the image and try again.`
        });
        return;
      }
      validFiles.push(file);
      validUrls.push(URL.createObjectURL(file));
    });

    if (validFiles.length > 0) {
      setPhotos(prev => [...prev, ...validUrls]);
      setPhotoFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoFiles(photoFiles.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const triggerVideoInput = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };

  const handleVideoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_VIDEO_SIZE) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Video file exceeds the 50MB limit. Please compress the video and try again."
        });
        return;
      }
      setVideoFile(file);
      setVideoUrl(file.name);
    }
  };

  // Reset form function
  const resetForm = () => {
    setPropertyDetails(initialPropertyDetails);
    setPricingTerms(initialPricingTerms);
    setPhotos([]);
    setPhotoFiles([]);
    setVideoUrl("");
    setVideoFile(null);
    setVirtualTourUrl("");
    setSuggestedRenovations(initialSuggestedRenovations);
    setRenovationPlans([{
      id: Date.now().toString(),
      title: "",
      price: "",
      size: "",
      description: "",
      image: null,
      imageName: "",
      imageSize: "",
    }]);
    setRenovationSuggestions(initialRenovationSuggestions);
    setEstimatedTimeframe("");
    setSuggestedContractor(initialSuggestedContractor);
    setQuoteFile(null);
    setQuoteFileName("");
    setQuoteFileSize("");
    setCurrentStep(1);
    setSubmissionStatus('idle');
    setSubmissionProgress(0);
  };

  const submitListing = async () => {
    try {
      setIsSubmitting(true);
      setSubmissionStatus('uploading');
      setSubmissionProgress(10);
      
      // Upload photos to S3
      let photoUrls: string[] = [];
      if (photoFiles.length > 0) {
        setSubmissionProgress(20);
        photoUrls = await uploadMultipleFilesToS3(photoFiles);
        setSubmissionProgress(40);
      }

      // Upload video to S3 if exists
      let videoFileUrl = "";
      if (videoFile) {
        setSubmissionProgress(50);
        videoFileUrl = await uploadFileToS3(videoFile, 'videos/');
        setSubmissionProgress(60);
      }
      
      // Upload renovation plan images to S3 if they exist
      setSubmissionStatus('processing');
      setSubmissionProgress(70);
      const renovationPlansWithUrls = await Promise.all(
        renovationPlans.map(async (plan) => {
          if (plan.image) {
            try {
              console.log(`Uploading renovation plan image: ${plan.title}`);
              const imageUrl = await uploadFileToS3(plan.image, 'renovation-plans/');
              console.log(`Successfully uploaded renovation plan image to: ${imageUrl}`);
              return { ...plan, imageUrl };
            } catch (error) {
              console.error(`Error uploading renovation plan image for ${plan.title}:`, error);
              toast({
                variant: "destructive",
                title: "Upload Error",
                description: `Failed to upload renovation plan image for ${plan.title}.`
              });
              return plan;
            }
          }
          return plan;
        })
      );
      
      // Upload quote PDF if it exists
      let quoteFileUrl = "";
      if (quoteFile) {
        try {
          setSubmissionProgress(80);
          console.log(`Uploading renovation quote PDF: ${quoteFileName}`);
          quoteFileUrl = await uploadFileToS3(quoteFile, 'renovation-quotes/');
          console.log(`Successfully uploaded renovation quote PDF to: ${quoteFileUrl}`);
        } catch (error) {
          console.error("Error uploading renovation quote PDF:", error);
          toast({
            variant: "destructive",
            title: "Upload Error",
            description: "Failed to upload renovation quote PDF."
          });
        }
      }

      // Define US bounds
      const US_BOUNDS = {
        north: 49.38, // Northern border with Canada
        south: 24.52, // Southern tip of Florida
        west: -125.0, // Western coast
        east: -66.93  // Eastern coast
      };

      // Function to clamp coordinates to US bounds
      const clampToUSBounds = (lat: number, lng: number): [number, number] => {
        const clampedLat = Math.max(US_BOUNDS.south, Math.min(US_BOUNDS.north, lat || 0));
        const clampedLng = Math.max(US_BOUNDS.west, Math.min(US_BOUNDS.east, lng || 0));
        return [clampedLat, clampedLng];
      };

      // Ensure coordinates are within US bounds
      let latitude = propertyDetails.latitude ? parseFloat(propertyDetails.latitude) : null;
      let longitude = propertyDetails.longitude ? parseFloat(propertyDetails.longitude) : null;

      // Only clamp if both values are provided
      if (latitude !== null && longitude !== null) {
        [latitude, longitude] = clampToUSBounds(latitude, longitude);
      }

      const listingData = {
        ...propertyDetails,
        ...pricingTerms,
        bedrooms: parseInt(propertyDetails.bedrooms),
        bathrooms: parseFloat(propertyDetails.bathrooms),
        squareFootage: parseInt(propertyDetails.squareFootage),
        yearBuilt: propertyDetails.yearBuilt ? parseInt(propertyDetails.yearBuilt) : null,
        listingPrice: parseFloat(pricingTerms.listingPrice),
        afterRepairValue: parseFloat(pricingTerms.afterRepairValue),
        renovationCost: parseFloat(pricingTerms.renovationCost),
        latitude: latitude,
        longitude: longitude,
        videoUrl: videoFileUrl,
        virtualTourUrl,
        photos: photoUrls,
        suggestedRenovations,
        renovationPlans: renovationPlansWithUrls,
        renovationSuggestions,
        estimatedTimeframe,
        suggestedContractor,
        quoteFileUrl,
      };

      // Send data to API
      setSubmissionProgress(90);
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(listingData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit listing');
      }

      setSubmissionProgress(100);
      setSubmissionStatus('success');
      
      toast({
        title: "Success",
        description: "Listing submitted successfully! It will be reviewed by our team."
      });
      
      // Don't immediately redirect, let the user see the success state
      
    } catch (error) {
      console.error('Error submitting listing:', error);
      setSubmissionStatus('error');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit listing. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format currency for display
  const formatCurrency = (amount: string | number | undefined): string => {
    if (!amount) return "$0";
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      maximumFractionDigits: 0 
    }).format(parseFloat(amount.toString()));
  };

  // Render submission status component
  const renderSubmissionStatus = () => {
    if (submissionStatus === 'idle') return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          {submissionStatus === 'error' ? (
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Submission Failed</h3>
              <p className="mt-2 text-sm text-gray-500">
                There was an error submitting your listing. Please try again.
              </p>
              <Button 
                className="mt-4 w-full" 
                onClick={() => setSubmissionStatus('idle')}
              >
                Try Again
              </Button>
            </div>
          ) : submissionStatus === 'success' ? (
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Listing Submitted!</h3>
              <p className="mt-2 text-sm text-gray-500">
                Your listing has been submitted successfully and will be reviewed by our team.
              </p>
              <div className="mt-4 flex space-x-3">
                <Button 
                  className="flex-1" 
                  variant="outline" 
                  onClick={() => router.push('/dashboard')}
                >
                  Go to Dashboard
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={resetForm}
                >
                  Add Another Listing
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {submissionStatus === 'uploading' ? 'Uploading Files...' : 'Processing Listing...'}
              </h3>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${submissionProgress}%` }}
                  ></div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {submissionProgress}% complete
                </p>
              </div>
              <p className="mt-4 text-xs text-gray-500">
                Please don't close this page while your listing is being submitted.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderSubmissionStatus()}
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create Listing</h2>
        <p className="text-muted-foreground">
          Add a new property listing with renovation potential
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between items-center">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex-1 relative ${
              step.id !== steps.length && "after:content-[''] after:absolute after:w-full after:h-[2px] after:top-1/2 after:ml-4"
            } ${
              step.id <= currentStep
                ? "after:bg-[#0C71C3]"
                : "after:bg-gray-200"
            }`}
          >
            <div className="flex items-center gap-4 mb-5 ">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.id <= currentStep
                    ? "bg-[#0C71C3] text-white "
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step.id < currentStep ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={`text-sm ${
                  step.id <= currentStep
                    ? "text-[#0C71C3] font-medium"
                    : "text-gray-500"
                }`}
              >
                {step.name}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Form Steps */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].name}</CardTitle>
          <CardDescription>
            {currentStep === 1 && "Enter the basic property information"}
            {currentStep === 2 && "Set pricing and terms for the property"}
            {currentStep === 3 && "Upload photos and media content"}
            {currentStep === 4 && "Add renovation details and plans"}
            {currentStep === 5 && "Review your listing before submission"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-blue-600 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">
                      Required Fields
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Fields marked with{" "}
                      <span className="text-red-500 font-semibold">*</span> are
                      required. Please fill in all required information to
                      proceed to the next step.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                  Property Title
                  <span className="text-red-500 text-sm">*</span>
                </Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Modern Renovation Project"
                  value={propertyDetails.title}
                  onChange={handlePropertyDetailsChange} 
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    Street Address
                    <span className="text-red-500 text-sm">*</span>
                  </Label>
                  <Input 
                    id="address" 
                    placeholder="Enter street address"
                    value={propertyDetails.address}
                    onChange={handlePropertyDetailsChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="flex items-center gap-2">
                    City
                    <span className="text-red-500 text-sm">*</span>
                  </Label>
                  <Input 
                    id="city" 
                    placeholder="Enter city"
                    value={propertyDetails.city}
                    onChange={handlePropertyDetailsChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="flex items-center gap-2">
                    State
                    <span className="text-red-500 text-sm">*</span>
                  </Label>
                  <Input 
                    id="state" 
                    placeholder="Enter state"
                    value={propertyDetails.state}
                    onChange={handlePropertyDetailsChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="flex items-center gap-2">
                    Zip Code
                    <span className="text-red-500 text-sm">*</span>
                  </Label>
                  <Input 
                    id="zipCode" 
                    placeholder="Enter zip code"
                    value={propertyDetails.zipCode}
                    onChange={handlePropertyDetailsChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="flex items-center gap-2">
                    Property Type
                    <span className="text-red-500 text-sm">*</span>
                  </Label>
                  <Select onValueChange={handlePropertyTypeChange} value={propertyDetails.propertyType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Family</SelectItem>
                      <SelectItem value="multi">Multi Family</SelectItem>
                      <SelectItem value="condo">Condo/Apartment</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bedrooms" className="flex items-center gap-2">
                    Bedrooms
                    <span className="text-red-500 text-sm">*</span>
                  </Label>
                  <Input 
                    id="bedrooms" 
                    type="number" 
                    min="0" 
                    value={propertyDetails.bedrooms}
                    onChange={handlePropertyDetailsChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms" className="flex items-center gap-2">
                    Bathrooms
                    <span className="text-red-500 text-sm">*</span>
                  </Label>
                  <Input 
                    id="bathrooms" 
                    type="number" 
                    min="0" 
                    step="1" 
                    value={propertyDetails.bathrooms}
                    onChange={handlePropertyDetailsChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="squareFootage" className="flex items-center gap-2">
                    Square Footage
                    <span className="text-red-500 text-sm">*</span>
                  </Label>
                  <Input 
                    id="squareFootage" 
                    type="number" 
                    min="0" 
                    value={propertyDetails.squareFootage}
                    onChange={handlePropertyDetailsChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lotSize">Lot Size</Label>
                  <Input 
                    id="lotSize" 
                    placeholder="e.g., 0.25 acres" 
                    value={propertyDetails.lotSize}
                    onChange={handlePropertyDetailsChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearBuilt">Year Built</Label>
                  <Input 
                    id="yearBuilt" 
                    type="number" 
                    placeholder="e.g., 1995" 
                    value={propertyDetails.yearBuilt}
                    onChange={handlePropertyDetailsChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <div className="relative">
                    <Input 
                      id="latitude" 
                      type="number" 
                      step="any"
                      placeholder="e.g., 25.324 to 49.391" 
                      value={propertyDetails.latitude}
                      onChange={(e) => {
                        const value = e.target.value;
                        setPropertyDetails(prev => ({ ...prev, latitude: value }));
                      }}
                      min="24.52"
                      max="49.38"
                      className={propertyDetails.latitude && !isWithinUSBounds(
                        parseFloat(propertyDetails.latitude || "0"), 
                        parseFloat(propertyDetails.longitude || "0")
                      ) ? "border-red-300 pr-10" : ""}
                    />
                    {propertyDetails.latitude && !isWithinUSBounds(
                      parseFloat(propertyDetails.latitude || "0"), 
                      parseFloat(propertyDetails.longitude || "0")
                    ) && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Valid range: 24.52 (Southern Florida) to 49.38 (Northern border)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <div className="relative">
                    <Input 
                      id="longitude" 
                      type="number" 
                      step="any"
                      placeholder="e.g., -67.324 to -125.391" 
                      value={propertyDetails.longitude}
                      onChange={(e) => {
                        const value = e.target.value;
                        setPropertyDetails(prev => ({ ...prev, longitude: value }));
                      }}
                      min="-125.0"
                      max="-66.93"
                      className={propertyDetails.longitude && !isWithinUSBounds(
                        parseFloat(propertyDetails.latitude || "0"), 
                        parseFloat(propertyDetails.longitude || "0")
                      ) ? "border-red-300 pr-10" : ""}
                    />
                    {propertyDetails.longitude && !isWithinUSBounds(
                      parseFloat(propertyDetails.latitude || "0"), 
                      parseFloat(propertyDetails.longitude || "0")
                    ) && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Valid range: -125.0 (Western coast) to -66.93 (Eastern coast)
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  Property Description
                  <span className="text-red-500 text-sm">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the property and its renovation potential"
                  rows={4}
                  value={propertyDetails.description}
                  onChange={handlePropertyDetailsChange}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-blue-600 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">
                      Required Fields
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Fields marked with{" "}
                      <span className="text-red-500 font-semibold">*</span> are
                      required. Please fill in all required information to
                      proceed to the next step.
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="listingPrice" className="flex items-center gap-2">
                    Listing Price
                    <span className="text-red-500 text-sm">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="listingPrice" 
                      type="number" 
                      min="0" 
                      className="pl-9" 
                      value={pricingTerms.listingPrice}
                      onChange={handlePricingTermsChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="afterRepairValue" className="flex items-center gap-2">
                    After Renovated Value (ARV)
                    <span className="text-red-500 text-sm">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="afterRepairValue" 
                      type="number" 
                      min="0" 
                      className="pl-9" 
                      value={pricingTerms.afterRepairValue}
                      onChange={handlePricingTermsChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="renovationCost" className="flex items-center gap-2">
                    Estimated Renovation Cost
                    <span className="text-red-500 text-sm">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="renovationCost" 
                      type="number" 
                      min="0" 
                      className="pl-9" 
                      value={pricingTerms.renovationCost}
                      onChange={handlePricingTermsChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="terms" className="flex items-center gap-2">
                    Terms Available
                    <span className="text-red-500 text-sm">*</span>
                  </Label>
                  <Select onValueChange={handleTermsAvailableChange} value={pricingTerms.termsAvailable}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash Only</SelectItem>
                      <SelectItem value="conventional">Conventional</SelectItem>
                      <SelectItem value="fha">FHA</SelectItem>
                      <SelectItem value="va">VA</SelectItem>
                      <SelectItem value="owner">Owner Financing</SelectItem>
                      <SelectItem value="ns">Not Specified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="additionalTerms">Additional Terms</Label>
                <Textarea
                  id="additionalTerms"
                  placeholder="Enter any additional terms or conditions"
                  rows={4}
                  value={pricingTerms.additionalTerms}
                  onChange={handlePricingTermsChange}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
                <div className="text-center mb-4">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Property Photos</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Upload high-quality photos of the property (max 5MB each). Include exterior, interior, and any areas needing renovation.
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                <div className="mt-4 flex justify-center">
                  <Button 
                    onClick={triggerFileInput}
                    type="button"
                    className="flex items-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Upload Photos
                  </Button>
                </div>
                
                {/* Display uploaded photos */}
                {photos.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Uploaded Photos</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-md overflow-hidden border border-gray-200">
                            <img
                              src={photo}
                              alt={`Property photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removePhoto(index)}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Video Section */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
                <div className="text-center mb-4">
                  <Video className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Property Video</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Upload a video tour of the property (max 50MB, optional)
                  </p>
                </div>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoUpload}
                />
                <div className="mt-4 flex justify-center">
                  <Button 
                    onClick={triggerVideoInput}
                    type="button"
                    className="flex items-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Upload Video
                  </Button>
                </div>
                
                {/* Display video file name if uploaded */}
                {videoUrl && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-green-600 font-medium">
                      Video uploaded: {videoUrl}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="virtualTourUrl">Virtual Tour Link (optional)</Label>
                <Input 
                  id="virtualTourUrl" 
                  placeholder="Enter virtual tour URL" 
                  value={virtualTourUrl}
                  onChange={(e) => setVirtualTourUrl(e.target.value)}
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Suggested Renovations</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="kitchen"
                      checked={suggestedRenovations.kitchen}
                      onChange={(e) => setSuggestedRenovations(prev => ({ ...prev, kitchen: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="kitchen">Kitchen</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="bathrooms"
                      checked={suggestedRenovations.bathrooms}
                      onChange={(e) => setSuggestedRenovations(prev => ({ ...prev, bathrooms: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="floors"
                      checked={suggestedRenovations.floors}
                      onChange={(e) => setSuggestedRenovations(prev => ({ ...prev, floors: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="floors">Floors</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="windows"
                      checked={suggestedRenovations.windows}
                      onChange={(e) => setSuggestedRenovations(prev => ({ ...prev, windows: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="windows">Windows</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="roofing"
                      checked={suggestedRenovations.roofing}
                      onChange={(e) => setSuggestedRenovations(prev => ({ ...prev, roofing: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="roofing">Roofing</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="electrical"
                      checked={suggestedRenovations.electrical}
                      onChange={(e) => setSuggestedRenovations(prev => ({ ...prev, electrical: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="electrical">Electrical</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="plumbing"
                      checked={suggestedRenovations.plumbing}
                      onChange={(e) => setSuggestedRenovations(prev => ({ ...prev, plumbing: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="plumbing">Plumbing</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="painting"
                      checked={suggestedRenovations.painting}
                      onChange={(e) => setSuggestedRenovations(prev => ({ ...prev, painting: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="painting">Painting</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="landscaping"
                      checked={suggestedRenovations.landscaping}
                      onChange={(e) => setSuggestedRenovations(prev => ({ ...prev, landscaping: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="landscaping">Landscaping</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 mt-6">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-medium text-gray-900">Renovation Suggestions</h3>
                  {renovationSuggestions.length < 8 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (renovationSuggestions.length < 8) {
                          setRenovationSuggestions([
                            ...renovationSuggestions,
                            {
                              title: "",
                              description: ""
                            },
                          ]);
                        }
                      }}
                      className="text-sm"
                    >
                      Add Suggestion
                    </Button>
                  )}
                </div>
                
                {renovationSuggestions.map((suggestion, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Suggestion {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRenovationSuggestions(renovationSuggestions.filter((_, i) => i !== index));
                        }}
                        className="text-red-500 h-8 px-2"
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`suggestion-title-${index}`}>Title</Label>
                      <Input
                        id={`suggestion-title-${index}`}
                        placeholder="e.g., Kitchen Remodel"
                        value={suggestion.title}
                        onChange={(e) => {
                          const newSuggestions = [...renovationSuggestions];
                          newSuggestions[index].title = e.target.value;
                          setRenovationSuggestions(newSuggestions);
                        }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`suggestion-description-${index}`}>Description</Label>
                      <Textarea
                        id={`suggestion-description-${index}`}
                        placeholder="Enter suggestion details"
                        rows={2}
                        value={suggestion.description}
                        onChange={(e) => {
                          const newSuggestions = [...renovationSuggestions];
                          newSuggestions[index].description = e.target.value;
                          setRenovationSuggestions(newSuggestions);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4 mt-6">
                <h3 className="font-medium text-gray-900 border-b pb-2">Estimated Project Timeframe</h3>
                <div className="space-y-2">
                  <Label htmlFor="timeframe">Estimated Completion Time</Label>
                  <Select 
                    value={estimatedTimeframe} 
                    onValueChange={setEstimatedTimeframe}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select estimated timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                      <SelectItem value="2-4 weeks">2-4 weeks</SelectItem>
                      <SelectItem value="1-2 months">1-2 months</SelectItem>
                      <SelectItem value="2-3 months">2-3 months</SelectItem>
                      <SelectItem value="3-6 months">3-6 months</SelectItem>
                      <SelectItem value="6+ months">6+ months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4 mt-6">
                <h3 className="font-medium text-gray-900 border-b pb-2">Suggested Contractor Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contractor-name">Name of Contractor</Label>
                    <Input
                      id="contractor-name"
                      placeholder="Enter contractor name"
                      value={suggestedContractor.name}
                      onChange={(e) => setSuggestedContractor(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contractor-phone">Phone Number</Label>
                    <Input
                      id="contractor-phone"
                      placeholder="Enter phone number"
                      value={suggestedContractor.phone}
                      onChange={(e) => setSuggestedContractor(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contractor-email">Email Address</Label>
                    <Input
                      id="contractor-email"
                      placeholder="Enter email address"
                      value={suggestedContractor.email}
                      onChange={(e) => setSuggestedContractor(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contractor-social">Social Media Accounts</Label>
                    <Input
                      id="contractor-social"
                      placeholder="Enter social media handles"
                      value={suggestedContractor.socialMedia}
                      onChange={(e) => setSuggestedContractor(prev => ({ ...prev, socialMedia: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 mt-6">
                <h3 className="font-medium text-gray-900 border-b pb-2">Renovation Quote</h3>
                <div className="space-y-2">
                  <Label>Upload Renovation Quote PDF</Label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-500">Upload renovation quote PDF (Max: 2GB)</p>
                      <input
                        ref={quoteFileInputRef}
                        type="file"
                        accept="application/pdf"
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setQuoteFile(file);
                            setQuoteFileName(file.name);
                            setQuoteFileSize((file.size / (1024 * 1024)).toFixed(2) + " MB");
                          }
                        }}
                      />
                    </div>
                    {quoteFileName && (
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-gray-700">{quoteFileName}</span>
                        <span className="text-gray-500">{quoteFileSize}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-medium text-gray-900">Renovation Plans</h3>
                  {renovationPlans.length < 6 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (renovationPlans.length < 6) {
                          setRenovationPlans([
                            ...renovationPlans,
                            {
                              id: Date.now().toString(),
                              title: "",
                              price: "",
                              size: "",
                              description: "",
                              image: null,
                              imageName: "",
                              imageSize: "",
                            },
                          ]);
                        }
                      }}
                      className="text-sm"
                    >
                      Add Plan
                    </Button>
                  )}
                </div>
                
                {renovationPlans.map((plan, index) => (
                  <div key={plan.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Plan {index + 1}</h4>
                      {renovationPlans.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setRenovationPlans(renovationPlans.filter((_, i) => i !== index));
                          }}
                          className="text-red-500 h-8 px-2"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`plan-title-${index}`}>Plan Title</Label>
                        <Input
                          id={`plan-title-${index}`}
                          placeholder="e.g., Kitchen Remodel Plan"
                          value={plan.title}
                          onChange={(e) => {
                            const newPlans = [...renovationPlans];
                            newPlans[index].title = e.target.value;
                            setRenovationPlans(newPlans);
                          }}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`plan-price-${index}`}>Price</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id={`plan-price-${index}`}
                            placeholder="e.g., 5000"
                            className="pl-9"
                            value={plan.price}
                            onChange={(e) => {
                              const newPlans = [...renovationPlans];
                              newPlans[index].price = e.target.value;
                              setRenovationPlans(newPlans);
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`plan-size-${index}`}>Plan Size</Label>
                        <Input
                          id={`plan-size-${index}`}
                          placeholder="e.g., 10x12 feet"
                          value={plan.size}
                          onChange={(e) => {
                            const newPlans = [...renovationPlans];
                            newPlans[index].size = e.target.value;
                            setRenovationPlans(newPlans);
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Plan Image</Label>
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                          <p className="text-sm text-gray-500">Upload plan image (Max: 2GB)</p>
                          <input
                            type="file"
                            accept="image/*"
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const newPlans = [...renovationPlans];
                                newPlans[index].image = file;
                                newPlans[index].imageName = file.name;
                                newPlans[index].imageSize = (file.size / (1024 * 1024)).toFixed(2) + " MB";
                                setRenovationPlans(newPlans);
                              }
                            }}
                          />
                        </div>
                        {plan.imageName && (
                          <div className="mt-2 flex items-center justify-between text-sm">
                            <span className="text-gray-700">{plan.imageName}</span>
                            <span className="text-gray-500">{plan.imageSize}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`plan-description-${index}`}>Description</Label>
                      <Textarea
                        id={`plan-description-${index}`}
                        placeholder="Enter plan description"
                        rows={3}
                        value={plan.description}
                        onChange={(e) => {
                          const newPlans = [...renovationPlans];
                          newPlans[index].description = e.target.value;
                          setRenovationPlans(newPlans);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
                <h3 className="font-medium text-blue-800 mb-2">Review your listing details</h3>
                <p className="text-sm text-blue-700">
                  Please review all information before submitting. Once submitted, your listing will be reviewed by our team before it appears on the Renograte Listings page.
                </p>
              </div>
              
              {/* Property Details Summary */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Property Details</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <span className="text-sm text-gray-500">Title:</span>
                    <p className="font-medium">{propertyDetails.title || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Address:</span>
                    <p className="font-medium">
                      {propertyDetails.address && propertyDetails.city ? 
                        `${propertyDetails.address}, ${propertyDetails.city}, ${propertyDetails.state} ${propertyDetails.zipCode}` : 
                        "Not provided"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Latitude:</span>
                    <p className="font-medium">{propertyDetails.latitude || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Longitude:</span>
                    <p className="font-medium">{propertyDetails.longitude || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Property Type:</span>
                    <p className="font-medium">
                      {propertyDetails.propertyType === 'single' ? 'Single Family' :
                       propertyDetails.propertyType === 'multi' ? 'Multi Family' :
                       propertyDetails.propertyType === 'condo' ? 'Condo/Apartment' :
                       propertyDetails.propertyType === 'commercial' ? 'Commercial' : 
                       'Not provided'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Size:</span>
                    <p className="font-medium">
                      {propertyDetails.bedrooms && propertyDetails.bathrooms ? 
                        `${propertyDetails.bedrooms} beds, ${propertyDetails.bathrooms} baths, ${propertyDetails.squareFootage} sqft` : 
                        "Not provided"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-sm text-gray-500">Description:</span>
                    <p className="font-medium">{propertyDetails.description || "Not provided"}</p>
                  </div>
                </div>
              </div>
              
              {/* Pricing Details Summary */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Pricing & Terms</h3>
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <span className="text-sm text-gray-500">Listing Price:</span>
                    <p className="font-medium text-green-700">
                      {pricingTerms.listingPrice ? formatCurrency(pricingTerms.listingPrice) : "$0"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Renovation Cost:</span>
                    <p className="font-medium text-amber-700">
                      {pricingTerms.renovationCost ? formatCurrency(pricingTerms.renovationCost) : "$0"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">After Repair Value:</span>
                    <p className="font-medium text-blue-700">
                      {pricingTerms.afterRepairValue ? formatCurrency(pricingTerms.afterRepairValue) : "$0"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Terms Available:</span>
                    <p className="font-medium">
                      {pricingTerms.termsAvailable ? 
                        pricingTerms.termsAvailable.charAt(0).toUpperCase() + pricingTerms.termsAvailable.slice(1) : 
                        "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Media Summary */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Photos & Media</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Photos:</span>
                    <p className="font-medium">{photos.length} photos uploaded</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Video:</span>
                    <p className="font-medium">{videoUrl ? "Video uploaded" : "None"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Virtual Tour:</span>
                    <p className="font-medium">{virtualTourUrl || "None"}</p>
                  </div>
                </div>
              </div>
              
              {/* Renovation Planning Summary */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Renovation Planning</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Suggested Renovations:</span>
                    <p className="font-medium">
                      {Object.entries(suggestedRenovations)
                        .filter(([_, isSelected]) => isSelected)
                        .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
                        .join(", ") || "None selected"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Renovation Plans:</span>
                    <p className="font-medium">{renovationPlans.filter(plan => plan.title).length} plans added</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Renovation Suggestions:</span>
                    <p className="font-medium">{renovationSuggestions.filter(suggestion => suggestion.title).length} suggestions added</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Estimated Timeframe:</span>
                    <p className="font-medium">{estimatedTimeframe || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Suggested Contractor:</span>
                    <p className="font-medium">{suggestedContractor.name || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Quote Document:</span>
                    <p className="font-medium">{quoteFileName || "None uploaded"}</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-100">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-yellow-800">Submission Agreement</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      By submitting this listing, you agree that all information provided is accurate and you have the authorization to list this property. The listing will be reviewed by our team before being published on the Renograte Listings page.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1 || isSubmitting}
            >
              Previous
            </Button>
            <Button
              onClick={() => {
                if (currentStep < steps.length) {
                  setCurrentStep(currentStep + 1);
                } else {
                  // Submit the form
                  submitListing();
                }
              }}
              disabled={isSubmitting}
            >
              {currentStep < steps.length 
                ? "Next" 
                : isSubmitting 
                  ? "Submitting..." 
                  : "Submit Listing"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 