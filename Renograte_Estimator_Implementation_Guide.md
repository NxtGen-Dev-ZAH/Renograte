# Renograte Estimator - Complete Implementation Guide

## Overview

The Renograte Estimator uses latitude and longitude coordinates to search for properties in the RealtyFeed API. This guide explains how to properly implement coordinate-based searches and troubleshoot common issues.

## How Coordinates Work in RealtyFeed API

### 1. **Geographic Search Syntax**

The RealtyFeed API uses the `geo.distance()` function for coordinate-based searches:

```typescript
// Basic coordinate search
const query = `Property?$filter=geo.distance(Coordinates, POINT(${longitude} ${latitude})) lt ${distanceInDegrees}d`;

// Example with specific coordinates
const query = `Property?$filter=geo.distance(Coordinates, POINT(-76.6689 39.2904)) lt 0.01d`;
```

### 2. **Coordinate Format**

- **Longitude first, then Latitude**: `POINT(longitude latitude)`
- **Distance in degrees**: Use `d` suffix (e.g., `0.01d`)
- **Distance approximations**:
  - `0.001d` ≈ 0.06 miles
  - `0.01d` ≈ 0.6 miles
  - `0.05d` ≈ 3 miles
  - `0.1d` ≈ 6 miles

## Additional Searchable Fields

When coordinate-based searches don't return results, use these additional searchable fields:

### 1. **Location-Based Fields**

```typescript
// City-based search
const cityQuery = `Property?$filter=City eq 'Philadelphia' and StandardStatus eq 'Sold'`;

// State-based search
const stateQuery = `Property?$filter=StateOrProvince eq 'PA' and StandardStatus eq 'Sold'`;

// Postal code search
const zipQuery = `Property?$filter=PostalCode eq '19102' and StandardStatus eq 'Sold'`;

// Neighborhood search
const neighborhoodQuery = `Property?$filter=SubdivisionName eq 'Center City' and StandardStatus eq 'Sold'`;
```

### 2. **Property Characteristics**

```typescript
// Size-based search
const sizeQuery = `Property?$filter=LivingArea ge 1600 and LivingArea le 2400 and StandardStatus eq 'Sold'`;

// Bedroom/bathroom search
const bedroomQuery = `Property?$filter=BedroomsTotal eq 3 and BathroomsTotalInteger eq 2 and StandardStatus eq 'Sold'`;

// Property type search
const typeQuery = `Property?$filter=PropertyType eq 'Residential' and PropertySubType eq 'Single Family' and StandardStatus eq 'Sold'`;

// Year built search
const yearQuery = `Property?$filter=YearBuilt ge 1900 and YearBuilt le 2000 and StandardStatus eq 'Sold'`;
```

### 3. **Price-Based Fields**

```typescript
// Price range search
const priceQuery = `Property?$filter=ListPrice ge 500000 and ListPrice le 1000000 and StandardStatus eq 'Sold'`;

// Price per square foot (calculated)
const pricePerSqFtQuery = `Property?$filter=ListPrice ge 500000 and LivingArea ge 1500 and StandardStatus eq 'Sold'`;
```

### 4. **Status and Condition Fields**

```typescript
// Multiple status search
const statusQuery = `Property?$filter=(StandardStatus eq 'Sold' or StandardStatus eq 'Active')`;

// Condition-based search
const conditionQuery = `Property?$filter=PropertyCondition eq 'Excellent' and StandardStatus eq 'Sold'`;
```

## Progressive Search Strategy

### 1. **Primary Strategy: Coordinate-Based**

