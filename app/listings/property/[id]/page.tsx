"use client";

import { useState, useEffect, Suspense } from 'react';
import useRealtyFeedApi from '@/hooks/useRealtyFeedApi';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Home, Bed, Bath, Square, MapPin } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { Property, Media } from '@/types/property';
import { Button } from '@/components/ui/button';
import RoleProtected from '@/components/RoleProtected';

// Dynamically import map components with no SSR
const PropertyMap = dynamic(() => import('@/components/maps/PropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
});

const PropertyMapOverlay = dynamic(() => import('@/components/maps/PropertyMapOverlay'), {
  ssr: false
});

interface PropertyResponse {
  value: Property[];
}

export default function PropertyDetailProtectedWrapper() {
  return (
    <RoleProtected allowedRoles={['user', 'member', 'agent', 'contractor', 'admin']}>
      <PropertyDetailPage />
    </RoleProtected>
  );
}

export function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [neighboringProperties, setNeighboringProperties] = useState<Property[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | undefined>(undefined);
  const [showMapOverlay, setShowMapOverlay] = useState(false);
  
  // Build a more detailed query to get all property information
  const propertyQuery = `Property?$filter=ListingKey eq '${propertyId}'&$expand=Media&$select=ListingKey,StandardStatus,PropertyType,PropertySubType,ListPrice,StreetNumber,StreetName,City,StateOrProvince,PostalCode,BedroomsTotal,BathroomsTotalInteger,LivingArea,LotSizeAcres,LotSizeSquareFeet,YearBuilt,Latitude,Longitude,PublicRemarks,SubdivisionName,ListOfficeName,ListAgentFullName,InteriorFeatures,ExteriorFeatures,Appliances,Heating,Cooling,ParkingFeatures,WaterSource,Utilities,Construction,RoomsTotal,TaxAssessedValue,TaxAnnualAmount`;

  const { data, error: apiError, loading } = useRealtyFeedApi<PropertyResponse>(propertyQuery);

  // Process the API response
  useEffect(() => {
    if (data && !loading) {
      if (data.value && data.value.length > 0) {
        setProperty(data.value[0]);
        
        // Set the first image as selected by default
        if (data.value[0].Media && data.value[0].Media.length > 0) {
          const sortedMedia = data.value[0].Media.sort((a, b) => {
            const orderA = a.Order ?? Number.MAX_SAFE_INTEGER;
            const orderB = b.Order ?? Number.MAX_SAFE_INTEGER;
            return orderA - orderB;
          });
          const firstImageUrl = sortedMedia[0].MediaURL;
          setSelectedImage(firstImageUrl);
        }
      } else {
        setError('Property not found');
      }
    }
    
    if (apiError) {
      setError(apiError);
    }
  }, [data, loading, apiError]);

  // Combine the main property with neighboring properties for the map
  const mapProperties = property ? [property, ...neighboringProperties] : [];
  const mainPropertyId = property?.ListingKey;

  // Fetch neighboring properties once we have the main property
  useEffect(() => {
    const currentProperty = property;
    if (!currentProperty) return;
    
    const fetchNeighboringProperties = async () => {
      try {
        if (!currentProperty?.City) {
          setNeighboringProperties([]);
          return;
        }

        // Query properties in the same city, with similar price range
        const priceMin = Math.max(currentProperty.ListPrice * 0.7, 100000);
        const priceMax = currentProperty.ListPrice * 1.3;
        
        const query = `Property?$filter=` +
          `City eq '${currentProperty.City}' and ` +
          `ListingKey ne '${currentProperty.ListingKey}' and ` +
          `StandardStatus eq 'Active' and ` +
          `ListPrice ge ${Math.round(priceMin)} and ` +
          `ListPrice le ${Math.round(priceMax)}` +
          `&$select=ListingKey,StandardStatus,PropertyType,ListPrice,StreetNumber,StreetName,` +
          `City,StateOrProvince,PostalCode,BedroomsTotal,BathroomsTotalInteger,LivingArea,` +
          `Latitude,Longitude&$top=15`;
        
        const response = await fetch(`/api/realtyfeed?resource=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (!response.ok || !data.value || !Array.isArray(data.value)) {
          setNeighboringProperties([]);
          return;
        }

        // Sort by distance if coordinates are available
        if (currentProperty.Latitude && currentProperty.Longitude) {
          data.value.sort((a: Property, b: Property) => {
            if (!a.Latitude || !a.Longitude || !b.Latitude || !b.Longitude) return 0;
            const lat = currentProperty.Latitude!;
            const lng = currentProperty.Longitude!;
            const distA = Math.sqrt(
              Math.pow(a.Latitude - lat, 2) + 
              Math.pow(a.Longitude - lng, 2)
            );
            const distB = Math.sqrt(
              Math.pow(b.Latitude - lat, 2) + 
              Math.pow(b.Longitude - lng, 2)
            );
            return distA - distB;
          });
        }
        
        setNeighboringProperties(data.value);
      } catch (err) {
        setNeighboringProperties([]);
      }
    };
    
    fetchNeighboringProperties();
  }, [property]);

  // Handle map marker click
  const handleMarkerClick = (propertyId: string) => {
    if (propertyId !== property?.ListingKey) {
      router.push(`/listings/property/${propertyId}`);
    }
  };

  // Helper function to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    }).format(price);
  };

  // Calculate renovation potential and after renovation value
  const calculateRenovationDetails = (property: Property) => {
    // Calculate dynamic ARV multiplier based on property characteristics
    let arvMultiplier = 1.15; // Base multiplier (15% increase)
    
    // Adjust for bedrooms (0-3% impact)
    const bedroomAdjustment = property.BedroomsTotal >= 4 ? 0.03 : 
                             property.BedroomsTotal === 3 ? 0.02 : 
                             property.BedroomsTotal === 2 ? 0.01 : 0;
    
    // Adjust for bathrooms (0-3% impact)
    const bathroomAdjustment = property.BathroomsTotalInteger >= 3 ? 0.03 : 
                              property.BathroomsTotalInteger === 2 ? 0.02 : 0.01;
    
    // Adjust for square footage (0-4% impact)
    let areaSizeAdjustment = 0;
    if (property.LivingArea) {
      if (property.LivingArea < 1000) areaSizeAdjustment = 0;
      else if (property.LivingArea < 1500) areaSizeAdjustment = 0.01;
      else if (property.LivingArea < 2000) areaSizeAdjustment = 0.02;
      else if (property.LivingArea < 2500) areaSizeAdjustment = 0.03;
      else areaSizeAdjustment = 0.04;
    }
    
    // Adjust for property type (0-3% impact)
    let typeAdjustment = 0;
    const propertyType = property.PropertySubType || property.PropertyType;
    if (propertyType === "Condominium") {
      typeAdjustment = 0.01;
    } else if (propertyType === "Townhouse") {
      typeAdjustment = 0.02;
    } else if (propertyType === "Residential") {
      typeAdjustment = 0.03;
    }
    
    // Adjust for age (0-4% impact)
    let ageAdjustment = 0;
    if (property.YearBuilt) {
      const age = new Date().getFullYear() - property.YearBuilt;
      if (age > 50) ageAdjustment = 0.04;
      else if (age > 30) ageAdjustment = 0.03;
      else if (age > 15) ageAdjustment = 0.02;
      else if (age > 5) ageAdjustment = 0.01;
    }
    
    // Create a unique property identifier based on address
    const uniqueIdentifier = property.StreetNumber + property.StreetName + property.City + property.PostalCode;
    
    // Generate a deterministic variation factor using the property address
    const hashValue = uniqueIdentifier.split('').reduce((acc, char, idx) => {
      return acc + (char.charCodeAt(0) * (idx + 1));
    }, 0);
    
    // Create a variation factor between -2% and +2%
    const addressVariationFactor = -0.02 + ((hashValue % 40) / 1000);
    
    // Combine all adjustments
    const totalAdjustment = bedroomAdjustment + bathroomAdjustment + areaSizeAdjustment + 
                           typeAdjustment + ageAdjustment + addressVariationFactor;
    
    // Final ARV multiplier (between 1.15 and 1.35, or 15% to 35% increase)
    const finalMultiplier = Math.min(Math.max(arvMultiplier + totalAdjustment, 1.15), 1.35);
    
    // Calculate ARV
    const arv = Math.round(property.ListPrice * finalMultiplier);
    
    // Fixed TARR at 87%
    const TARR = 0.87;
    
    // Calculate TARA
    const TARA = TARR * arv;
    
    // Calculate Renovation Allowance
    const renovationAllowance = Math.max(0, Math.round(TARA - property.ListPrice));
    
    return {
      renovationAllowance,
      afterRenovationValue: arv
    };
  };

  // Helper function to format address
  const formatAddress = (property: Property) => {
    return `${property.StreetNumber} ${property.StreetName}, ${property.City}, ${property.StateOrProvince} ${property.PostalCode}`;
  };

  // Helper function to get property type display name
  const getPropertyTypeDisplay = (type: string) => {
    switch(type) {
      case 'Condominium': return 'Condominium';
      case 'Townhouse': return 'Townhouse';
      case 'Land': return 'Land';
      case 'Commercial': return 'Commercial';
      case 'Residential':
      default: return 'Single Family Residence';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col">
        <div className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col">
        <div className="flex-1 container mx-auto px-4 py-12">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Error: {error}</p>
            <Link href="/properties" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col">
        <div className="flex-1 container mx-auto px-4 py-12">
          <p>Property not found</p>
          <Link href="/properties" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col">
      <div className="flex flex-col container mx-auto px-4 py-8 mt-10"> 
      {/* Back to listings */}
      <Link href="/properties" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to listings
      </Link>
      
      {/* Property status banner */}
      <div className="bg-blue-500 text-white py-2 px-4 rounded mb-6 inline-block w-fit">
        {property.StandardStatus === 'Coming Soon' ? 'COMING SOON' : 'NEW LISTING'}
      </div>
      
      {/* Property title and pricing information */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{formatAddress(property)}</h1>
          <div className="text-lg text-green-600 mb-1">
            {getPropertyTypeDisplay(property.PropertyType)} · {property.SubdivisionName && `${property.SubdivisionName} Subdivision`}
          </div>
        </div>
        
        {/* Pricing Information Box */}
        <div className="w-full md:w-auto bg-white rounded-lg shadow-lg p-6 mt-4 md:mt-0">
          <div className="space-y-4">
            {/* Current Price */}
            <div>
              <div className="text-gray-600 text-sm font-medium">Current Price</div>
              <div className="text-3xl font-bold text-gray-900">
                {formatPrice(property.ListPrice)}
              </div>
            </div>
            
            {/* Only show renovation details for non-Land properties */}
            {property.PropertyType !== 'Land' && (
              <>
                {/* Renovation Allowance */}  
                <div>
                  <div className="text-gray-600 text-sm font-medium">Renovation Allowance</div>
                  <div className="text-2xl font-semibold text-blue-600">
                    {formatPrice(calculateRenovationDetails(property).renovationAllowance)}
                  </div>
                </div>
                
                {/* After Renovation Value */}
                <div>
                  <div className="text-gray-600 text-sm font-medium">After Renovation Value</div>
                  <div className="text-2xl font-semibold text-green-600">
                    {formatPrice(calculateRenovationDetails(property).afterRenovationValue)}
                  </div>
                </div>
              </>
            )}
            
            {/* Potential ROI */}
            {/* <div className="pt-3 border-t">
              <div className="text-gray-600 text-sm font-medium">Potential ROI</div>
              <div className="text-xl font-semibold text-purple-600">
                {Math.round(((calculateRenovationDetails(property).afterRenovationValue - property.ListPrice) / property.ListPrice) * 100)}%
              </div>
            </div> */}
          </div>
        </div>
      </div>
      
      {/* Property media gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Main image */}
        <div className="md:col-span-2">
          <div className="bg-gray-100 rounded-lg overflow-hidden h-96 relative">
            {selectedImage ? (
              <Image 
                src={selectedImage}
                alt="Property main image"
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                priority
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQrJiEkKic0Ly4vLy4xOzw6Njs8OzFEREREREREREREREREREREREREREf/2wBDAR0XFyAeIB4gHh4gIiAdIB0gHR0dHSAdIB0gHiAdICAgICAgIB4eICAgICAgICAgICAgICAgICAgICAgICAgICAgICf/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                quality={85}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-500">No Images Available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Thumbnails */}
        <div className="h-96 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-2">
            {property.Media && property.Media.length > 0 ? (
              property.Media
                .sort((a, b) => {
                  const orderA = a.Order ?? Number.MAX_SAFE_INTEGER;
                  const orderB = b.Order ?? Number.MAX_SAFE_INTEGER;
                  return orderA - orderB;
                })
                .map((media, index) => (
                  <div 
                    key={index} 
                    className={`cursor-pointer rounded-lg overflow-hidden h-24 relative border-2 ${selectedImage === media.MediaURL ? 'border-blue-500' : 'border-transparent'}`}
                    onClick={() => setSelectedImage(media.MediaURL)}
                  >
                    <Image 
                      src={media.MediaURL}
                      alt={`Property image ${index + 1}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 16vw, 12vw"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQrJiEkKic0Ly4vLy4xOzw6Njs8OzFEREREREREREREREREREREREREREf/2wBDAR0XFyAeIB4gHh4gIiAdIB0gHR0dHSAdIB0gHiAdICAgICAgIB4eICAgICAgICAgICAgICAgICAgICAgICAgICAgICf/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                      quality={75}
                    />
                  </div>
                ))
            ) : (
              <div className="col-span-2 text-center">
                <p className="text-gray-500">No additional images</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Property details grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {/* Left column - Key details */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Key Details</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <Bed className="text-blue-500 mr-2 h-5 w-5" />
              <div>
                <p className="text-sm text-gray-500">Bedrooms</p>
                <p className="font-semibold">{property.BedroomsTotal}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Bath className="text-blue-500 mr-2 h-5 w-5" />
              <div>
                <p className="text-sm text-gray-500">Bathrooms</p>
                <p className="font-semibold">{property.BathroomsTotalInteger}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Square className="text-blue-500 mr-2 h-5 w-5" />
              <div>
                <p className="text-sm text-gray-500">Living Area</p>
                <p className="font-semibold">{property.LivingArea.toLocaleString()} sqft</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Home className="text-blue-500 mr-2 h-5 w-5" />
              <div>
                <p className="text-sm text-gray-500">Property Type</p>
                <p className="font-semibold">{getPropertyTypeDisplay(property.PropertyType)}</p>
              </div>
            </div>
            
            {property.YearBuilt && (
              <div className="flex items-center col-span-2">
                <div>
                  <p className="text-sm text-gray-500">Year Built</p>
                  <p className="font-semibold">{property.YearBuilt}</p>
                </div>
              </div>
            )}
            
            {property.LotSizeAcres && (
              <div className="flex items-center col-span-2">
                <div>
                  <p className="text-sm text-gray-500">Lot Size</p>
                  <p className="font-semibold">{property.LotSizeAcres} acres</p>
                </div>
              </div>
            )}
            
            {property.RoomsTotal && (
              <div className="flex items-center col-span-2">
                <div>
                  <p className="text-sm text-gray-500">Total Rooms</p>
                  <p className="font-semibold">{property.RoomsTotal}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Middle column - Description */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-line">
            {property.PublicRemarks || 'No description available.'}
          </p>
        </div>
        
        {/* Right column - Additional information */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Listing Information</h2>
          <p className="mb-2"><strong>Status:</strong> {property.StandardStatus}</p>
          <p className="mb-2"><strong>MLS #:</strong> {property.ListingKey}</p>
          {property.ListOfficeName && <p className="mb-2"><strong>Listing Office:</strong> {property.ListOfficeName}</p>}
          {property.ListAgentFullName && <p className="mb-2"><strong>Listing Agent:</strong> {property.ListAgentFullName}</p>}
          {property.TaxAssessedValue && <p className="mb-2"><strong>Tax Assessed Value:</strong> {formatPrice(property.TaxAssessedValue)}</p>}
          {property.TaxAnnualAmount && <p className="mb-2"><strong>Annual Taxes:</strong> {formatPrice(property.TaxAnnualAmount)}</p>}
        </div>
      </div>
      
      {/* Features section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Interior Features */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Interior Features</h2>
          
          {property.InteriorFeatures && property.InteriorFeatures.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Interior Features</h3>
              <ul className="grid grid-cols-2 gap-1">
                {property.InteriorFeatures.map((feature, index) => (
                  <li key={index} className="text-gray-700">• {feature}</li>
                ))}
              </ul>
            </div>
          )}
          
          {property.Appliances && property.Appliances.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Appliances</h3>
              <ul className="grid grid-cols-2 gap-1">
                {property.Appliances.map((appliance, index) => (
                  <li key={index} className="text-gray-700">• {appliance}</li>
                ))}
              </ul>
            </div>
          )}
          
          {property.Heating && property.Heating.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Heating</h3>
              <ul className="list-disc pl-5">
                {property.Heating.map((item, index) => (
                  <li key={index} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {property.Cooling && property.Cooling.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Cooling</h3>
              <ul className="list-disc pl-5">
                {property.Cooling.map((item, index) => (
                  <li key={index} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Exterior Features */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Exterior Features</h2>
          
          {property.ExteriorFeatures && property.ExteriorFeatures.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Exterior Features</h3>
              <ul className="grid grid-cols-2 gap-1">
                {property.ExteriorFeatures.map((feature, index) => (
                  <li key={index} className="text-gray-700">• {feature}</li>
                ))}
              </ul>
            </div>
          )}
          
          {property.ParkingFeatures && property.ParkingFeatures.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Parking</h3>
              <ul className="grid grid-cols-2 gap-1">
                {property.ParkingFeatures.map((feature, index) => (
                  <li key={index} className="text-gray-700">• {feature}</li>
                ))}
              </ul>
            </div>
          )}
          
          {property.Construction && property.Construction.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Construction</h3>
              <ul className="list-disc pl-5">
                {property.Construction.map((item, index) => (
                  <li key={index} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {property.WaterSource && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Water Source</h3>
              <p className="text-gray-700">{property.WaterSource}</p>
            </div>
          )}
          
          {property.Utilities && property.Utilities.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Utilities</h3>
              <ul className="list-disc pl-5">
                {property.Utilities.map((item, index) => (
                  <li key={index} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {/* Map section */}
      {property?.Latitude && property?.Longitude && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-10">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Location & Nearby Properties</h2>
          <div className="h-[500px] rounded-lg overflow-hidden">
            <Suspense fallback={
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            }>
              <PropertyMap 
                properties={mapProperties}
                initialCenter={[property.Latitude, property.Longitude]}
                initialZoom={14}
                height="500px"
                onMarkerClick={handleMarkerClick}
                highlightedPropertyId={hoveredPropertyId || mainPropertyId}
              />
            </Suspense>
          </div>
          <p className="mt-4 text-gray-700">
            Located in {property.City}, {property.StateOrProvince} {property.PostalCode}
            {property.SubdivisionName && ` in the ${property.SubdivisionName} subdivision`}.
            {neighboringProperties.length > 0 && ` There are ${neighboringProperties.length} other properties for sale in this area.`}
          </p>
          
          {/* Nearby Properties Section */}
          {neighboringProperties.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Nearby Properties:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {neighboringProperties.slice(0, 6).map((nearbyProperty) => (
                  <div 
                    key={nearbyProperty.ListingKey}
                    className={`border rounded p-3 hover:bg-blue-50 cursor-pointer transition-colors ${
                      hoveredPropertyId === nearbyProperty.ListingKey ? 'bg-blue-50 border-blue-400' : ''
                    }`}
                    onClick={() => handleMarkerClick(nearbyProperty.ListingKey)}
                    onMouseEnter={() => setHoveredPropertyId(nearbyProperty.ListingKey)}
                    onMouseLeave={() => setHoveredPropertyId(undefined)}
                  >
                    <div className="font-bold text-blue-600">
                      {formatPrice(nearbyProperty.ListPrice)}
                    </div>
                    <div className="text-sm">
                      {nearbyProperty.StreetNumber} {nearbyProperty.StreetName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {nearbyProperty.BedroomsTotal} Beds • 
                      {nearbyProperty.BathroomsTotalInteger} Baths • 
                      {nearbyProperty.LivingArea} sqft
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Nearby Properties</h3>
              <p className="text-gray-600">
                We couldn't find any other properties listed in this immediate area.
                You can browse more properties in {property.City} by returning to the main listings.
              </p>
              <Link href="/listings" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
                <ArrowLeft className="mr-2 h-4 w-4" /> Browse all properties
              </Link>
            </div>
          )}
        </div>
      )}
      
      {/* Contact section */}
      <div className="bg-blue-50 p-6 rounded-lg shadow-md mb-10">
        <h2 className="text-xl font-bold mb-4">Interested in this property?</h2>
        <p className="mb-4">Contact us for more information or to schedule a viewing.</p>
        <Link href={`/listings/property/${propertyId}/contact-agent`}>
          <Button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300">
            Contact Listing Agent
          </Button>
        </Link>
      </div>
      
      {/* Disclaimer */}
      <div className="text-sm text-gray-500 mb-8">
        <p>Listing information provided courtesy of the {property.ListOfficeName || 'listing broker'}. The information provided is for consumers' personal, non-commercial use and may not be used for any purpose other than to identify prospective properties that consumers may be interested in purchasing.</p>
      </div>
      
      {/* Map Overlay */}
      {showMapOverlay && (
        <PropertyMapOverlay
          properties={mapProperties}
          onClose={() => setShowMapOverlay(false)}
          onPropertySelect={(propertyId) => {
            setShowMapOverlay(false);
            router.push(`/listings/property/${propertyId}`);
          }}
          highlightedPropertyId={hoveredPropertyId || mainPropertyId}
        />
      )}
    </div>
  </div>
  );
} 