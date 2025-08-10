import { NextRequest, NextResponse } from 'next/server';

// Cache responses for 15 minutes (same policy used by weather)
export const revalidate = 900;

const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=0, s-maxage=900',
};

type CacheEntry = { data: any; ts: number };
const TTL_MS = 15 * 60 * 1000;
const memoryCache: Map<string, CacheEntry> = new Map();

function isFresh(entry?: CacheEntry) {
  return !!entry && Date.now() - entry.ts < TTL_MS;
}

export async function GET(request: NextRequest) {
  try {
    // Get the station ID from query parameters, default to 17 (Redstone Lake)
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('stationId') || '17';
    const lang = searchParams.get('lang') || 'EN';
    const noCache = searchParams.get('noCache') === '1';
    const cacheKey = `${stationId}|${lang}`;
    
    // Serve from in-memory cache if fresh
    if (!noCache) {
      const cached = memoryCache.get(cacheKey);
      if (isFresh(cached)) {
        return NextResponse.json(cached!.data, { headers: { ...CACHE_HEADERS } });
      }
    }
    
    // Make the request to Parks Canada API from our server
    const response = await fetch(
      `https://www.pc.gc.ca/apps/waterlevels/api/Charts/GetWaterLevelData/${stationId}?lang=${lang}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Redstone Lake Website'
        },
        next: { revalidate }
      }
    );

    if (!response.ok) {
      throw new Error(`Parks Canada API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Save to in-memory cache
    memoryCache.set(cacheKey, { data, ts: Date.now() });
    
    // Return the data with cache headers
    return NextResponse.json(data, { headers: { ...CACHE_HEADERS } });
  } catch (error) {
    console.error('Error fetching water level data:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        error: 'Failed to fetch water level data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: { ...CACHE_HEADERS },
      }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 