```typescript
async function findComparableProperties(
  lat: number,
  lng: number,
  livingArea: number,
  propertyType: string
) {
  const strategies = [
    // Strategy 1: Strict coordinate search
    {
      name: "Strict Coordinate",
      query: `Property?$filter=geo.distance(Coordinates, POINT(${lng} ${lat})) lt 0.016d and LivingArea ge ${Math.round(livingArea * 0.8)} and LivingArea le ${Math.round(livingArea * 1.2)} and PropertyType eq '${propertyType}' and StandardStatus eq 'Sold'`,
    },
    // Strategy 2: Larger radius
    {
      name: "Larger Radius",
      query: `Property?$filter=geo.distance(Coordinates, POINT(${lng} ${lat})) lt 0.05d and LivingArea ge ${Math.round(livingArea * 0.8)} and LivingArea le ${Math.round(livingArea * 1.2)} and PropertyType eq '${propertyType}' and StandardStatus eq 'Sold'`,
    },
    // Strategy 3: Flexible size criteria
    {
      name: "Flexible Size",
      query: `Property?$filter=geo.distance(Coordinates, POINT(${lng} ${lat})) lt 0.016d and LivingArea ge ${Math.round(livingArea * 0.6)} and LivingArea le ${Math.round(livingArea * 1.4)} and PropertyType eq '${propertyType}' and StandardStatus eq 'Sold'`,
    },
  ];

  // Try each strategy
  for (const strategy of strategies) {
    const result = await executeQuery(strategy.query);
    if (result.length > 0) return result;
  }

  return null;
}
```

### 2. **Secondary Strategy: Location-Based**

```typescript
async function findComparablePropertiesByLocation(
  city: string,
  state: string,
  livingArea: number,
  propertyType: string
) {
  const strategies = [
    // Strategy 1: City-based with size criteria
    {
      name: "City-Based",
      query: `Property?$filter=City eq '${city}' and LivingArea ge ${Math.round(livingArea * 0.8)} and LivingArea le ${Math.round(livingArea * 1.2)} and PropertyType eq '${propertyType}' and StandardStatus eq 'Sold'&$orderby=ListPrice desc`,
    },
    // Strategy 2: State-based with size criteria
    {
      name: "State-Based",
      query: `Property?$filter=StateOrProvince eq '${state}' and LivingArea ge ${Math.round(livingArea * 0.8)} and LivingArea le ${Math.round(livingArea * 1.2)} and PropertyType eq '${propertyType}' and StandardStatus eq 'Sold'&$orderby=ListPrice desc`,
    },
    // Strategy 3: City-based without size restrictions
    {
      name: "City-Only",
      query: `Property?$filter=City eq '${city}' and PropertyType eq '${propertyType}' and StandardStatus eq 'Sold'&$orderby=ListPrice desc`,
    },
  ];

  // Try each strategy
  for (const strategy of strategies) {
    const result = await executeQuery(strategy.query);
    if (result.length > 0) return result;
  }

  return null;
}
```

### 3. **Tertiary Strategy: Market-Based**

```typescript
async function findComparablePropertiesByMarket(
  livingArea: number,
  propertyType: string
) {
  const strategies = [
    // Strategy 1: Size-based search across all markets
    {
      name: "Size-Based",
      query: `Property?$filter=LivingArea ge ${Math.round(livingArea * 0.8)} and LivingArea le ${Math.round(livingArea * 1.2)} and PropertyType eq '${propertyType}' and StandardStatus eq 'Sold'&$orderby=ListPrice desc`,
    },
    // Strategy 2: Property type only
    {
      name: "Type-Only",
      query: `Property?$filter=PropertyType eq '${propertyType}' and StandardStatus eq 'Sold'&$orderby=ListPrice desc`,
    },
    // Strategy 3: All sold properties
    {
      name: "All-Sold",
      query: `Property?$filter=StandardStatus eq 'Sold'&$orderby=ListPrice desc`,
    },
  ];

  // Try each strategy
  for (const strategy of strategies) {
    const result = await executeQuery(strategy.query);
    if (result.length > 0) return result;
  }

  return null;
}
```

## Implementation Strategy

### Step 1: Address Geocoding

```typescript
async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  // Use Google Places API to convert address to coordinates
  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": "places.location",
      },
      body: JSON.stringify({ textQuery: address }),
    }
  );

  const data = await response.json();
  if (data.places?.[0]?.location) {
    return {
      lat: data.places[0].location.latitude,
      lng: data.places[0].location.longitude,
    };
  }
  return null;
}
```

### Step 2: Subject Property Search

