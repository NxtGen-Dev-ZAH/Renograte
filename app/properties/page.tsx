// app/properties/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Search, Home, ChevronDown, Loader2, BedDouble, Bath, Ruler } from "lucide-react";
import Image from "next/image";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import Link from "next/link";
import useRealtyFeedApi from "@/hooks/useRealtyFeedApi";
import { PropertyType, PropertyStatus, getPropertyTypeFilter, getPropertyTypeOptions, getPropertyStatusOptions } from "@/utils/propertyUtils";
import { ErrorBoundary } from "react-error-boundary";
import dynamic from "next/dynamic";
import type { Property as ApiProperty } from "@/types/property";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import RoleProtected from '@/components/RoleProtected';

// ===============================================================
// COMPONENT DEFINITIONS
// ===============================================================

// Custom dual range slider component that ensures we have two values
const RangeSlider = ({ 
  min, 
  max, 
  step, 
  value, 
  onValueChange,
  formatValue = (v) => v,
  className 
}: { 
  min: number; 
  max: number; 
  step: number; 
  value: [number, number]; 
  onValueChange: (value: [number, number]) => void;
  formatValue?: (value: number) => string | number;
  className?: string;
}) => {
  return (
    <div className="space-y-5">
      <SliderPrimitive.Root
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        defaultValue={value}
        value={value}
        onValueChange={(newValue) => {
          if (Array.isArray(newValue) && newValue.length === 2) {
            onValueChange(newValue as [number, number]);
          }
        }}
        max={max}
        min={min}
        step={step}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200">
          <SliderPrimitive.Range className="absolute h-full bg-blue-600" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border border-blue-600 bg-white shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border border-blue-600 bg-white shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
      <div className="flex justify-between text-sm text-gray-600">
        <span>{formatValue(value[0])}</span>
        <span>{formatValue(value[1])}</span>
      </div>
    </div>
  );
};

// Map component with server-side rendering disabled
const PropertyMap = dynamic(() => import('@/components/maps/PropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
});

// ===============================================================
// TYPE DEFINITIONS
// ===============================================================

interface ApiPropertyResponse {
  ListingKey: string;
  StandardStatus: string;
  PropertyType: string;
  PropertySubType?: string;
  ListPrice: number;
  StreetNumber: string;
  StreetName: string;
  City: string;
  StateOrProvince: string;
  PostalCode: string;
  BedroomsTotal: number;
  BathroomsTotalInteger: number;
  LivingArea: number;
  YearBuilt?: number;
  Latitude?: number;
  Longitude?: number;
  Media?: { MediaURL: string; Order?: number }[];
  SubdivisionName?: string;
  ListOfficeName?: string;
}

interface PropertyResponse {
  value: ApiPropertyResponse[];
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
}

interface UIProperty {
  id: string;
  title: string;
  price: number;
  renovationBudget: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  image: string;
  status: string;
  latitude?: number;
  longitude?: number;
  yearBuilt?: number;
}

// ===============================================================
// MAIN COMPONENT
// ===============================================================

