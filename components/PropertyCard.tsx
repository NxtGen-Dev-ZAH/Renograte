import React from 'react';
import Image from 'next/image';
import { Property, Media } from '@/types/property';

interface PropertyCardProps {
  property: Property;
  highlighted?: boolean;
  filterType?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  showRenovationInfo?: boolean;
}

// Helper function to format price
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0 
  }).format(price);
};

// Helper function to get property type display
const getPropertyTypeWithSaleSuffix = (propertyType: string, filterType?: string): string => {
  const displayType = filterType || propertyType;
  
  switch(displayType) {
    case 'Condominium':
      return 'LUXURY CONDO FOR SALE';
    case 'Townhouse':
      return 'TOWNHOUSE FOR SALE';
    case 'Land':
      return 'LAND FOR SALE';
    case 'Commercial':
      return 'COMMERCIAL FOR SALE';
    case 'Residential':
    default:
      return 'FAMILY RESIDENCE FOR SALE';
  }
};

// Helper function to format address
const formatAddress = (property: Property) => {
  const streetAddress = `${property.StreetNumber} ${property.StreetName}`;
  const cityStateZip = `${property.City}, ${property.StateOrProvince} ${property.PostalCode}`;
  return { streetAddress, cityStateZip };
};

// Calculate renovation budget based on price
const calculateRenovationBudget = (property: Property): number => {
  // Base renovation potential based on property price tiers
  let baseRenovationPercentage;
  if (property.ListPrice <= 300000) {
    baseRenovationPercentage = 0.165; // 16.5% for lower-priced properties
  } else if (property.ListPrice <= 600000) {
    baseRenovationPercentage = 0.135; // 13.5% for mid-range properties
  } else {
    baseRenovationPercentage = 0.115; // 11.5% for high-end properties
  }

  // Maximum allowance caps based on price tiers
  let maxAllowance;
  if (property.ListPrice <= 300000) {
    maxAllowance = 45000; 
  } else if (property.ListPrice <= 600000) {
    maxAllowance = 75000;
  } else {
    maxAllowance = 120000;
  }
  
  // Calculate renovation allowance based on property price
  return Math.min(
    property.ListPrice * baseRenovationPercentage,
    maxAllowance
  );
};

export default function PropertyCard({ 
  property, 
  highlighted = false, 
  filterType,
  onMouseEnter,
  onMouseLeave,
  showRenovationInfo = false
}: PropertyCardProps) {
  const { streetAddress, cityStateZip } = formatAddress(property);
  
  // Handle media retrieval
  const mainImage = property.Media?.length ? 
    (property.Media.find((m: Media) => m.Order === 1)?.MediaURL || 
     property.Media[0].MediaURL || 
     null) : 
    null;
  
  return (
    <div 
      className={`border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full ${
        highlighted ? 'ring-2 ring-blue-500' : ''
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
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
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQrJiEkKic0Ly4vLy4xOzw6Njs8OzFEREREREREREREREREREREREREREf/2wBDAR0XFyAeIB4gHh4gIiAdIB0gHR0dHSAdIB0gHiAdICAgICAgIB4eICAgICAgICAgICAgICAgICAgICAgICAgICAgICf/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              loading="lazy"
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
              priority={false}
            />
          </div>
        </div>
        
        <div className="uppercase text-base text-green-500 mb-1">
          {getPropertyTypeWithSaleSuffix(property.PropertyType, filterType)} 
        </div>
        
        <div className="uppercase text-sm text-white font-medium bg-blue-500 rounded-lg p-2 mb-2 w-fit">
          {property.StandardStatus}
        </div>
        
        <div className="flex items-center space-x-4 text-gray-700 mb-4">
          <h3 className="text-gray-800 font-bold bg-gray-100 rounded-lg p-2">{property.BedroomsTotal} BEDS</h3>
          <h3 className="text-gray-800 font-bold bg-gray-100 rounded-lg p-2">{property.BathroomsTotalInteger} BATHS</h3>
          <h3 className="text-gray-800 font-bold bg-gray-100 rounded-lg p-2">{property.LivingArea} SQFT</h3>
        </div>
        
        {showRenovationInfo && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Renovation Allowance</span>
              <span className="font-semibold text-blue-600">{formatPrice(calculateRenovationBudget(property))}</span>
            </div>
          </div>
        )}
        
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
  );
} 