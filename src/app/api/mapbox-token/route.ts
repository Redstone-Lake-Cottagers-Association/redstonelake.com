import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    
    if (!mapboxToken) {
      return NextResponse.json(
        { error: 'Mapbox token not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      token: mapboxToken 
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      }
    });
  } catch (error) {
    console.error('Error fetching Mapbox token:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Mapbox token' },
      { status: 500 }
    );
  }
}
