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
import { DollarSign, Image as ImageIcon, CheckCircle, X, UploadCloud, Video } from "lucide-react";
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
  { id: 4, name: "Review & Submit" },
];

export default function AddListingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // Property Details
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails>({
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
  });
  
  // Pricing & Terms
  const [pricingTerms, setPricingTerms] = useState<PricingTerms>({
    listingPrice: "",
    afterRepairValue: "",
    renovationCost: "",
    termsAvailable: "",
    additionalTerms: "",
  });
  
  // Photos & Media
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [virtualTourUrl, setVirtualTourUrl] = useState("");

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

  const MAX_IMAGE_SIZE = 0.5 * 1024 * 1024; // 0.5MB in bytes
  const MAX_VIDEO_SIZE = 5 * 1024 * 1024; // 5MB in bytes

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const validUrls: string[] = [];

    files.forEach(file => {
      if (file.size > MAX_IMAGE_SIZE) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: `${file.name} exceeds the 0.5MB limit. Please compress the image and try again.`
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
          description: "Video file exceeds the 5MB limit. Please compress the video and try again."
        });
        return;
      }
      setVideoFile(file);
      setVideoUrl(file.name);
    }
  };

  const submitListing = async () => {
    try {
      setIsSubmitting(true);
      
      // Upload photos to S3
      let photoUrls: string[] = [];
      if (photoFiles.length > 0) {
        photoUrls = await uploadMultipleFilesToS3(photoFiles);
      }

      // Upload video to S3 if exists
      let videoFileUrl = "";
      if (videoFile) {
        videoFileUrl = await uploadFileToS3(videoFile, 'videos/');
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
        videoUrl: videoFileUrl,
        virtualTourUrl,
        photos: photoUrls,
      };

      // Send data to API
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

      toast({
        title: "Success",
        description: "Listing submitted successfully! It will be reviewed by our team."
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error submitting listing:', error);
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

  return (
    <div className="space-y-6">
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
            {currentStep === 4 && "Review your listing before submission"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Property Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Modern Renovation Project"
                  value={propertyDetails.title}
                  onChange={handlePropertyDetailsChange} 
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input 
                    id="address" 
                    placeholder="Enter street address"
                    value={propertyDetails.address}
                    onChange={handlePropertyDetailsChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    placeholder="Enter city"
                    value={propertyDetails.city}
                    onChange={handlePropertyDetailsChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input 
                    id="state" 
                    placeholder="Enter state"
                    value={propertyDetails.state}
                    onChange={handlePropertyDetailsChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input 
                    id="zipCode" 
                    placeholder="Enter zip code"
                    value={propertyDetails.zipCode}
                    onChange={handlePropertyDetailsChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Property Type</Label>
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
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input 
                    id="bedrooms" 
                    type="number" 
                    min="0" 
                    value={propertyDetails.bedrooms}
                    onChange={handlePropertyDetailsChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
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
                  <Label htmlFor="squareFootage">Square Footage</Label>
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Property Description</Label>
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
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="listingPrice">Listing Price</Label>
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
                  <Label htmlFor="afterRepairValue">After Renovated Value (ARV)</Label>
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
                  <Label htmlFor="renovationCost">Estimated Renovation Cost</Label>
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
                  <Label htmlFor="terms">Terms Available</Label>
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
                    Upload high-quality photos of the property (max 0.5MB each). Include exterior, interior, and any areas needing renovation.
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
                    Upload a video tour of the property (max 5MB, optional)
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
              disabled={currentStep === 1}
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