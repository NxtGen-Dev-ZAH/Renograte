/**
 * Represents a property media item (image, video, etc.)
 */
export interface Media {
  MediaKey?: string;
  MediaURL: string;
  MediaType?: string;
  Order?: number;
  Description?: string;
}

/**
 * Represents a property listing
 */
export interface Property {
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
  Latitude: number;
  Longitude: number;
  Media?: Media[];
  SubdivisionName?: string;
  ListOfficeName?: string;
  
  // Additional properties
  YearBuilt?: number;
  LotSizeAcres?: number;
  RoomsTotal?: number;
  PublicRemarks?: string;
  ListAgentFullName?: string;
  TaxAssessedValue?: number;
  TaxAnnualAmount?: number;
  InteriorFeatures?: string[];
  ExteriorFeatures?: string[];
  Appliances?: string[];
  Heating?: string[];
  Cooling?: string[];
  ParkingFeatures?: string[];
  Construction?: string[];
  WaterSource?: string;
  Utilities?: string[];
} 