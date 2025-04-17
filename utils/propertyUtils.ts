/**
 * Property types and status utilities
 */

/**
 * Property types enum
 */
export enum PropertyType {
  RESIDENTIAL = 'Residential',
  CONDOMINIUM = 'Condominium',
  TOWNHOUSE = 'Townhouse',
  LAND = 'Land',
  COMMERCIAL = 'Commercial',
}

/**
 * Property status enum
 */
export enum PropertyStatus {
  ALL = 'All',
  ACTIVE = 'Active',
  PENDING = 'Pending',
  SOLD = 'Sold',
  COMING_SOON = 'Coming Soon',
}

/**
 * Get display name for property type
 */
export function getPropertyTypeDisplay(type: string): string {
  switch(type) {
    case PropertyType.CONDOMINIUM:
      return 'Condominium';
    case PropertyType.TOWNHOUSE:
      return 'Townhouse';
    case PropertyType.LAND:
      return 'Land';
    case PropertyType.COMMERCIAL:
      return 'Commercial';
    case PropertyType.RESIDENTIAL:
    default:
      return 'Single Family Residence';
  }
}

/**
 * Get property type with "FOR SALE" suffix for listings display
 */
export function getPropertyTypeWithSaleSuffix(type: string, currentFilterType?: string): string {
  // First check if we're filtering by a specific property type
  // This ensures the displayed type matches the filter selection
  if (currentFilterType) {
    if (currentFilterType === PropertyType.CONDOMINIUM) {
      return "LUXURY CONDOMINIUM FOR SALE";
    }
  }
  
  // Otherwise check the property's actual type
  if (type === PropertyType.CONDOMINIUM || 
      getAlternativePropertyTypes(PropertyType.CONDOMINIUM).includes(type)) {
    return "LUXURY CONDOMINIUM FOR SALE";
  }
  
  return `${getPropertyTypeDisplay(type).toUpperCase()} FOR SALE`;
}

/**
 * Get property type options for dropdowns
 */
export function getPropertyTypeOptions() {
  return [
    { value: PropertyType.RESIDENTIAL, label: 'Residential' },
    { value: PropertyType.CONDOMINIUM, label: 'Condominium' },
    { value: PropertyType.TOWNHOUSE, label: 'Townhouse' },
    { value: PropertyType.LAND, label: 'Land' },
    { value: PropertyType.COMMERCIAL, label: 'Commercial' },
  ];
}

/**
 * Get property status options for dropdowns
 */
export function getPropertyStatusOptions() {
  return [
    { value: PropertyStatus.ALL, label: 'All Statuses' },
    { value: PropertyStatus.ACTIVE, label: 'Active' },
    { value: PropertyStatus.PENDING, label: 'Pending' },
    { value: PropertyStatus.SOLD, label: 'Sold' },
    { value: PropertyStatus.COMING_SOON, label: 'Coming Soon' },
  ];
}

/**
 * Map from UI property type to API property type
 */
export function mapToApiPropertyType(uiType: string): string {
  const propertyTypeMap: { [key: string]: string } = {
    [PropertyType.RESIDENTIAL]: PropertyType.RESIDENTIAL,
    [PropertyType.CONDOMINIUM]: PropertyType.CONDOMINIUM,
    [PropertyType.TOWNHOUSE]: PropertyType.TOWNHOUSE,
    [PropertyType.LAND]: PropertyType.LAND,
    [PropertyType.COMMERCIAL]: PropertyType.COMMERCIAL,
  };

  return propertyTypeMap[uiType] || uiType;
}

/**
 * Get property type filter for API queries
 */
export function getPropertyTypeFilter(propertyType: string): string {
  // For common types where we want to be strict about the match
  if (propertyType === PropertyType.RESIDENTIAL || propertyType === PropertyType.LAND) {
    return `PropertyType eq '${propertyType}'`;
  }
  
  // For other types, we check both PropertyType and PropertySubType
  return `(PropertyType eq '${propertyType}' or PropertySubType eq '${propertyType}')`;
}

/**
 * Identifies alternative types to check when primary property type returns no results
 */
export function getAlternativePropertyTypes(primaryType: string): string[] {
  const typeMap: { [key: string]: string[] } = {
    [PropertyType.CONDOMINIUM]: ['Condo/Townhouse/Row Home/Co-Op', 'Condominium', 'Condo'],
    [PropertyType.TOWNHOUSE]: ['Condo/Townhouse/Row Home/Co-Op', 'Townhome', 'Town House'],
    [PropertyType.COMMERCIAL]: ['Commercial', 'Retail', 'Office', 'Industrial', 'Business'],
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