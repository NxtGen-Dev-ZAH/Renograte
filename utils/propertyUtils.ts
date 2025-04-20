/**
 * Property types and status utilities
 */

import { Property } from '@/types/property';

/**
 * Property types enum
 */
export enum PropertyType {
  Residential = 'Residential',
  Condominium = 'Condominium',
  Townhouse = 'Townhouse',
  Land = 'Land',
  Commercial = 'Commercial'
}

/**
 * Property status enum
 */
export enum PropertyStatus {
  All = 'All',
  Active = 'Active',
  Pending = 'Pending',
  Sold = 'Sold',
  ComingSoon = 'Coming Soon'
}

/**
 * Get display name for property type
 */
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

/**
 * Get property type with "FOR SALE" suffix for listings display
 */
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

/**
 * Get property type options for dropdowns
 */
export function getPropertyTypeOptions() {
  return [
    { value: PropertyType.Residential, label: 'Residential' },
    { value: PropertyType.Condominium, label: 'Condominium' },
    { value: PropertyType.Townhouse, label: 'Townhouse' },
    { value: PropertyType.Land, label: 'Land' },
    { value: PropertyType.Commercial, label: 'Commercial' },
  ];
}

/**
 * Get property status options for dropdowns
 */
export function getPropertyStatusOptions() {
  return [
    { value: PropertyStatus.Active, label: 'Active' },
    { value: PropertyStatus.Pending, label: 'Pending' },
    { value: PropertyStatus.Sold, label: 'Sold' },
    { value: PropertyStatus.ComingSoon, label: 'Coming Soon' },
  ];
}

/**
 * Map from UI property type to API property type
 */
export function mapToApiPropertyType(uiType: string): string {
  const propertyTypeMap: { [key: string]: string } = {
    [PropertyType.Residential]: PropertyType.Residential,
    [PropertyType.Condominium]: PropertyType.Condominium,
    [PropertyType.Townhouse]: PropertyType.Townhouse,
    [PropertyType.Land]: PropertyType.Land,
    [PropertyType.Commercial]: PropertyType.Commercial,
  };

  return propertyTypeMap[uiType] || uiType;
}

/**
 * Get property type filter for API queries
 */
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

/**
 * Identifies alternative types to check when primary property type returns no results
 */
export function getAlternativePropertyTypes(primaryType: string): string[] {
  const typeMap: { [key: string]: string[] } = {
    [PropertyType.Condominium]: ['Condo/Townhouse/Row Home/Co-Op', 'Condominium', 'Condo'],
    [PropertyType.Townhouse]: ['Condo/Townhouse/Row Home/Co-Op', 'Townhome', 'Town House'],
    [PropertyType.Commercial]: ['Commercial', 'Retail', 'Office', 'Industrial', 'Business'],
  };
  
  return typeMap[primaryType] || [primaryType];
}

/**
 * Check if a property belongs to a specific property type category
 * This handles various naming conventions and subtypes
 */
export function isPropertyType(property: any, typeCategory: string): boolean {
  if (!property) return false;
  
  // Direct match on PropertyType
  if (property.PropertyType === typeCategory) return true;
  
  // Match on PropertySubType
  if (property.PropertySubType === typeCategory) return true;
  
  // Handle special cases
  const alternativeTypes = getAlternativePropertyTypes(typeCategory);
  if (alternativeTypes.includes(property.PropertyType) || 
      alternativeTypes.includes(property.PropertySubType)) {
    return true;
  }
  
  return false;
}

// Format price as currency
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0 
  }).format(price);
};

// Format address from property object
export const formatAddress = (property: Property) => {
  const streetAddress = `${property.StreetNumber} ${property.StreetName}`;
  const cityStateZip = `${property.City}, ${property.StateOrProvince} ${property.PostalCode}`;
  const fullAddress = `${streetAddress}, ${cityStateZip}`;
  return { streetAddress, cityStateZip, fullAddress };
};

// Calculate renovation budget based on property price
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

// Calculate After Renovation Value (ARV)
export const calculateARV = (property: Property): number => {
  const renovationAllowance = calculateRenovationBudget(property);
  const profitMargin = 0.30; // 30% profit margin on renovation
  return property.ListPrice + renovationAllowance + (renovationAllowance * profitMargin);
};

// Get main image from property media
export const getMainPropertyImage = (property: Property): string | null => {
  if (!property.Media || property.Media.length === 0) {
    return null;
  }
  
  // Try to find the first image by Order
  const sortedMedia = [...property.Media].sort((a, b) => {
    const orderA = a.Order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.Order ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });
  
  return sortedMedia[0].MediaURL;
};

// Format optimized API query for property details
export const getPropertyDetailsQuery = (propertyId: string): string => {
  return `Property?$filter=ListingKey eq '${propertyId}'&$expand=Media&$select=ListingKey,StandardStatus,PropertyType,PropertySubType,ListPrice,StreetNumber,StreetName,City,StateOrProvince,PostalCode,BedroomsTotal,BathroomsTotalInteger,LivingArea,LotSizeAcres,LotSizeSquareFeet,YearBuilt,Latitude,Longitude,PublicRemarks,SubdivisionName,ListOfficeName,ListAgentFullName,InteriorFeatures,ExteriorFeatures,Appliances,Heating,Cooling,ParkingFeatures,WaterSource,Utilities,Construction,RoomsTotal,TaxAssessedValue,TaxAnnualAmount`;
};

// Format optimized API query for similar properties
export const getSimilarPropertiesQuery = (property: Property, limit: number = 15): string => {
  if (!property?.City) {
    return '';
  }

  // Query properties in the same city, with similar price range
  const priceMin = Math.max(property.ListPrice * 0.7, 100000);
  const priceMax = property.ListPrice * 1.3;
  
  return `Property?$filter=` +
    `City eq '${property.City}' and ` +
    `ListingKey ne '${property.ListingKey}' and ` +
    `StandardStatus eq 'Active' and ` +
    `ListPrice ge ${Math.round(priceMin)} and ` +
    `ListPrice le ${Math.round(priceMax)}` +
    `&$select=ListingKey,StandardStatus,PropertyType,ListPrice,StreetNumber,StreetName,` +
    `City,StateOrProvince,PostalCode,BedroomsTotal,BathroomsTotalInteger,LivingArea,` +
    `Latitude,Longitude&$expand=Media&$top=${limit}`;
}; 