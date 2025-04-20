/**
 * Represents a property media item (image, video, etc.)
 */
export interface Media {
  MediaURL: string;
  Order?: number;
  MediaKey?: string;
  MediaType?: string;
  MediaCategory?: string;
}

/**
 * Represents a property listing
 */
export interface Property {
  // Core listing data
  ListingKey: string;
  StandardStatus: string;
  PropertyType: string;
  PropertySubType?: string;
  ListPrice: number;
  
  // Address information
  StreetNumber: string;
  StreetName: string;
  City: string;
  StateOrProvince: string;
  PostalCode: string;
  
  // Property details
  BedroomsTotal: number;
  BathroomsTotalInteger: number;
  LivingArea: number;
  YearBuilt?: number;
  Latitude?: number;
  Longitude?: number;
  
  // Additional details
  Media?: Media[];
  SubdivisionName?: string;
  ListOfficeName?: string;
  ListAgentFullName?: string;
  LotSizeAcres?: number;
  LotSizeSquareFeet?: number;
  PublicRemarks?: string;
  
  // Features
  InteriorFeatures?: string[];
  ExteriorFeatures?: string[];
  Appliances?: string[];
  Heating?: string[];
  Cooling?: string[];
  ParkingFeatures?: string[];
  WaterSource?: string;
  Utilities?: string[];
  Construction?: string[];
  RoomsTotal?: number;
  
  // Financial information
  TaxAssessedValue?: number;
  TaxAnnualAmount?: number;
  
  // Timestamps
  ModificationTimestamp?: string;
  ListingContractDate?: string;
}

export enum PropertyStatus {
  Active = 'Active',
  Pending = 'Pending',
  Sold = 'Sold',
  ComingSoon = 'Coming Soon'
}

export enum PropertyType {
  Residential = 'Residential',
  Condominium = 'Condominium',
  Townhouse = 'Townhouse',
  Land = 'Land',
  Commercial = 'Commercial'
}

export interface PropertyResponse {
  value: Property[];
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
}

// Helper functions for property data
export const getPropertyTypeDisplay = (type: string): string => {
  switch(type) {
    case PropertyType.Condominium: return 'Condominium';
    case PropertyType.Townhouse: return 'Townhouse';
    case PropertyType.Land: return 'Land';
    case PropertyType.Commercial: return 'Commercial';
    case PropertyType.Residential:
    default: return 'Single Family Residence';
  }
};

export const getPropertyTypeWithSaleSuffix = (propertyType: string, filterType?: string): string => {
  const displayType = filterType || propertyType;
  
  switch(displayType) {
    case PropertyType.Condominium:
      return 'LUXURY CONDO FOR SALE';
    case PropertyType.Townhouse:
      return 'TOWNHOUSE FOR SALE';
    case PropertyType.Land:
      return 'LAND FOR SALE';
    case PropertyType.Commercial:
      return 'COMMERCIAL FOR SALE';
    case PropertyType.Residential:
    default:
      return 'FAMILY RESIDENCE FOR SALE';
  }
};

export const getPropertyTypeFilter = (filterType: string): string => {
  switch(filterType) {
    case PropertyType.Condominium:
      return "PropertyType eq 'Condominium'";
    case PropertyType.Townhouse:
      return "PropertyType eq 'Townhouse'";
    case PropertyType.Land:
      return "PropertyType eq 'Land'";
    case PropertyType.Commercial:
      return "PropertyType eq 'Commercial'";
    case PropertyType.Residential:
    default:
      return "PropertyType eq 'Residential'";
  }
};

export const isPropertyType = (value: string): value is PropertyType => {
  return Object.values(PropertyType).includes(value as PropertyType);
};

// Calculate renovation budget
export const calculateRenovationBudget = (property: Property): number => {
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

// Format dollar amounts
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0 
  }).format(price);
};

// Format property address
export const formatAddress = (property: Property) => {
  const streetAddress = `${property.StreetNumber} ${property.StreetName}`;
  const cityStateZip = `${property.City}, ${property.StateOrProvince} ${property.PostalCode}`;
  return { streetAddress, cityStateZip };
}; 