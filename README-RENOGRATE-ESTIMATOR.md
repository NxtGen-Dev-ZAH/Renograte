# Renograte Estimator - Implementation Guide

## Overview

The Renograte Estimator is a comprehensive renovation allowance calculation system that provides real-time estimates for property renovation projects. It combines MLS data analysis with intelligent fallback calculations to deliver accurate renovation allowance estimates.

## Features

### 🏠 **Core Functionality**

- **Address Geocoding**: Converts property addresses to coordinates using Google Maps API
- **MLS Data Integration**: Fetches property data from Bright MLS via RealtyFeed API
- **Comparable Analysis**: Finds and analyzes nearby renovated and as-is properties
- **Renovation Allowance Calculation**: Uses the Renograte formula: `(ARV × 87%) - CHV`
- **Fallback Calculations**: Provides estimates when MLS data is limited

### 📊 **Calculation Methods**

#### 1. **MLS Data Method** (Primary)

- Finds subject property in MLS database
- Identifies comparable properties within 1-mile radius
- Separates renovated vs. as-is comparables
- Calculates ARV from renovated comparables
- Calculates CHV from as-is comparables

#### 2. **Fallback Method** (Secondary)

- Uses property characteristics and price tiers
- Applies percentage-based renovation allowances
- Incorporates profit margins for ARV calculation
- Ensures estimates are always available

### 🎯 **Price Tier System**

| Price Range | Base Percentage | Max Allowance |
| ----------- | --------------- | ------------- |
| ≤ $300,000  | 16.5%           | $45,000       |
| $300k-$600k | 13.5%           | $75,000       |
| > $600,000  | 11.5%           | $120,000      |

## Technical Implementation

### API Endpoints

#### `/api/estimate-renovation-allowance`

**Method**: POST  
**Purpose**: Calculate renovation allowance for a property

**Request Body**:

```json
{
  "address": "123 Main St, Washington, DC 20002"
}
```

**Response**:

```json
{
  "propertyAddress": "123 Main St, Washington, DC 20002",
  "arv": 850000,
  "chv": 750000,
  "renovationAllowance": 87000,
  "propertyDetails": {
    "listPrice": 750000,
    "livingArea": 2000,
    "bedrooms": 3,
    "bathrooms": 2,
    "yearBuilt": 1985,
    "propertyType": "Residential"
  },
  "comparables": {
    "renovated": [...],
    "asIs": [...]
  },
  "calculationDetails": {
    "arvFormula": "Average of 3 renovated comparable sales",
    "chvFormula": "Average of 2 as-is comparable sales",
    "renovationFormula": "(ARV × 87%) - CHV = ($850,000 × 0.87) - $750,000 = $87,000",
    "calculationMethod": "mls_data"
  }
}
```

### Frontend Components

#### Estimate Page (`/estimate`)

- **Address Input**: Uses Google Places Autocomplete
- **Loading States**: Progress indicators during calculation
- **Lead Capture**: Form to collect user information
- **Results Display**: Comprehensive estimate breakdown
- **Contact Options**: Email and phone contact methods

#### Hero Section Integration

- **Search Input**: Address autocomplete in hero section
- **Navigation**: Routes to estimate page with address parameter
- **Responsive Design**: Mobile-first approach

## Data Flow

### 1. **Address Input**

```
User enters address → Google Places Autocomplete → Address validation
```

### 2. **Geocoding**

```
Address → Google Maps Geocoding API → Latitude/Longitude coordinates
```

### 3. **Property Lookup**

```
Coordinates → RealtyFeed API → Subject property data
```

### 4. **Comparable Analysis**

```
Subject property → MLS search → Comparable properties → ARV/CHV calculation
```

### 5. **Renovation Allowance**

```
ARV & CHV → Renograte formula → Final estimate
```

## Environment Variables

### Required

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

## Error Handling

### Common Error Scenarios

1. **Invalid Address**: Geocoding fails
2. **Property Not Found**: No MLS data available
3. **API Limits**: Rate limiting or quota exceeded
4. **Network Issues**: Connection problems

### Fallback Strategy

- **Geocoding Failure**: Return error with retry suggestion
- **MLS Data Unavailable**: Use fallback calculation method
- **API Errors**: Graceful degradation with user-friendly messages

## Testing

### Test Endpoint

```
GET /api/test-estimator
```

Tests the estimator with a sample address and returns results.

### Manual Testing

1. Navigate to homepage
2. Enter a property address
3. Submit for estimation
4. Complete lead capture form
5. Review results

## Performance Considerations

### Optimization Strategies

- **Caching**: API responses cached where appropriate
- **Lazy Loading**: Components loaded on demand
- **Error Boundaries**: Graceful error handling
- **Progressive Enhancement**: Core functionality works without JavaScript

### API Rate Limits

- **Google Maps**: 2,500 requests/day (free tier)
- **RealtyFeed**: Varies by subscription
- **Implementation**: Request batching and caching

## Security

### Data Protection

- **API Keys**: Server-side only, never exposed to client
- **User Data**: Encrypted in transit and at rest
- **Input Validation**: Address sanitization and validation
- **Rate Limiting**: Prevents abuse and ensures fair usage

## Future Enhancements

### Planned Features

1. **AI-Powered Analysis**: Machine learning for better comparable selection
2. **Historical Data**: Trend analysis and market insights
3. **Customization**: User-specific renovation preferences
4. **Integration**: CRM and lead management systems
5. **Mobile App**: Native mobile application

### Technical Improvements

1. **Real-time Updates**: Live market data integration
2. **Advanced Filtering**: More sophisticated comparable selection
3. **Batch Processing**: Multiple property analysis
4. **Export Options**: PDF reports and data export

## Support

### Documentation

- API documentation available at `/api/docs`
- Component library in `/components`
- Utility functions in `/utils`

### Contact

For technical support or feature requests, contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Maintainer**: Renograte Development Team
