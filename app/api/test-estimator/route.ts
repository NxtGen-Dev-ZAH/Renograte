import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const testAddress = searchParams.get('address') || '2312 Longwood Ave, Baltimore, MD 21216';
    
    console.log('Testing estimator with address:', testAddress);
    
    // Test the estimator endpoint
    const estimatorResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/estimate-renovation-allowance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address: testAddress }),
    });
    
    if (!estimatorResponse.ok) {
      const errorText = await estimatorResponse.text();
      return NextResponse.json({
        error: 'Estimator test failed',
        status: estimatorResponse.status,
        details: errorText
      }, { status: 500 });
    }
    
    const estimatorResult = await estimatorResponse.json();
    
    // Test direct RealtyFeed API queries with multiple strategies
    const testQueries = [
      // Baltimore tests
      {
        name: 'Baltimore - Exact Address Search',
        query: `Property?$filter=StreetNumber eq '2312' and contains(StreetName,'Longwood') and City eq 'Baltimore' and StateOrProvince eq 'MD' and StandardStatus eq 'Active'&$select=ListingKey,StandardStatus,PropertyType,ListPrice,StreetNumber,StreetName,City,StateOrProvince,PostalCode&$top=5`
      },
      {
        name: 'Baltimore - Coordinate Search (0.01 degrees)',
        query: `Property?$filter=geo.distance(Coordinates, POINT(-76.6689 39.2904)) lt 0.01d and StandardStatus eq 'Active'&$select=ListingKey,StandardStatus,PropertyType,ListPrice,StreetNumber,StreetName,City,StateOrProvince,PostalCode,Latitude,Longitude&$top=5`
      },
      {
        name: 'Baltimore - Sold Properties Search',
        query: `Property?$filter=geo.distance(Coordinates, POINT(-76.6689 39.2904)) lt 0.016d and StandardStatus eq 'Sold'&$select=ListingKey,StandardStatus,PropertyType,ListPrice,LivingArea,BedroomsTotal,BathroomsTotalInteger,YearBuilt,Latitude,Longitude&$top=10`
      },
      // Philadelphia tests - using proven working queries
      {
        name: 'Philadelphia - Exact Address Search',
        query: `Property?$filter=StreetNumber eq '1425' and contains(StreetName,'Locust') and City eq 'Philadelphia' and StateOrProvince eq 'PA' and StandardStatus eq 'Active'&$select=ListingKey,StandardStatus,PropertyType,ListPrice,StreetNumber,StreetName,City,StateOrProvince,PostalCode&$top=5`
      },
      {
        name: 'Philadelphia - City-Based Active (like nearby properties)',
        query: `Property?$filter=City eq 'Philadelphia' and StandardStatus eq 'Active'&$select=ListingKey,StandardStatus,PropertyType,ListPrice,StreetNumber,StreetName,City,StateOrProvince,PostalCode,BedroomsTotal,BathroomsTotalInteger,LivingArea,Latitude,Longitude&$top=10`
      },
      {
        name: 'Philadelphia - City-Based Active with Price Range',
        query: `Property?$filter=City eq 'Philadelphia' and StandardStatus eq 'Active' and ListPrice ge 300000 and ListPrice le 600000&$select=ListingKey,StandardStatus,PropertyType,ListPrice,StreetNumber,StreetName,City,StateOrProvince,PostalCode,BedroomsTotal,BathroomsTotalInteger,LivingArea,Latitude,Longitude&$top=10`
      },
      {
        name: 'Philadelphia - State-Based Active',
        query: `Property?$filter=StateOrProvince eq 'PA' and StandardStatus eq 'Active'&$select=ListingKey,StandardStatus,PropertyType,ListPrice,StreetNumber,StreetName,City,StateOrProvince,PostalCode,BedroomsTotal,BathroomsTotalInteger,LivingArea,Latitude,Longitude&$top=10`
      },
      {
        name: 'Philadelphia - Any Status (no StandardStatus filter)',
        query: `Property?$filter=City eq 'Philadelphia'&$select=ListingKey,StandardStatus,PropertyType,ListPrice,StreetNumber,StreetName,City,StateOrProvince,PostalCode,BedroomsTotal,BathroomsTotalInteger,LivingArea,Latitude,Longitude&$top=10`
      },
      {
        name: 'Philadelphia - All Properties (no filters)',
        query: `Property?$select=ListingKey,StandardStatus,PropertyType,ListPrice,StreetNumber,StreetName,City,StateOrProvince,PostalCode,BedroomsTotal,BathroomsTotalInteger,LivingArea,Latitude,Longitude&$top=10`
      },
      // General MLS coverage tests
      {
        name: 'General - Active Properties in PA',
        query: `Property?$filter=StateOrProvince eq 'PA' and StandardStatus eq 'Active'&$select=ListingKey,StandardStatus,PropertyType,ListPrice,StreetNumber,StreetName,City,StateOrProvince,PostalCode&$top=5`
      },
      {
        name: 'General - Active Properties in MD',
        query: `Property?$filter=StateOrProvince eq 'MD' and StandardStatus eq 'Active'&$select=ListingKey,StandardStatus,PropertyType,ListPrice,StreetNumber,StreetName,City,StateOrProvince,PostalCode&$top=5`
      },
      {
        name: 'General - Sold Properties in PA',
        query: `Property?$filter=StateOrProvince eq 'PA' and StandardStatus eq 'Sold'&$select=ListingKey,StandardStatus,PropertyType,ListPrice,LivingArea,BedroomsTotal,BathroomsTotalInteger,YearBuilt,Latitude,Longitude&$top=5`
      }
    ];
    
    const testResults = [];
    
    for (const testQuery of testQueries) {
      try {
        const params = new URLSearchParams();
        params.append('resource', testQuery.query);
        const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/realtyfeed?${params.toString()}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        testResults.push({
          name: testQuery.name,
          query: testQuery.query,
          status: response.status,
          success: response.ok,
          resultCount: data.value ? data.value.length : 0,
          hasError: !!data.error,
          error: data.error || null,
          sampleData: data.value ? data.value.slice(0, 2) : null
        });
      } catch (error) {
        testResults.push({
          name: testQuery.name,
          query: testQuery.query,
          status: 'ERROR',
          success: false,
          resultCount: 0,
          hasError: true,
          error: error instanceof Error ? error.message : 'Unknown error',
          sampleData: null
        });
      }
    }
    
    return NextResponse.json({
      testAddress,
      estimatorResult,
      apiTests: testResults,
      summary: {
        totalTests: testResults.length,
        successfulTests: testResults.filter(t => t.success).length,
        failedTests: testResults.filter(t => !t.success).length,
        totalPropertiesFound: testResults.reduce((sum, t) => sum + t.resultCount, 0)
      }
    });
    
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
