# Realtyna API Integration Guide for Renograte Estimator

## Overview

This guide provides comprehensive instructions for integrating Realtyna's MLS Router™ API with the Renograte Estimator workflow. The Realtyna API is a RESO-certified Web API that provides access to MLS data through Bright MLS, covering the Mid-Atlantic region.

## Realtyna API Documentation Resources

### Official Documentation

- **MLS Router™ API Documentation**: [realtyna.atlassian.net](https://realtyna.atlassian.net/wiki/spaces/RA/pages/1157300225/MLS%2BRouter%2BAPI)
- **RealtyFeed Dashboard**: [support.realtyna.com](https://support.realtyna.com/index.php?%2FDefault%2FKnowledgebase%2FArticle%2FView%2F582)
- **MLS On The Fly™ Setup**: [support.realtyna.com](https://support.realtyna.com/index.php?%2FDefault%2FKnowledgebase%2FArticle%2FView%2F863%2F0%2Fhow-to-setup-mls-on-the-fly-on-your-website)
- **GitHub Repositories**: [github.com/realtyna](https://github.com/realtyna)
- **Support Policies**: [support.realtyna.com](https://support.realtyna.com/index.php?%2FKnowledgebase%2FArticle%2FView%2F457)

## Bright MLS Coverage Area

Bright MLS covers the following regions:

- **Delaware**
- **Maryland**
- **New Jersey**
- **Pennsylvania**
- **Virginia**
- **Washington D.C.**
- **West Virginia**

## Current Implementation Status

### ✅ Already Implemented

1. **Authentication System**: OAuth2 client credentials flow
2. **Token Caching**: Automatic token refresh with expiration handling
3. **API Proxy**: `/api/realtyfeed` endpoint for secure server-side calls
4. **OData Query Support**: Full RESO OData query parameter support
5. **Error Handling**: Comprehensive error handling and logging
6. **Rate Limiting**: Request batching and caching

### 🔧 Issues to Fix

1. **URL Construction**: Fixed the invalid URL issue in estimate-renovation-allowance
2. **Geocoding Integration**: Ensure proper coordinate handling
3. **Property Matching**: Improve subject property identification
4. **Comparable Analysis**: Enhance renovated vs as-is property classification

## API Authentication Flow

### 1. Get API Credentials

1. Sign up on [RealtyFeed Dashboard](https://support.realtyna.com/index.php?%2FDefault%2FKnowledgebase%2FArticle%2FView%2F582)
2. Obtain your credentials:
   - `REALTYFEED_CLIENT_ID`
   - `REALTYFEED_CLIENT_SECRET`
   - `REALTYFEED_API_KEY`

### 2. Environment Variables

```env
REALTYFEED_CLIENT_ID=your_client_id
REALTYFEED_CLIENT_SECRET=your_client_secret
REALTYFEED_API_KEY=your_api_key
REALTYFEED_AUTH_URL=https://api.realtyfeed.com/v1/auth/token
REALTYFEED_API_URL=https://api.realtyfeed.com/reso/odata/
```

### 3. Authentication Process

```typescript
// Current implementation in /api/realtyfeed/route.ts
const formData = new URLSearchParams();
formData.append("grant_type", "client_credentials");
formData.append("client_id", clientId);
formData.append("client_secret", clientSecret);

const authResponse = await axios.post(authenticationUrl, formData, {
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "*/*",
    "Accept-Encoding": "gzip, deflate, br",
  },
});
```

## OData Query Structure

### Basic Query Format

```
Property?$filter={filter_conditions}&$select={fields}&$top={limit}&$orderby={sort}
```

### Key OData Parameters

- `$filter`: Filter conditions (geo.distance, StandardStatus, etc.)
- `$select`: Fields to return
- `$top`: Maximum number of results
- `$skip`: Pagination offset
- `$orderby`: Sort order
- `$expand`: Related entities (Media, etc.)
- `$count`: Include total count

### Geographic Queries

```typescript
// Find properties within distance
const query = `Property?$filter=geo.distance(Coordinates, POINT(${lng} ${lat})) lt ${distanceInDegrees}d and StandardStatus eq 'Active'`;
```

## Renograte Estimator Workflow Implementation

### 1. Address Geocoding

```typescript
async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  // Use Google Places API for geocoding
  const response = await fetch(
    `/api/places/autocomplete?input=${encodeURIComponent(address)}`
  );
  const data = await response.json();

  if (data.places && data.places.length > 0 && data.places[0].location) {
    return {
      lat: data.places[0].location.latitude,
      lng: data.places[0].location.longitude,
    };
  }
  return null;
}
```

### 2. Subject Property Identification

```typescript
async function findSubjectProperty(
  lat: number,
  lng: number
): Promise<PropertyData | null> {
  const distanceInDegrees = 0.05; // ~3 miles

  const query = `Property?$filter=geo.distance(Coordinates, POINT(${lng} ${lat})) lt ${distanceInDegrees}d and StandardStatus eq 'Active'&$select=ListingKey,StandardStatus,PropertyType,PropertySubType,ListPrice,StreetNumber,StreetName,City,StateOrProvince,PostalCode,BedroomsTotal,BathroomsTotalInteger,LivingArea,LotSizeAcres,LotSizeSquareFeet,YearBuilt,Latitude,Longitude,PublicRemarks,SubdivisionName,ListOfficeName,ListAgentFullName&$top=1`;

  const params = new URLSearchParams();
  params.append("resource", query);
  const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/realtyfeed?${params.toString()}`;

  const response = await fetch(url);
  const data = await response.json();

  return data.value && data.value.length > 0 ? data.value[0] : null;
}
```

### 3. Comparable Properties Search

```typescript
async function findComparableProperties(
  lat: number,
  lng: number,
  livingArea: number,
  propertyType: string
): Promise<{ renovated: ComparableProperty[]; asIs: ComparableProperty[] }> {
  const distanceInDegrees = 1; // ~60 miles
  const sizeMin = livingArea * 0.9;
  const sizeMax = livingArea * 1.1;

  const baseQuery = `Property?$filter=geo.distance(Coordinates, POINT(${lng} ${lat})) lt ${distanceInDegrees}d and LivingArea ge ${Math.round(sizeMin)} and LivingArea le ${Math.round(sizeMax)} and PropertyType eq '${propertyType}' and StandardStatus eq 'Sold'&$select=ListingKey,StandardStatus,PropertyType,ListPrice,LivingArea,BedroomsTotal,BathroomsTotalInteger,YearBuilt,Latitude,Longitude,PublicRemarks,PropertyCondition&$orderby=ListPrice desc&$top=20`;

  const params = new URLSearchParams();
  params.append("resource", baseQuery);
  const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/realtyfeed?${params.toString()}`;

  const response = await fetch(url);
  const data = await response.json();

  // Classify properties as renovated or as-is
  const renovated: ComparableProperty[] = [];
  const asIs: ComparableProperty[] = [];

  data.value?.forEach((property: any) => {
    const remarks = property.PublicRemarks?.toLowerCase() || "";
    const condition = property.PropertyCondition?.toLowerCase() || "";

    const isRenovated =
      remarks.includes("renovated") ||
      remarks.includes("updated") ||
      remarks.includes("remodeled") ||
      remarks.includes("new") ||
      condition.includes("excellent") ||
      condition.includes("very good");

    if (isRenovated) {
      renovated.push(property);
    } else {
      asIs.push(property);
    }
  });

  return {
    renovated: renovated.slice(0, 3),
    asIs: asIs.slice(0, 3),
  };
}
```

### 4. Renovation Allowance Calculation

```typescript
function calculateRenovationAllowance(arv: number, chv: number): number {
  // Renograte formula: (ARV × 87%) - CHV
  return Math.max(0, arv * 0.87 - chv);
}

function calculateARV(renovatedComps: ComparableProperty[]): number {
  if (renovatedComps.length === 0) return 0;
  const totalPrice = renovatedComps.reduce(
    (sum, comp) => sum + comp.ListPrice,
    0
  );
  return Math.round(totalPrice / renovatedComps.length);
}

function calculateCHV(asIsComps: ComparableProperty[]): number {
  if (asIsComps.length === 0) return 0;
  const totalPrice = asIsComps.reduce((sum, comp) => sum + comp.ListPrice, 0);
  return Math.round(totalPrice / asIsComps.length);
}
```

## Error Handling and Fallbacks

### 1. API Error Handling

```typescript
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
} catch (error) {
  console.error("RealtyFeed API Error:", error);
  // Implement fallback calculation
  return calculateFallbackEstimate(propertyData);
}
```

### 2. Fallback Calculation

```typescript
function calculateFallbackEstimate(property: PropertyData): EstimateResult {
  const baseRenovationPercentage = getBaseRenovationPercentage(
    property.ListPrice
  );
  const maxAllowance = getMaxAllowance(property.ListPrice);

  const renovationAllowance = Math.min(
    property.ListPrice * baseRenovationPercentage,
    maxAllowance
  );

  const arv =
    property.ListPrice + renovationAllowance + renovationAllowance * 0.3;

  return {
    arv: Math.round(arv),
    chv: property.ListPrice,
    renovationAllowance: Math.round(renovationAllowance),
    calculationMethod: "fallback",
  };
}
```

## Performance Optimization

### 1. Caching Strategy

```typescript
// Cache API responses for 5 minutes
const CACHE_TTL = 5 * 60 * 1000;

// Implement in useRealtyFeedApi hook
const cache: Record<string, CacheEntry<any>> = {};
```

### 2. Request Batching

```typescript
// Batch multiple property queries
const batchQueries = async (queries: string[]) => {
  const promises = queries.map((query) =>
    fetch(`/api/realtyfeed?resource=${encodeURIComponent(query)}`)
  );
  return Promise.all(promises);
};
```

### 3. Rate Limiting

```typescript
// Implement rate limiting to respect API limits
const rateLimiter = {
  requests: 0,
  windowStart: Date.now(),
  maxRequests: 100, // Adjust based on your plan
  windowMs: 60000, // 1 minute

  async checkLimit() {
    const now = Date.now();
    if (now - this.windowStart > this.windowMs) {
      this.requests = 0;
      this.windowStart = now;
    }

    if (this.requests >= this.maxRequests) {
      throw new Error("Rate limit exceeded");
    }

    this.requests++;
  },
};
```

## Testing and Validation

### 1. Test Endpoints

```typescript
// Test the estimator with sample data
GET /api/test-estimator

// Test RealtyFeed API directly
GET /api/realtyfeed?resource=Property?$top=1
```

### 2. Sample Test Data

```typescript
const testAddresses = [
  "123 Main St, Washington, DC 20002",
  "456 Oak Ave, Baltimore, MD 21201",
  "789 Pine St, Philadelphia, PA 19102",
];
```

### 3. Validation Checks

- Verify geocoding accuracy
- Check property matching precision
- Validate comparable selection logic
- Test calculation accuracy
- Monitor API response times

## Security Considerations

### 1. API Key Protection

- Store credentials server-side only
- Use environment variables
- Never expose in client-side code
- Rotate keys regularly

### 2. Input Validation

```typescript
function validateAddress(address: string): boolean {
  // Basic address validation
  const addressRegex = /^[\w\s,.-]+$/;
  return addressRegex.test(address) && address.length > 5;
}
```

### 3. Rate Limiting

- Implement per-user rate limiting
- Monitor for abuse patterns
- Set appropriate limits based on subscription

## Monitoring and Analytics

### 1. API Usage Tracking

```typescript
// Track API calls for monitoring
const apiMetrics = {
  totalCalls: 0,
  successfulCalls: 0,
  failedCalls: 0,
  averageResponseTime: 0,

  recordCall(success: boolean, responseTime: number) {
    this.totalCalls++;
    if (success) this.successfulCalls++;
    else this.failedCalls++;

    this.averageResponseTime =
      (this.averageResponseTime * (this.totalCalls - 1) + responseTime) /
      this.totalCalls;
  },
};
```

### 2. Error Monitoring

```typescript
// Log errors for analysis
function logError(error: Error, context: string) {
  console.error(`[${context}] Error:`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  });
}
```

## Next Steps

### 1. Immediate Actions

1. ✅ Fix URL construction issue in estimate-renovation-allowance
2. 🔧 Test the fixed implementation
3. 🔧 Validate API credentials and connectivity
4. 🔧 Test with sample addresses in Bright MLS coverage area

### 2. Enhancements

1. **AI Integration**: Use Google Gemini or ChatGPT for better property classification
2. **Advanced Filtering**: Implement more sophisticated comparable selection
3. **Historical Data**: Add trend analysis and market insights
4. **Mobile Optimization**: Ensure responsive design for mobile users

### 3. Documentation

1. **API Documentation**: Create comprehensive API docs
2. **User Guide**: Develop user-facing documentation
3. **Developer Guide**: Create technical implementation guide

## Support Resources

- **Realtyna Support**: [support.realtyna.com](https://support.realtyna.com)
- **API Documentation**: [realtyna.atlassian.net](https://realtyna.atlassian.net/wiki/spaces/RA/pages)
- **GitHub**: [github.com/realtyna](https://github.com/realtyna)
- **Bright MLS**: [brightmls.com](https://brightmls.com)

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: Renograte Development Team

## Realtyna API Property Fields - Complete Overview

### **Core Property Fields**

The Realtyna API (via Bright MLS) returns the following property fields in its response:

#### **1. Core Listing Data**
- `ListingKey` (string) - Unique identifier for the property listing
- `StandardStatus` (string) - Current status: 'Active', 'Pending', 'Sold', 'Coming Soon'
- `PropertyType` (string) - Main property type: 'Residential', 'Condominium', 'Townhouse', 'Land', 'Commercial'
- `PropertySubType` (string, optional) - Sub-category like 'Single Family', 'Multi-Family', etc.
- `ListPrice` (number) - Current listing price

#### **2. Address Information**
- `StreetNumber` (string) - Street number
- `StreetName` (string) - Street name
- `City` (string) - City name
- `StateOrProvince` (string) - State or province code
- `PostalCode` (string) - ZIP/Postal code

#### **3. Property Details**
- `BedroomsTotal` (number) - Total number of bedrooms
- `BathroomsTotalInteger` (number) - Total number of bathrooms
- `LivingArea` (number) - Square footage of living area
- `YearBuilt` (number, optional) - Year the property was built
- `Latitude` (number, optional) - Geographic latitude
- `Longitude` (number, optional) - Geographic longitude
- `RoomsTotal` (number, optional) - Total number of rooms

#### **4. Lot Information**
- `LotSizeAcres` (number, optional) - Lot size in acres
- `LotSizeSquareFeet` (number, optional) - Lot size in square feet

#### **5. Media & Visual Content**
- `Media` (array, optional) - Array of media objects containing:
  - `MediaURL` (string) - URL to the media file
  - `Order` (number, optional) - Display order
  - `MediaKey` (string, optional) - Unique media identifier
  - `MediaType` (string, optional) - Type of media
  - `MediaCategory` (string, optional) - Category of media

#### **6. Agent & Office Information**
- `ListOfficeName` (string, optional) - Name of the listing office
- `ListAgentFullName` (string, optional) - Full name of the listing agent

#### **7. Property Features**
- `InteriorFeatures` (string[], optional) - Array of interior features
- `ExteriorFeatures` (string[], optional) - Array of exterior features
- `Appliances` (string[], optional) - Array of included appliances
- `Heating` (string[], optional) - Array of heating systems
- `Cooling` (string[], optional) - Array of cooling systems
- `ParkingFeatures` (string[], optional) - Array of parking features
- `WaterSource` (string, optional) - Water source information
- `Utilities` (string[], optional) - Array of available utilities
- `Construction` (string[], optional) - Array of construction materials/methods

#### **8. Property Condition & Description**
- `PublicRemarks` (string, optional) - Public description and remarks
- `PropertyCondition` (string, optional) - Property condition (e.g., 'Excellent', 'Very Good', 'Good', 'Fair', 'Poor')
- `SubdivisionName` (string, optional) - Name of the subdivision/neighborhood

#### **9. Financial Information**
- `TaxAssessedValue` (number, optional) - Tax assessed value
- `TaxAnnualAmount` (number, optional) - Annual tax amount

#### **10. Timestamps**
- `ModificationTimestamp` (string, optional) - Last modification date
- `ListingContractDate` (string, optional) - Date the listing contract was signed

### **API Response Structure**

The Realtyna API returns data in OData format with the following structure:

```typescript
interface PropertyResponse {
  value: Property[];           // Array of property objects
  '@odata.count'?: number;     // Total count of matching properties
  '@odata.nextLink'?: string;  // URL for next page of results
}
```

### **Property Status Values**
- `Active` - Currently available for purchase
- `Pending` - Under contract but not yet closed
- `Sold` - Property has been sold
- `Coming Soon` - Property will be listed soon

### **Property Type Values**
- `Residential` - Single family homes
- `Condominium` - Condo units
- `Townhouse` - Townhouse properties
- `Land` - Vacant land
- `Commercial` - Commercial properties

### **Geographic Coverage**
The Realtyna API covers the Bright MLS region including:
- Delaware
- Maryland
- New Jersey
- Pennsylvania
- Virginia
- Washington D.C.
- West Virginia

### **Query Examples**

The codebase shows various query patterns for accessing these fields:

```typescript
// Basic property search
Property?$filter=StandardStatus eq 'Active'&$select=ListingKey,StandardStatus,PropertyType,ListPrice

// Geographic search
Property?$filter=geo.distance(Coordinates, POINT(-76.6689 39.2904)) lt 0.01d

// Detailed property with all fields
Property?$filter=ListingKey eq 'PROPERTY_ID'&$expand=Media&$select=ListingKey,StandardStatus,PropertyType,PropertySubType,ListPrice,StreetNumber,StreetName,City,StateOrProvince,PostalCode,BedroomsTotal,BathroomsTotalInteger,LivingArea,LotSizeAcres,LotSizeSquareFeet,YearBuilt,Latitude,Longitude,PublicRemarks,SubdivisionName,ListOfficeName,ListAgentFullName,InteriorFeatures,ExteriorFeatures,Appliances,Heating,Cooling,ParkingFeatures,WaterSource,Utilities,Construction,RoomsTotal,TaxAssessedValue,TaxAnnualAmount
```
