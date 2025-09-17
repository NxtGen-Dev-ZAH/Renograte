import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Token cache with expiration tracking
interface TokenCache {
  token: string;
  expiry: number; // Unix timestamp
}

let tokenCache: TokenCache | null = null;
const TOKEN_BUFFER = 60 * 1000; // 1 minute buffer before expiry

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    let resource = searchParams.get('resource');
    const postalCode = searchParams.get('postalCode'); // ✅ NEW

    // ✅ If no resource is given but postalCode exists, build the resource automatically
    if (!resource && postalCode) {
      resource = `Property?$filter=PostalCode eq '${postalCode}'`;
    }

    if (!resource) {
      return NextResponse.json(
        { error: 'Either resource or postalCode parameter is required' },
        { status: 400 }
      );
    }

    // Get credentials from environment variables
    const clientId = process.env.REALTYFEED_CLIENT_ID;
    const clientSecret = process.env.REALTYFEED_CLIENT_SECRET;
    const authenticationUrl = process.env.REALTYFEED_AUTH_URL || 'https://api.realtyfeed.com/v1/auth/token';
    const apiUrl = process.env.REALTYFEED_API_URL || 'https://api.realtyfeed.com/reso/odata/';
    const apiKey = process.env.REALTYFEED_API_KEY;
    const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || 'https://www.renograte.com';

    // Validate required credentials
    if (!clientId || !clientSecret || !apiKey) {
      console.error('Missing RealtyFeed API credentials');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Use cached token if available and not expired
    const now = Date.now();
    let token: string;
    
    if (tokenCache && tokenCache.expiry > now + TOKEN_BUFFER) {
      token = tokenCache.token;
    } else {
      // Authentication
      const formData = new URLSearchParams();
      formData.append('grant_type', 'client_credentials');
      formData.append('client_id', clientId);
      formData.append('client_secret', clientSecret);

      const authResponse = await axios.post(authenticationUrl, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': '*/*',
          'Accept-Encoding': 'gzip, deflate, br'
        }
      });

      if (!authResponse.data.access_token) {
        return NextResponse.json({ error: 'Failed to obtain authentication token' }, { status: 500 });
      }

      token = authResponse.data.access_token;
      
      // Cache the token with expiry time (default to 1 hour if not specified)
      const expiresIn = authResponse.data.expires_in || 3600;
      tokenCache = {
        token,
        expiry: now + (expiresIn * 1000)
      };
    }

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

    // Make API Request with timeout and retry logic
    const makeRequest = async (retries = 2): Promise<{ status: number; data: Record<string, unknown> }> => {
      try {
        return await axios.get(`${apiUrl}${path}?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-api-key': apiKey,
            'Origin': allowedOrigin,
            'Referer': allowedOrigin,
            'Accept': 'application/json'
          },
          timeout: 10000 // Reduced timeout to 10s for faster error responses
        });
      } catch (error: unknown) {
        // If token expired (401), invalidate cache and retry once
        if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status === 401 && tokenCache && retries > 0) {
          tokenCache = null; // Force new token acquisition
          return makeRequest(retries - 1); 
        }
        throw error;
      }
    };
    
    const response = await makeRequest();

    // Only log minimal info in production
    if (process.env.NODE_ENV !== 'production') {
      const data = response.data as Record<string, unknown>;
      // console.log('RealtyFeed API Response:', {
      //   status: response.status,
      //   count: data['@odata.count'],
      //   itemCount: Array.isArray(data.value) ? data.value.length : 0,
      //   timestamp: new Date().toISOString()
      // });
    }

    // Return response with no-cache headers for our API endpoint
    return NextResponse.json(response.data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error: unknown) {
    // Enhanced error logging - with sensitive data redaction
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStatus = error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response ? error.response.status : undefined;
    const errorConfig = error && typeof error === 'object' && 'config' in error && error.config && typeof error.config === 'object' && 'url' in error.config && error.config.url ? new URL(error.config.url as string).pathname : undefined;
    
    console.error('RealtyFeed API Error:', {
      message: errorMessage,
      status: errorStatus,
      config: {
        url: errorConfig,
        // Don't log query parameters which might contain sensitive info
      }
    });

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        {
          error: `Failed to fetch from RealtyFeed: ${error.message}`,
          status: error.response?.status
          // Don't include details or query in response
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
        // Don't include error details in production
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
