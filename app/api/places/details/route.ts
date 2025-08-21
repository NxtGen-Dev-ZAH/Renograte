import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('place_id');
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!placeId) {
      return NextResponse.json({ error: 'Place ID parameter is required' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'Google Maps API key is not configured' }, { status: 500 });
    }

    const referrer = process.env.NODE_ENV === 'production' ? 'https://renograte.com' : 'http://localhost:3000';

    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?languageCode=en`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'id,formattedAddress,location,addressComponents',
          'Referer': referrer, // Add Referer header
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Places API error:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });
      throw new Error(`Google Places API failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    const transformedData = {
      status: 'OK',
      result: {
        place_id: data.id || '',
        formatted_address: data.formattedAddress || '',
        geometry: {
          location: data.location || {},
        },
        address_components: data.addressComponents || [],
      },
    };
    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('Error in place details API:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: 'Failed to fetch place details',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}