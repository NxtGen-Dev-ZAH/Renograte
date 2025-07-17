"use client";

import { useState, useEffect } from 'react';
import useRealtyFeedApi from '@/hooks/useRealtyFeedApi';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import type { Property, Media } from '@/types/property';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { 
  PropertyType,
  PropertyStatus,
  getPropertyTypeDisplay,
  getPropertyTypeWithSaleSuffix,
  getPropertyTypeFilter,
  isPropertyType
} from '@/utils/propertyUtils';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import RoleProtected from '@/components/RoleProtected';

const PropertyMap = dynamic(() => import('@/components/maps/GooglePropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
});

const PropertyMapOverlay = dynamic(() => import('@/components/maps/GooglePropertyMapOverlay'), {
  ssr: false
});

interface PropertyResponse {
  value: Property[];
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
}

const ITEMS_PER_PAGE = 20;

export function PropertyListingsPage() {
  const [query, setQuery] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextLink, setNextLink] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('Active');
  const [filterType, setFilterType] = useState('Residential');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showMapOverlay, setShowMapOverlay] = useState(false);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | undefined>(undefined);
  const router = useRouter();

  // Construct the initial query
  const buildQuery = () => {
    // Use getPropertyTypeFilter utility to handle different property types
    const propertyTypeFilter = getPropertyTypeFilter(filterType);
    
    // Only include status in filter if it's not 'All'
    const statusFilter = filterStatus === 'All' ? '' : `StandardStatus eq '${filterStatus}' and `;
    
    const filter = `${statusFilter}${propertyTypeFilter} and ListPrice ge ${priceRange.min} and ListPrice le ${priceRange.max}`;
    
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
      'SubdivisionName',
      'ListOfficeName',
      'Latitude',
      'Longitude',
      'ModificationTimestamp',
      'ListingContractDate'
    ].join(',');
    
    const expand = "Media";
    const orderby = "ModificationTimestamp desc";
    
    const resource = `Property?$filter=${filter}&$select=${select}&$expand=${expand}&$orderby=${orderby}&$top=${ITEMS_PER_PAGE}&$count=true`;
    
    // Log the query for debugging
    console.log('Property Type:', propertyTypeFilter);
    console.log('Full Query:', resource);
    
    setQuery(resource);
  };

  // Initial query build
  useEffect(() => {
    buildQuery();
  }, [filterStatus, filterType, priceRange]);

  // Add a refresh interval to fetch new data periodically
  useEffect(() => {
    const intervalId = setInterval(buildQuery, 5 * 60 * 1000); // Refresh every 7 minutes
    return () => clearInterval(intervalId);
  }, [filterStatus, filterType, priceRange]);

  const { data, error, loading } = useRealtyFeedApi<PropertyResponse>(query);

  // Process the API response and log any issues
  useEffect(() => {
    if (data && !loading) {
      if (data.value) {
        if (isLoadingMore) {
          setProperties(prev => [...prev, ...data.value]);
          setIsLoadingMore(false);
        } else {
          setProperties(data.value);
        }
        console.log(`Found ${data.value.length} properties`);
        console.log('First property data:', data.value[0] || 'No properties found');
      } else {
        console.log('No properties found in response');
      }
      
      if (data['@odata.count'] !== undefined) {
        setTotalCount(data['@odata.count']);
        console.log('Total count:', data['@odata.count']);
      }
      
      setNextLink(data['@odata.nextLink'] || null);
    }
    
    if (error) {
      console.error('API Error:', error);
      console.error('Current query:', query);
    }
  }, [data, loading, error, query]);

  const loadMore = async () => {
    if (nextLink && !isLoadingMore) {
      setIsLoadingMore(true);
      // Extract the query part from the nextLink
      const queryPart = nextLink.split('/Property')[1];
      setQuery(`Property${queryPart}`);
      setCurrentPage(prev => prev + 1);
    }
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    }).format(price); 
  };

  const formatAddress = (property: Property) => {
    const streetAddress = `${property.StreetNumber} ${property.StreetName}`;
    const cityStateZip = `${property.City}, ${property.StateOrProvince} ${property.PostalCode}`;
    return { streetAddress, cityStateZip };
  };

  // Handle filter changes
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
    setCurrentPage(1);
  };

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    setPriceRange(prev => ({
      ...prev,
      [type]: value
    }));
    setCurrentPage(1);
  };

  // Handle marker click on map
  const handleMarkerClick = (propertyId: string) => {
    router.push(`/listings/property/${propertyId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-2 sm:mb-4 mt-6 sm:mt-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
            MLS Listings
          </h1>
          <div className="flex items-center justify-center gap-2">
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              Browse properties listed on the MLS with estimated renovation allowances
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
        </div>
      
      {/* Filters */}
      <div className="bg-gray-100 p-4 mb-8 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select 
              value={filterStatus} 
              
              onChange={handleStatusChange}
              className="w-full p-2 border rounded"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Sold">Sold</option>
              <option value="Coming Soon">Coming Soon</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Property Type</label>
            <select 
              value={filterType} 
              onChange={handleTypeChange}
              className="w-full p-2 border rounded"
            >
              <option value="Residential">Residential</option>
              <option value="Condominium">Condominium</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Land">Land</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Min Price</label>
            <select 
              value={priceRange.min} 
              onChange={(e) => handlePriceChange('min', Number(e.target.value))}
              className="w-full p-2 border rounded"
            >
              <option value="0">Any</option>
              <option value="100000">$100,000</option>
              <option value="200000">$200,000</option>
              <option value="300000">$300,000</option>
              <option value="500000">$500,000</option>
              <option value="750000">$750,000</option>
              <option value="1000000">$1,000,000</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Max Price</label>
            <select 
              value={priceRange.max} 
              onChange={(e) => handlePriceChange('max', Number(e.target.value))}
              className="w-full p-2 border rounded"
            >
              <option value="1000000">$1,000,000</option>
              <option value="2000000">$2,000,000</option>
              <option value="3000000">$3,000,000</option>
              <option value="5000000">$5,000,000</option>
              <option value="10000000">$10,000,000+</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Loading State */}
      {loading && !isLoadingMore && (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* Results Count */}
      {!loading && properties.length > 0 && (
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {properties.length} of {totalCount} listings
          </p>
          
        </div>    
      )}
      
      {/* New Map and Property Grid Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Map on Left Side */}
        <div className="lg:w-5/12 sticky top-20 h-[600px]">
          {!loading && properties.length > 0 && (
            <div className="h-full w-full rounded-lg overflow-hidden shadow-md">
              <ErrorBoundary fallback={<div className="h-full w-full bg-gray-100 rounded-lg flex items-center justify-center">Error loading map</div>}>
                <PropertyMap 
                  properties={properties}
                  height="100%"
                  onMarkerClick={handleMarkerClick}
                  highlightedPropertyId={hoveredPropertyId}
                />
              </ErrorBoundary>
            </div>
          )}
        </div>
        
        {/* Property Grid on Right Side */}
        <div className="lg:w-7/12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {properties.map((property, index) => {
              const { streetAddress, cityStateZip } = formatAddress(property);
              // Handle media regardless of whether we get all fields or just the ones we requested
              const mainImage = property.Media?.length ? 
                (property.Media.find((m: Media) => m.Order === 1)?.MediaURL || 
                 property.Media[0].MediaURL || 
                 property.Media[0].MediaURL || 
                 null) : 
                null;
              
              return (
                <Link 
                  href={`/listings/property/${property.ListingKey}`} 
                  key={property.ListingKey}
                  onMouseEnter={() => setHoveredPropertyId(property.ListingKey)}
                  onMouseLeave={() => setHoveredPropertyId(undefined)}
                >
                  <div className={`border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 ${hoveredPropertyId === property.ListingKey ? 'ring-2 ring-blue-500' : ''}`}>
                    {/* Status Banner */}
                    <div className="relative">
                      <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white py-1 px-4 z-10">
                        {property.StandardStatus === 'Coming Soon' ? 'COMING SOON' : 'NEW LISTING'}
                      </div>
                      
                      {/* Property Image */}
                      <div className="h-60 relative">
                        {mainImage ? (
                          <Image 
                            src={mainImage}
                            alt={`${property.StreetNumber} ${property.StreetName}`}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority={index < 3}
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQrJiEkKic0Ly4vLy4xOzw6Njs8OzFEREREREREREREREREREREREREREf/2wBDAR0XFyAeIB4gHh4gIiAdIB0gHR0dHSAdIB0gHiAdICAgICAgIB4eICAgICAgICAgICAgICAgICAgICAgICAgICAgICf/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                            loading={index < 3 ? undefined : "lazy"}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <p className="text-gray-500">No Image Available</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Property Details */}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h2 className="text-2xl font-bold text-blue-800">{formatPrice(property.ListPrice)}</h2>
                        <div className="flex items-center">
                          <Image 
                            src="/mlslogo.png" 
                            alt="MLS Logo" 
                            width={60} 
                            height={20}
                            priority
                          />
                        </div>
                      </div>
                      
                      <div className="uppercase text-base text-green-500 mb-1">
                        {(() => {
                          // Pass both the property's type and the current filter type
                          // This ensures condos are correctly displayed even if the API returns a different PropertyType
                          return getPropertyTypeWithSaleSuffix(property.PropertyType, filterType);
                        })()} 
                      </div>
                      <div className="uppercase text-sm text-white font-medium bg-blue-500 rounded-lg p-2 mb-2 w-fit">
                        {property.StandardStatus}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-gray-700 mb-4 ">
                        <h1 className="text-gray-800 font-bold bg-gray-100 rounded-lg p-2">{property.BedroomsTotal} BEDS</h1>
                        <h1 className="text-gray-800 font-bold bg-gray-100 rounded-lg p-2 ">{property.BathroomsTotalInteger} BATHS</h1>
                        <h1 className="text-gray-800 font-bold bg-gray-100 rounded-lg p-2">{property.LivingArea} SQFT</h1>
                      </div>
                      
                      <div className="mb-1 text-gray-800 font-medium">{streetAddress}</div>
                      <div className="mb-2 text-gray-800 font-medium">{cityStateZip}</div>
                      
                      {property.SubdivisionName && (
                        <div className="text-gray-500 mb-4">{property.SubdivisionName} Subdivision</div>
                      )}
                      
                      <div className="text-gray-500 text-sm">
                        Listing courtesy of {property.ListOfficeName || 'Renograte'}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* Load More Button */}
          {nextLink && !isLoadingMore && (
            <div className="flex justify-center mt-8">
              <button 
                onClick={loadMore}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
              >
                Load More Properties
              </button>
            </div>
          )}
          
          {/* Loading More Indicator */}
          {isLoadingMore && (
            <div className="flex justify-center mt-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>
      
      {/* No Results */}
      {!loading && properties.length === 0 && (
        <div className="text-center py-12 ">
          <h3 className="text-xl font-medium text-gray-800 mb-2">No properties found</h3>
          <p className="text-gray-600">Try adjusting your filters to see more results.</p>
        </div>
      )}
      
      {/* Map Overlay */}
      {showMapOverlay && (
        <PropertyMapOverlay
          properties={properties}
          onClose={() => setShowMapOverlay(false)}
          onPropertySelect={(propertyId: string) => {
            setShowMapOverlay(false);
            router.push(`/listings/property/${propertyId}`);
          }}
          highlightedPropertyId={hoveredPropertyId}
        />
      )}
    </div>
  );
}

export default function ListingsProtectedWrapper() {
  return (
    <RoleProtected allowedRoles={['user', 'member', 'agent', 'contractor', 'admin']}>
      <PropertyListingsPage />
    </RoleProtected>
  );
}
