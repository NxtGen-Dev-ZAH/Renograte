import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const resource = searchParams.get('resource');

    if (!resource) {
      return NextResponse.json({ error: 'Resource parameter is required' }, { status: 400 });
    }

    // Credentials and Configuration
    const clientId = '73tu20hifqq79re29ts38j0upm';
    const clientSecret = '7hai9jfvs9d6vfb1fsmom9hlir6osgn9cfurt7k391e8j16q95e';
    const authenticationUrl = 'https://realtyfeed-sso.auth.us-east-1.amazoncognito.com/oauth2/token';
    const apiUrl = 'https://api.realtyfeed.com/reso/odata/';
    const apiKey = '4u8cqAAmGv1vD6QEfjfMz2odqMLUSp397rMnklb6';
    const allowedOrigin = 'https://www.renograte.com';

    // Authentication
    const formData = new URLSearchParams();
    formData.append('grant_type', 'client_credentials');
    formData.append('client_id', clientId);

    const authResponse = await axios.post(authenticationUrl, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': '*/*',
      },
      auth: {
        username: clientId,
        password: clientSecret,
      },
    });

    if (!authResponse.data.access_token) {
      return NextResponse.json({ error: 'Failed to obtain authentication token' }, { status: 500 });
    }

    const token = authResponse.data.access_token;

    // Prepare API Request
    const [path, queryString] = resource.split('?');
    const params = new URLSearchParams();

    if (queryString) {
      const queryParams = new URLSearchParams(queryString);

      queryParams.forEach((value, key) => {
        if (key.toLowerCase() === '$filter') {
          let processedFilter = value;

          try {
            const formatCoordinate = (value: string | number): string => {
              const numValue = typeof value === 'string' ? parseFloat(value) : value;
              return Number(numValue.toFixed(6)).toString();
            };
            
            // Process coordinates and prices
            const longitudeRegex = /(Longitude\s+(?:eq|ne|gt|lt|ge|le)\s+)(-?\d+\.?\d*)/gi;
            const latitudeRegex = /(Latitude\s+(?:eq|ne|gt|lt|ge|le)\s+)(-?\d+\.?\d*)/gi;
            const listPriceRegex = /(ListPrice\s+(?:eq|ne|gt|lt|ge|le)\s+)([0-9.]+)/gi;

            processedFilter = processedFilter
              .replace(longitudeRegex, (match, operator, numValue) => 
                `${operator}${formatCoordinate(numValue)}`)
              .replace(latitudeRegex, (match, operator, numValue) => 
                `${operator}${formatCoordinate(numValue)}`)
              .replace(listPriceRegex, (match, operator, numValue) => 
                `${operator}${Math.round(parseFloat(numValue))}`);

          } catch (formatError) {
            // Proceed with unformatted value
          }

          params.append(key, processedFilter);
        } else {
          params.append(key, value);
        }
      });
    }

    // Make API Request
    const response = await axios.get(`${apiUrl}${path}?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-api-key': apiKey,
        'Origin': allowedOrigin,
        'Referer': allowedOrigin,
        'Accept': 'application/json'
      },
      timeout: 15000
    });

    // Log the response for debugging
    console.log('RealtyFeed API Response:', {
      status: response.status,
      count: response.data['@odata.count'],
      itemCount: response.data.value?.length,
      firstItem: response.data.value?.[0],
      timestamp: new Date().toISOString(),
      modificationTimestamps: response.data.value?.slice(0, 3).map((item: any) => ({
        listingKey: item.ListingKey,
        modificationTimestamp: item.ModificationTimestamp
      }))
    });

    // Return response with no-cache headers for our API endpoint
    return NextResponse.json(response.data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error: any) {
    // Enhanced error logging
    console.error('RealtyFeed API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        params: error.config?.params,
        headers: {
          ...error.config?.headers,
          'Authorization': '[REDACTED]',
          'x-api-key': '[REDACTED]'
        }
      }
    });

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        {
          error: `Failed to fetch from RealtyFeed: ${error.message}`,
          details: error.response?.data || 'No response data from API',
          status: error.response?.status,
          query: error.config?.url?.split('?')[1] || ''  // Include the query for debugging
        },
        { 
          status: error.response?.status || 500,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    }

    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        details: error.message || 'Unknown error',
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
}