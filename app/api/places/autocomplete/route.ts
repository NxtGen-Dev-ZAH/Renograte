import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const input = searchParams.get('input');
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    console.log('API Key:', apiKey ? 'Present' : 'Missing');
    console.log('Input:', input);

    if (!input) {
      return NextResponse.json({ error: 'Input parameter is required' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'Google Maps API key is not configured' }, { status: 500 });
    }

    const requestBody = {
      input: input.trim(),
      includedPrimaryTypes: ["street_address", "route", "premise", "subpremise", "establishment"],
      includedRegionCodes: ["us"],
      languageCode: "en",
    };

    console.log('Request Body:', requestBody);

    const referrer = process.env.NODE_ENV === 'production' ? 'https://renograte.com' : 'http://localhost:3000';

    const response = await fetch(
      'https://places.googleapis.com/v1/places:autocomplete',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'Referer': referrer, // Add Referer header
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log('Google API Response Status:', response.status);

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
    console.log('Google API Response Data:', JSON.stringify(data, null, 2));

    const transformedPredictions = data.suggestions?.map((suggestion: any) => {
      if (suggestion.placePrediction) {
        return {
          place_id: suggestion.placePrediction.placeId,
          description: suggestion.placePrediction.text?.text || '',
          structured_formatting: {
            main_text: suggestion.placePrediction.text?.primaryText || '',
            secondary_text: suggestion.placePrediction.text?.secondaryText || '',
          },
        };
      }
      return null;
    }).filter(Boolean) || [];

    return NextResponse.json({ status: 'OK', predictions: transformedPredictions });

  } catch (error) {
    console.error('Error in autocomplete API:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: 'Failed to fetch autocomplete predictions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}