```typescript
async function findSubjectProperty(
  lat: number,
  lng: number,
  address?: string
): Promise<PropertyData | null> {
  // Strategy 1: Exact address match (if address provided)
  if (address) {
    const exactQuery = `Property?$filter=StreetNumber eq '${streetNumber}' and contains(StreetName,'${streetName}') and City eq '${city}' and StateOrProvince eq '${state}' and StandardStatus eq 'Active'`;
    // ... execute query
  }

  // Strategy 2: Coordinate-based search with multiple radii
  const searchStrategies = [
    { distance: 0.005, status: "Active" }, // ~0.3 miles
    { distance: 0.01, status: "Active" }, // ~0.6 miles
    { distance: 0.05, status: "Active" }, // ~3 miles
    { distance: 0.1, status: "Active" }, // ~6 miles
    { distance: 0.05, status: "Sold" }, // ~3 miles, sold properties
  ];

  for (const strategy of searchStrategies) {
    const query = `Property?$filter=geo.distance(Coordinates, POINT(${lng} ${lat})) lt ${strategy.distance}d and StandardStatus eq '${strategy.status}'&$orderby=geo.distance(Coordinates, POINT(${lng} ${lat}))&$top=10`;
    // ... execute query and return first result
  }
}
```

### Step 3: Comparable Properties Search

```typescript
async function findComparableProperties(
  lat: number,
  lng: number,
  livingArea: number,
  propertyType: string
) {
  const distanceInDegrees = 0.016; // ~1 mile
  const sizeMin = livingArea * 0.8;
  const sizeMax = livingArea * 1.2;

  const query = `Property?$filter=geo.distance(Coordinates, POINT(${lng} ${lat})) lt ${distanceInDegrees}d and LivingArea ge ${Math.round(sizeMin)} and LivingArea le ${Math.round(sizeMax)} and PropertyType eq '${propertyType}' and StandardStatus eq 'Sold'&$orderby=geo.distance(Coordinates, POINT(${lng} ${lat}))&$top=30`;

  // Execute query and classify properties as renovated vs as-is
}
```

## Troubleshooting Coordinate Searches

### Common Issues and Solutions

#### 1. **No Results from Coordinate Search**

**Possible Causes:**

- Coordinates are outside the MLS coverage area
- Distance is too small
- No properties in the specified status

**Solutions:**

```typescript
// Try multiple search strategies
const strategies = [
  { distance: 0.005, status: "Active" },
  { distance: 0.01, status: "Active" },
  { distance: 0.05, status: "Active" },
  { distance: 0.1, status: "Active" },
  { distance: 0.05, status: "Sold" },
  { distance: 0.1, status: "Sold" },
];
```

#### 2. **Incorrect Coordinate Format**

**Issue:** Wrong order of longitude/latitude
**Solution:** Always use `POINT(longitude latitude)`

```typescript
// ❌ Wrong
const query = `geo.distance(Coordinates, POINT(${lat} ${lng}))`;

// ✅ Correct
const query = `geo.distance(Coordinates, POINT(${lng} ${lat}))`;
```

#### 3. **Distance Units**

**Issue:** Using miles instead of degrees
**Solution:** Convert to degrees or use the `d` suffix

```typescript
// ❌ Wrong
const query = `geo.distance(Coordinates, POINT(${lng} ${lat})) lt 1`;

// ✅ Correct
const query = `geo.distance(Coordinates, POINT(${lng} ${lat})) lt 0.016d`;
```

### Debugging Tools

#### 1. **Test Endpoint**

Use the test endpoint to verify API functionality:

```bash
GET /api/test-estimator?address=2312 Longwood Ave, Baltimore, MD 21216
```

This will test:

- Geocoding
- Exact address search
- Coordinate-based searches
- Comparable property searches

#### 2. **Direct API Testing**

Test RealtyFeed queries directly:

```typescript
// Test coordinate search
const testQuery = `Property?$filter=geo.distance(Coordinates, POINT(-76.6689 39.2904)) lt 0.01d and StandardStatus eq 'Active'&$top=5`;

const params = new URLSearchParams();
params.append("resource", testQuery);
const url = `/api/realtyfeed?${params.toString()}`;
```

