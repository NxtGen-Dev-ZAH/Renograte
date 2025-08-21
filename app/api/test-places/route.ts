import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Test the new Places API with a simple request
    const response = await fetch(
      'https://places.googleapis.com/v1/places:autocomplete',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.displayName,places.id',
        },
        body: JSON.stringify({
          inputText: '123 Main St',
          languageCode: 'en',
          regionCode: 'US',
        }),
      }
    );

    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response text:', responseText);

    if (!response.ok) {
      return NextResponse.json({
        error: 'Places API error',
        status: response.status,
        statusText: response.statusText,
        response: responseText,
      }, { status: 500 });
    }

    const data = JSON.parse(responseText);
    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error('Test Places API error:', error);
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 