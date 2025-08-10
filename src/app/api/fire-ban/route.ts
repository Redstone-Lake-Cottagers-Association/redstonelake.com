import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 21600; // 6 hours

interface FireBanAlert {
  title: string;
  description: string;
  color: string;
}

interface DysartFireBanResponse {
  source: 'Dysart et al';
  sourceUrl: string;
  alerts: FireBanAlert[];
  hasActiveBan: boolean;

  cachedAt?: string; // ISO time when this response was cached server-side
  cacheTtlSeconds?: number; // TTL for cache freshness checks
  aiAnalysis?: {
    hasFireBan: boolean;
    banType?: 'total' | 'restricted' | 'none';
    effectiveFrom?: string;
    effectiveTo?: string;
    summary?: string;
    confidence?: number; // 0..1
  };
  summary: {
    status: 'active' | 'none' | 'error';
    primaryAlert?: FireBanAlert;
    lastUpdated: string;
  };
  debugInfo?: {
    requestUrl?: string;
  };
}

// In-memory cache (best-effort; also use Next revalidate above)
let cachedResult: DysartFireBanResponse | null = null;
let cachedAtMs = 0;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

async function analyzeWithClaude(
  alerts: FireBanAlert[],
  sourceUrl: string,
  debug: boolean,
  debugMessages: string[]
): Promise<DysartFireBanResponse['aiAnalysis'] | undefined> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const model = process.env.ANTHROPIC_MODEL || 'claude-3-7-sonnet-20250219';
    if (!apiKey) {
      if (debug) debugMessages.push('AI disabled: ANTHROPIC_API_KEY not set');
      return undefined;
    }

    const text = alerts.map((a, i) => `# Alert ${i + 1}\nTitle: ${a.title}\nColor: ${a.color}\nDescription: ${a.description}`).join('\n\n');
    const system = 'You extract structured fire-ban policy from municipal alerts. Respond with strict JSON only, no prose.';
    const userPrompt = `From the following alerts from Dysart et al, determine if a fire ban is currently in effect. Classify ban type strictly as one of: "total", "restricted", or "none". Include effective dates if present. Return strict JSON with keys: hasFireBan (boolean), banType ("total"|"restricted"|"none"), effectiveFrom (ISO 8601 string or null), effectiveTo (ISO 8601 string or null), summary (string, one sentence), confidence (0..1).\n\nRules:\n- If no ban is in effect, set hasFireBan=false and banType="none".\n- If partial restrictions (e.g., time-of-day, specific activities) are in effect, use banType="restricted".\n- If all open flames/outdoor burning are prohibited, use banType="total".\n\nSource URL: ${sourceUrl}\n\nAlerts:\n${text}`;

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: 400,
        temperature: 0,
        system,
        messages: [
          { role: 'user', content: [ { type: 'text', text: userPrompt } ] }
        ]
      })
    });

    if (!resp.ok) {
      if (debug) {
        const errText = await resp.text();
        console.error('[fire-ban] Anthropic error:', resp.status, errText);
        debugMessages.push(`Anthropic error ${resp.status}: ${errText.slice(0, 300)}`);
      }
      return undefined;
    }
    const data = await resp.json();
    const content = Array.isArray(data?.content) ? data.content.find((c: any) => c?.type === 'text')?.text : undefined;
    if (!content) {
      if (debug) debugMessages.push('Anthropic response has no text content');
      return undefined;
    }
    // Attempt to parse JSON from model response
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      if (debug) debugMessages.push('Failed to locate JSON block in AI response');
      return undefined;
    }
    const parsed = JSON.parse(content.slice(jsonStart, jsonEnd + 1));

    // Normalize outputs
    const parsedBanType = typeof parsed.banType === 'string' ? parsed.banType.toLowerCase() : undefined;
    const normalizedBanType = parsedBanType === 'total' || parsedBanType === 'restricted' || parsedBanType === 'none' ? parsedBanType : undefined;
    const normalizedHasBan = typeof parsed.hasFireBan === 'boolean' ? parsed.hasFireBan : (normalizedBanType ? normalizedBanType !== 'none' : undefined);

    return {
      hasFireBan: Boolean(normalizedHasBan),
      banType: normalizedBanType,
      effectiveFrom: parsed.effectiveFrom || undefined,
      effectiveTo: parsed.effectiveTo || undefined,
      summary: typeof parsed.summary === 'string' ? parsed.summary : undefined,
      confidence: typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : undefined
    };
  } catch (e: any) {
    if (debug) debugMessages.push(`AI exception: ${(e && e.message) || 'unknown'}`);
    return undefined;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const debug = searchParams.get('debug') === '1';
    const force = searchParams.get('force') === '1' || debug;
    const testMode = searchParams.get('test'); // 'none', 'restricted', 'total'

    // Serve from cache if valid (but skip cache for test mode to allow immediate UI testing)
    const now = Date.now();
    if (!force && !testMode && cachedResult && (now - cachedAtMs) < CACHE_TTL_MS) {
      return NextResponse.json(cachedResult, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'public, max-age=0, s-maxage=21600'
        },
      });
    }

    const results: DysartFireBanResponse = {
      source: 'Dysart et al',
      sourceUrl: 'https://www.dysartetal.ca//modules/NewsModule/services/getalertbannerfeeds.ashx',
      alerts: [],
      hasActiveBan: false,
      summary: {
        status: 'none',
        lastUpdated: new Date().toISOString()
      }
    };
    const aiDebugMessages: string[] = debug ? [] : [];

    // Test mode for UI development
    if (testMode) {
      if (testMode === 'none') {
        results.alerts = [];
        results.hasActiveBan = false;
        results.summary.status = 'none';
        results.aiAnalysis = {
          hasFireBan: false,
          banType: 'none',
          summary: 'No fire ban is currently in effect.',
          confidence: 0.98
        };
      } else if (testMode === 'restricted') {
        results.alerts = [{
          title: 'Restricted Fire Zone in Effect',
          description: 'A restricted fire zone is in effect. Open air burning is prohibited between 8:00 AM and 8:00 PM. Small cooking fires and properly contained campfires are permitted during evening hours with proper safety precautions.',
          color: 'Orange'
        }];
        results.hasActiveBan = true;
        results.summary.status = 'active';
        results.summary.primaryAlert = results.alerts[0];
        results.aiAnalysis = {
          hasFireBan: true,
          banType: 'restricted',
          effectiveFrom: new Date().toISOString(),
          summary: 'Restricted fire zone with time-based burning restrictions from 8 AM to 8 PM.',
          confidence: 0.92
        };
      } else if (testMode === 'total') {
        results.alerts = [{
          title: 'Total Fire Ban in Haliburton County: Effective Immediately',
          description: 'A total fire ban is in effect throughout Haliburton County. This means no outdoor burning any time of day or night. Bonfires, fireworks, torches and the lighting of charcoal barbecues, as well as any other light sources that use an open flame, are prohibited.',
          color: 'Red'
        }];
        results.hasActiveBan = true;
        results.summary.status = 'active';
        results.summary.primaryAlert = results.alerts[0];
        results.aiAnalysis = {
          hasFireBan: true,
          banType: 'total',
          effectiveFrom: new Date().toISOString(),
          summary: 'Total fire ban prohibiting all outdoor burning and open flames.',
          confidence: 0.99
        };
      }
      
      // Skip real data fetching in test mode
      results.cachedAt = new Date().toISOString();
      results.cacheTtlSeconds = 21600;
      
      if (debug) {
        aiDebugMessages.push(`Test mode: ${testMode}`);
        (results as any).aiDebug = aiDebugMessages;
      }

      return NextResponse.json(results, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'public, max-age=0, s-maxage=21600'
        },
      });
    }

    // Helper: fetch with timeout to avoid hanging requests
    const fetchWithTimeout = async (url: string, init: RequestInit = {}, timeoutMs = 12000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const resp = await fetch(url, { ...init, signal: controller.signal });
        return resp;
      } finally {
        clearTimeout(id);
      }
    };

    // Fetch fire ban data from Dysart et al (official municipal source)
    try {
      const municipalResponse = await fetchWithTimeout(
        results.sourceUrl,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Redstone Lake Website'
          }
        },
        10000
      );

      if (municipalResponse.ok) {
        const municipalData: FireBanAlert[] = await municipalResponse.json();
        results.alerts = Array.isArray(municipalData) ? municipalData : [];
        if (debug) {
          console.log('[fire-ban] dysart alerts count:', results.alerts.length);
          results.debugInfo = results.debugInfo || {};
          results.debugInfo.requestUrl = results.sourceUrl;
        }

        // AI analysis (required)
        const ai = await analyzeWithClaude(results.alerts, results.sourceUrl, debug, aiDebugMessages);
        if (ai) {
          results.aiAnalysis = ai;
          if (typeof ai.hasFireBan === 'boolean') {
            results.hasActiveBan = ai.hasFireBan;
            results.summary.status = ai.hasFireBan ? 'active' : 'none';

          }
          if (!results.summary.primaryAlert && results.alerts.length > 0) {
            results.summary.primaryAlert = results.alerts[0];
          }
        } else {
          // AI unavailable - cannot determine fire ban status
          results.hasActiveBan = false;
          results.summary.status = 'error';
          if (debug) {
            aiDebugMessages.push('AI analysis required but unavailable - cannot determine fire ban status');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching Dysart fire ban data:', error);
    }

    
    // Return comprehensive data with proper CORS headers
    // Attach AI debug messages when requested
    if (debug && aiDebugMessages.length > 0) {
      (results as any).aiDebug = aiDebugMessages;
    }

    // Update cache (only for real API calls, not test mode)
    // Stamp cache metadata
    results.cachedAt = new Date().toISOString();
    results.cacheTtlSeconds = 21600;

    if (!testMode) {
      cachedResult = results;
      cachedAtMs = Date.now();
    }



    return NextResponse.json(results, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=0, s-maxage=21600'
      },
    });
  } catch (error) {
    console.error('Error fetching fire ban data:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        error: 'Failed to fetch fire ban data',
        message: error instanceof Error ? error.message : 'Unknown error',
        summary: {
          status: 'error',
          lastUpdated: new Date().toISOString()
        }
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
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