## Best Practices

### 1. **Progressive Search Strategy**

```typescript
async function progressivePropertySearch(
  lat: number,
  lng: number,
  address?: string
) {
  // 1. Try exact address match first
  if (address) {
    const exactMatch = await searchByExactAddress(address);
    if (exactMatch) return exactMatch;
  }

  // 2. Try small radius coordinate search
  const smallRadius = await searchByCoordinates(lat, lng, 0.005, "Active");
  if (smallRadius) return smallRadius;

  // 3. Expand radius gradually
  const largerRadius = await searchByCoordinates(lat, lng, 0.05, "Active");
  if (largerRadius) return largerRadius;

  // 4. Try sold properties
  const soldProperty = await searchByCoordinates(lat, lng, 0.05, "Sold");
  if (soldProperty) return soldProperty;

  // 5. Fallback to synthetic data
  return createSyntheticProperty(lat, lng, address);
}
```

### 2. **Error Handling**

```typescript
async function robustCoordinateSearch(lat: number, lng: number) {
  try {
    // Validate coordinates
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new Error("Invalid coordinates");
    }

    // Execute search with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Coordinate search failed:", error);
    return null;
  }
}
```

### 3. **Caching Strategy**

```typescript
// Cache coordinate search results
const coordinateCache = new Map();

function getCacheKey(lat: number, lng: number, radius: number, status: string) {
  return `${lat.toFixed(4)}_${lng.toFixed(4)}_${radius}_${status}`;
}

async function cachedCoordinateSearch(
  lat: number,
  lng: number,
  radius: number,
  status: string
) {
  const cacheKey = getCacheKey(lat, lng, radius, status);

  if (coordinateCache.has(cacheKey)) {
    return coordinateCache.get(cacheKey);
  }

  const result = await executeCoordinateSearch(lat, lng, radius, status);
  coordinateCache.set(cacheKey, result);

  return result;
}
```

## Testing Your Implementation

### 1. **Unit Tests**

```typescript
describe("Coordinate Search", () => {
  test("should find properties within radius", async () => {
    const lat = 39.2904;
    const lng = -76.6689;
    const radius = 0.01;

    const result = await findSubjectProperty(lat, lng);
    expect(result).toBeTruthy();
    expect(result.Latitude).toBeCloseTo(lat, 2);
    expect(result.Longitude).toBeCloseTo(lng, 2);
  });
});
```

### 2. **Integration Tests**

```typescript
describe("Estimator Integration", () => {
  test("should calculate renovation allowance for known property", async () => {
    const address = "2312 Longwood Ave, Baltimore, MD 21216";

    const response = await fetch("/api/estimate-renovation-allowance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    });

    const result = await response.json();
    expect(result.renovationAllowance).toBeGreaterThan(0);
    expect(result.calculationMethod).toBe("mls_data");
  });
});
```

## Environment Variables

Ensure these are configured:

```env
# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# RealtyFeed API
REALTYFEED_CLIENT_ID=your_client_id
REALTYFEED_CLIENT_SECRET=your_client_secret
REALTYFEED_API_KEY=your_api_key
REALTYFEED_AUTH_URL=https://api.realtyfeed.com/v1/auth/token
REALTYFEED_API_URL=https://api.realtyfeed.com/reso/odata/

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Summary

The key to successful coordinate-based searches in the Renograte Estimator is:

1. **Proper coordinate format**: `POINT(longitude latitude)`
2. **Progressive search strategy**: Start small, expand gradually
3. **Multiple fallback options**: Exact address → small radius → large radius → sold properties → synthetic data
4. **Additional searchable fields**: Use city, state, size, and other fields when coordinates fail
5. **Robust error handling**: Timeouts, validation, graceful degradation
6. **Comprehensive testing**: Unit tests, integration tests, manual testing

Your current implementation is already using the correct approach with `geo.distance()`. The improvements I've provided will make it more robust and easier to debug.