function PropertiesPage() {
  // ---------------------------------------------------------------
  // State Management
  // ---------------------------------------------------------------
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([175500, 800000]);
  const [filterStatus, setFilterStatus] = useState<string>(PropertyStatus.Active);
  const [filterType, setFilterType] = useState<string>(PropertyType.Residential);
  const [locationSearch, setLocationSearch] = useState<string>('');
  const [bedroomsFilter, setBedroomsFilter] = useState<string>('any');
  const [bathroomsFilter, setBathroomsFilter] = useState<string>('any');
  const [sqftFilter, setSqftFilter] = useState<string>('any');
  const [yearBuiltFilter, setYearBuiltFilter] = useState<string>('any');
  const [renovationFilter, setRenovationFilter] = useState<string>('any');
  
  // API and UI states
  const [query, setQuery] = useState<string | null>(null);
  const [properties, setProperties] = useState<UIProperty[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);
  const [nextLink, setNextLink] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Router and auth
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // ---------------------------------------------------------------
  // Property Data Constants & Utilities
  // ---------------------------------------------------------------
  
  // Property title adjectives for dynamic naming
  const propertyAdjectives = {
    [PropertyType.Residential]: [
      'Modern', 'Elegant', 'Luxurious', 'Charming', 'Spacious', 
      'Classic', 'Stylish', 'Contemporary', 'Cozy', 'Stunning'
    ],
    [PropertyType.Condominium]: [
      'Upscale', 'Urban', 'Luxury', 'High-End', 'Sophisticated', 
      'Exclusive', 'Premium', 'Chic', 'Executive', 'Deluxe'
    ],
    [PropertyType.Townhouse]: [
      'Sophisticated', 'Elegant', 'Modern', 'Uptown', 'Stylish', 
      'Refined', 'Contemporary', 'Tasteful', 'Upscale', 'Urban'
    ],
    [PropertyType.Commercial]: [
      'Prime', 'Professional', 'Strategic', 'Premium', 'High-Traffic',
      'Prominent', 'Prestigious', 'Class-A', 'Executive', 'Turnkey'
    ],
    [PropertyType.Land]: [
      'Pristine', 'Expansive', 'Development-Ready', 'Prime', 'Scenic',
      'Picturesque', 'Valuable', 'Strategic', 'Versatile', 'Investment'
    ]
  };

  // Format price for display
  const formatPrice = (price: number): string => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}m`;
    }
    return `$${(price / 1000).toFixed(0)}k`;
  };

  // ---------------------------------------------------------------
  // API Query & Data Processing Functions
  // ---------------------------------------------------------------
  
  // Generate a random property title with adjectives
  const generatePropertyTitle = (property: ApiPropertyResponse): string => {
    const propertyType = property.PropertySubType || property.PropertyType;
    const adjectives = propertyAdjectives[propertyType as PropertyType] || propertyAdjectives[PropertyType.Residential];
    
    // Select a random adjective
    const randomIndex = Math.floor(Math.random() * adjectives.length);
    const adjective = adjectives[randomIndex];
    
    // Create property title based on type
    if (propertyType === PropertyType.Land) {     
      return `${adjective} ${property.LivingArea.toLocaleString()} Sq.Ft. Land`;
    } else if (propertyType === PropertyType.Commercial) {
      return `${adjective} Commercial Property`;
    } else {
      // For residential, condos, and townhouses
      const bedroomText = property.BedroomsTotal === 1 
        ? '1 Bedroom' 
        : `${property.BedroomsTotal} Bedroom`;
        
      // Add year if it's a newer property
      const currentYear = new Date().getFullYear();
      const yearText = property.YearBuilt && property.YearBuilt > (currentYear - 10) 
        ? ` (${property.YearBuilt})` 
        : '';
      
      return `${adjective} ${bedroomText} ${propertyType}${yearText}`;
    }
  };

  // Build query for the RealtyFeed API with proper filtering logic
  const buildQuery = useCallback((skipParam: number = 0) => {
    let filters = [];
    
    // Add status filter if not 'All'
    if (filterStatus !== PropertyStatus.All) {
      filters.push(`StandardStatus eq '${filterStatus}'`);
    }
    
    // Add property type filter using the utility function
    filters.push(getPropertyTypeFilter(filterType));
    
    // Add price range filter - ensure we have valid values
    const minPrice = priceRange[0] || 0;
    const maxPrice = priceRange[1] || 1000000;
    filters.push(`ListPrice ge ${minPrice} and ListPrice le ${maxPrice}`);
    
    // Add location filter if provided
    if (locationSearch.trim()) {
      filters.push(`(contains(tolower(City), tolower('${locationSearch}')) or contains(PostalCode, '${locationSearch}'))`);
    }
    
    // Add bedrooms filter
    if (bedroomsFilter !== 'any') {
      filters.push(`BedroomsTotal ge ${bedroomsFilter}`);
    }
    
    // Add bathrooms filter
    if (bathroomsFilter !== 'any') {
      filters.push(`BathroomsTotalInteger ge ${bathroomsFilter}`);
    }
    
    // Add square footage filter
    if (sqftFilter !== 'any') {
      filters.push(`LivingArea ge ${sqftFilter}`);
    }
    
    // Add year built filter
    if (yearBuiltFilter !== 'any') {
      filters.push(`YearBuilt ge ${yearBuiltFilter}`);
    }
    
    const filter = filters.join(' and ');
    
    // Define fields to select
    const select = [
      'ListingKey',
      'StandardStatus',
      'PropertyType',
      'PropertySubType',
      'ListPrice',
      'StreetNumber',
      'StreetName', 
      'City',
      'StateOrProvince',
      'PostalCode',
      'BedroomsTotal',
      'BathroomsTotalInteger',
      'LivingArea',
      'YearBuilt',
      'Latitude',
      'Longitude',
      'SubdivisionName',
      'ListOfficeName'
    ].join(',');
    
    const expand = "Media";
    const orderby = "ListPrice asc";
    const itemsPerPage = 20;
    const resource = `Property?$filter=${filter}&$select=${select}&$expand=${expand}&$top=${itemsPerPage}&$skip=${skipParam}&$orderby=${orderby}&$count=true`;
    
    console.log('API Query:', resource);
    setQuery(resource);
  }, [filterStatus, filterType, priceRange, locationSearch, bedroomsFilter, bathroomsFilter, sqftFilter, yearBuiltFilter]);

  // Trigger search when button is clicked
  const handleSearch = () => {
    setIsSearching(true);
    setCurrentPage(1);
    buildQuery(0);
  };
  
  // Load more properties
  const loadMoreProperties = () => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    const skipCount = (nextPage - 1) * 20;
    buildQuery(skipCount);
    setCurrentPage(nextPage);
  };
  
  // Reset all filters
  const handleReset = () => {
    setPriceRange([200000, 800000]);
    setFilterStatus(PropertyStatus.Active);
    setFilterType(PropertyType.Residential);
    setLocationSearch('');
    setBedroomsFilter('any');
    setBathroomsFilter('any');
    setSqftFilter('any');
    setYearBuiltFilter('any');
    setRenovationFilter('any');
    setIsSearching(false);
    setCurrentPage(1);
  };

  // Calculate renovation budget based on home price and characteristics
  const calculateRenovationBudget = (property: ApiPropertyResponse): number => {
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
    
    return renovationAllowance;
  };

  // Convert UI properties to API properties for the map
  const getMapProperties = (): ApiProperty[] => {
    return properties.map(p => {
      const location = p.location.split(', ');
      const streetParts = location[0].split(' ');
      const streetNumber = streetParts[0];
      const streetName = streetParts.slice(1).join(' ');
      const city = location[1] || '';
      const stateZip = location[2]?.split(' ') || ['', ''];
      
      return {
        ListingKey: p.id,
        StandardStatus: p.status,
        PropertyType: 'Residential',
        ListPrice: p.price,
        StreetNumber: streetNumber,
        StreetName: streetName,
        City: city,
        StateOrProvince: stateZip[0] || '',
        PostalCode: stateZip[1] || '',
        BedroomsTotal: p.bedrooms,
        BathroomsTotalInteger: p.bathrooms,
        LivingArea: p.sqft,
        Latitude: p.latitude || 0,
        Longitude: p.longitude || 0,
        Media: [{ MediaURL: p.image }]
      } as ApiProperty;
    });
  };

  // ---------------------------------------------------------------
  // Data Fetching & Effects
  // ---------------------------------------------------------------

  // Fetch data using the custom hook
  const { data, error, loading } = useRealtyFeedApi<PropertyResponse>(query);

  // Map API data to our Property interface
  useEffect(() => {
    if (data && data.value) {
      const mappedProperties = data.value.map((item: ApiPropertyResponse) => {
        // Calculate renovation budget
        const renovationBudget = calculateRenovationBudget(item);
        
        // Get the first image or a placeholder
        const mainImage = item.Media?.length 
          ? (item.Media.find(m => m.Order === 1)?.MediaURL || item.Media[0].MediaURL) 
          : '/imagemain2.png';
        

        // Get dynamic property title
        const title = generatePropertyTitle(item);
        
        return {
          id: item.ListingKey,
          title,
          price: item.ListPrice,
          renovationBudget,
          location: `${item.StreetNumber} ${item.StreetName}, ${item.City}, ${item.StateOrProvince}`,
          bedrooms: item.BedroomsTotal,
          bathrooms: item.BathroomsTotalInteger,
          sqft: item.LivingArea,
          image: mainImage,
          status: item.StandardStatus,
          latitude: item.Latitude,
          longitude: item.Longitude,
          yearBuilt: item.YearBuilt
        };
      });
      
      // Log property IDs to help debug duplicate issues
      if (isLoadingMore) {
        console.log('Loading more properties...');
        console.log('New property IDs:', mappedProperties.map(p => p.id));
        console.log('Existing property IDs:', properties.map(p => p.id));
      }
      
      // If loading more, append to existing properties with deduplication
      if (isLoadingMore) {
        setProperties(prev => {
          // Create a Set of existing property IDs for fast lookup
          const existingIds = new Set(prev.map(p => p.id));
          
          // Filter out any properties that already exist in the current list
          const uniqueNewProperties = mappedProperties.filter(property => !existingIds.has(property.id));
          
          console.log(`Found ${mappedProperties.length - uniqueNewProperties.length} duplicate properties`);
          
          // If we received only duplicates but there are more properties available,
          // automatically try to load the next page
          if (uniqueNewProperties.length === 0 && data['@odata.nextLink']) {
            console.log('All properties were duplicates, automatically loading next page...');
            
            // Store the current page to load next to avoid stale closures
            const pageToLoad = currentPage + 1;
            
            // Use setTimeout to avoid potential infinite loops in case of errors
            setTimeout(() => {
              // Calculate the skip value based on the stored page
              const skipCount = pageToLoad * 20;
              console.log(`Automatically loading page ${pageToLoad+1}, skipping ${skipCount} items`);
              buildQuery(skipCount);
              setCurrentPage(pageToLoad + 1);
            }, 500);
          }
          
          // Only add unique properties to the list
          return [...prev, ...uniqueNewProperties];
        });
        setIsLoadingMore(false);
      } else {
        setProperties(mappedProperties);
      }
      
      setTotalCount(data['@odata.count'] ?? mappedProperties.length);
      setNextLink(data['@odata.nextLink'] || null);
      setIsSearching(false);
    }
  }, [data]);

  // Initial search on page load
  useEffect(() => {
    handleSearch();
  }, []);

  // Toggle map view
  const toggleMapView = () => {
    setShowMap(prev => !prev);
  };

  // ---------------------------------------------------------------
  // Render Component
  // ---------------------------------------------------------------

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mt-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Find Your Perfect Home
        </h1>
      </div>
      <div className="flex items-center justify-center gap-2 mb-10">
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
            Discover properties with renovation potential
            </p>
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <button className="inline-flex items-center justify-center text-blue-500 rounded-full border border-blue-200 w-8 h-8 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
                    <Info className="w-4 h-4" />
                    <span className="sr-only">More information</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-md p-4 text-left">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      Browse properties sourced directly from Multiple Listing Service (MLS). The <span className="font-semibold text-gray-900">Current Home Price</span> is the listed price, and our system calculates a <span className="font-semibold text-gray-900">potential renovation allowance</span> to help you estimate renovation costs.
                    </p>
                    <p className="text-sm text-gray-700">
                      Use these initial figures to <span className="font-semibold text-gray-900">envision</span> what each property could become. For Renograte-exclusive listings with verified renovation allowances, visit our <Link href="/listings/renograte-listings" className="text-blue-600 hover:underline">Renograte Listings</Link> page.
                    </p>
                    <p className="text-xs text-gray-500 italic">
                      <span className="font-semibold text-gray-900">Note:</span> Property data is provided by MLS. Renovation estimates are generated by <span className="font-semibold text-gray-900">Renograte&apos;s Advanced Algorithms</span> and should be <span className="font-semibold text-gray-900">Professionally Verified</span>.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>  
          </div>
      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Search & Filter Properties</h2>
          <Button 
            variant="outline" 
            size="sm"
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
            onClick={toggleMapView}
          >
            {showMap ? "Hide Map" : "Show Map"}
          </Button>
        </div>
        
        {/* Location and Search Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="relative col-span-3 md:col-span-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input 
              placeholder="Search location or zipcode..." 
              className="pl-10" 
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          <div className="col-span-3 md:col-span-1">
            <Button 
              className="w-full bg-[#0C71C3] hover:bg-[#0A5A9C] text-white font-medium transition-all duration-200"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : "Search Properties"}
            </Button>
          </div>
          
          <div className="col-span-3 md:col-span-1 text-right">
            <Button 
              variant="outline" 
              className="w-full md:w-auto border-[#0C71C3] text-[#0C71C3] hover:bg-[#0C71C3] hover:text-white transition-all duration-200"
              onClick={handleReset}
            >
              Reset Filters
            </Button>
          </div>
        </div>
        
        {/* Map View (Conditional) */}
        {showMap && (
          <div className="mb-6 rounded-lg overflow-hidden border border-gray-200 h-[400px]">
            <ErrorBoundary fallback={<div className="h-full w-full bg-gray-100 rounded-lg flex items-center justify-center">Error loading map</div>}>
              {properties.length > 0 ? (
                <PropertyMap 
                  properties={getMapProperties()}
                  height="400px"
                  onMarkerClick={(id) => window.location.href = `/listings/property/${id}`}
                  highlightedPropertyId={hoveredProperty || undefined}
                />
              ) : (
                <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-500">No properties to display on map</p>
                </div>
              )}
            </ErrorBoundary>
          </div>
        )}
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Price Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Price Range
            </label>
            <RangeSlider
              min={0}
              max={2000000}
              step={50000}
              value={priceRange}
              onValueChange={setPriceRange}
              formatValue={formatPrice}
              className="py-4"
            />
          </div>
          
          {/* Property Status */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {getPropertyStatusOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Property Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Property Type</label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {getPropertyTypeOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Bedrooms */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
            <Select value={bedroomsFilter} onValueChange={setBedroomsFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
                <SelectItem value="5">5+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Bathrooms */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
            <Select value={bathroomsFilter} onValueChange={setBathroomsFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Square Footage */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Square Footage</label>
            <Select value={sqftFilter} onValueChange={setSqftFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="1000">1,000+ sqft</SelectItem>
                <SelectItem value="1500">1,500+ sqft</SelectItem>
                <SelectItem value="2000">2,000+ sqft</SelectItem>
                <SelectItem value="2500">2,500+ sqft</SelectItem>
                <SelectItem value="3000">3,000+ sqft</SelectItem>
                <SelectItem value="4000">4,000+ sqft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Year Built */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Year Built</label>
            <Select value={yearBuiltFilter} onValueChange={setYearBuiltFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="2020">2020 or newer</SelectItem>
                <SelectItem value="2010">2010 or newer</SelectItem>
                <SelectItem value="2000">2000 or newer</SelectItem>
                <SelectItem value="1990">1990 or newer</SelectItem>
                <SelectItem value="1980">1980 or newer</SelectItem>
                <SelectItem value="1970">1970 or newer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Renovation Status */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Renovation Allowance</label>
            <Select value={renovationFilter} onValueChange={setRenovationFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="25000">$25,000+ Allowance</SelectItem>
                <SelectItem value="50000">$50,000+ Allowance</SelectItem>
                <SelectItem value="75000">$75,000+ Allowance</SelectItem>
                <SelectItem value="100000">$100,000+ Allowance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
                </div>
                
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-12 w-12 text-[#0C71C3] animate-spin" />
          <span className="ml-3 text-lg text-gray-600">Loading properties...</span>
                </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-8">
          <p className="font-medium">Error loading properties</p>
          <p className="text-sm">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 text-red-800 border-red-300 hover:bg-red-100"
            onClick={handleSearch}
          >
            Retry
          </Button>
                </div>
      )}

      {/* Results Count */}
      {!loading && !error && properties.length > 0 && (
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {properties.length} of {totalCount} properties
          </p>
                </div>
      )}

      {/* No Results */}
      {!loading && !error && properties.length === 0 && isSearching && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium text-gray-800 mb-2">No properties found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filters to see more results.</p>
          <Button 
            variant="outline" 
            className="border-[#0C71C3] text-[#0C71C3] hover:bg-[#0C71C3] hover:text-white"
            onClick={handleReset}
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Properties Grid */}
      {!loading && properties.length > 0 && (
        <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map((property) => (
          <Card
                key={`property-${property.id}`}
            className="overflow-hidden hover:shadow-lg transition-shadow"
                onMouseEnter={() => setHoveredProperty(property.id)}
                onMouseLeave={() => setHoveredProperty(null)}
          >
                <CardHeader className="p-0 relative">
                  <Link href={`/listings/property/${property.id}`} passHref>
                    <div className="relative h-48 w-full">
              <Image
                src={property.image}
                alt={property.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="transition-transform duration-300 hover:scale-105"
                        unoptimized
                      />
                    </div>
                    {property.status !== "Active" && (
                      <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        {property.status}
                      </div>
                    )}
                  </Link>
            </CardHeader>
            <CardContent className="p-6">
                  <Link href={`/listings/property/${property.id}`} passHref>
                    <h3 className="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors">{property.title}</h3>
                  </Link>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-2">{property.location}</p>

              <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="flex flex-col items-center">
                      <BedDouble className="h-5 w-5 text-[#0C71C3] mb-1" />
                  <p className="text-sm text-gray-600">
                        {property.bedrooms} {property.bedrooms === 1 ? 'bed' : 'beds'}
                  </p>
                </div>
                    <div className="flex flex-col items-center">
                      <Bath className="h-5 w-5 text-[#0C71C3] mb-1" />
                  <p className="text-sm text-gray-600">
                        {property.bathrooms} {property.bathrooms === 1 ? 'bath' : 'baths'}
                  </p>
                </div>
                    <div className="flex flex-col items-center">
                      <Ruler className="h-5 w-5 text-[#0C71C3] mb-1" />
                      <p className="text-sm text-gray-600">{property.sqft.toLocaleString()} sqft</p>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-500">Listed Price</p>
                  <p className="text-lg font-bold text-[#0C71C3]">
                    ${property.price.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Renovation Allowance</p>
                  <p className="text-lg font-bold text-cyan-600 text-center">
                    ${property.renovationBudget.toLocaleString()}
                  </p>
                </div>
              </div>

                  <Link href={`/listings/property/${property.id}`} passHref>
              <Button className="w-full bg-[#0C71C3] hover:bg-[#0C71C3]/90">
                View Details
              </Button>
                  </Link>
            </CardContent>
          </Card>
        ))}
      </div>
          
          {/* Load More Button */}
          {totalCount > properties.length && !isLoadingMore && (
            <div className="mt-12 text-center">
              <Button 
                onClick={loadMoreProperties}
                className="bg-[#0C71C3] hover:bg-[#0A5A9C] text-white px-6 py-2"
              >
                Load More Properties
              </Button>
              <p className="text-gray-500 mt-2 text-sm">
                Showing {properties.length} of {totalCount} properties
              </p>
            </div>
          )}
          
          {/* Loading More Indicator */}
          {isLoadingMore && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 text-[#0C71C3] animate-spin mr-2" />
              <span className="text-gray-600">Loading more properties...</span>
            </div>
          )}
        </>
      )}

      {/* Call to Action */}
      <div className="mt-16 text-center bg-gray-50 p-8 rounded-lg">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Need Help Finding the Perfect Property?</h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Our team of experts can help you find properties with renovation potential that match your specific requirements.
        </p>
        <Button
          className="bg-[#0C71C3] hover:bg-[#0A5A9C] text-white font-medium transition-all duration-200 px-8"
          onClick={() => {
            // Check both for authentication context and direct token
            const hasToken = typeof window !== 'undefined' && localStorage.getItem('token');
            if (isAuthenticated || hasToken) {
              // If user is logged in, redirect to directories page filtering for agents
              router.push('/directories?category=agents');
            } else {
              // If not logged in, redirect to login page with return path
              router.push(`/login?returnUrl=${encodeURIComponent('/directories?category=agents')}`);
            }
          }}
        >
          Contact an Agent
        </Button>
      </div>
    </div>
  );
}

export default function PropertiesProtectedWrapper() {
  return (
    <RoleProtected allowedRoles={['user', 'member', 'agent', 'contractor', 'admin']}>
      <PropertiesPage />
    </RoleProtected>
  );
}
