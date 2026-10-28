import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Query parameters no page on this site uses, which Google keeps crawling and
// reports as duplicate pages: old WordPress search, page-ID and REST URLs, and an
// ad plugin's tracking params. (Next.js's `_rsc` param never reaches middleware;
// see the headers() rule in next.config.js.)
const JUNK_PARAMS = ['s', 'p', 'page_id', 'rest_route', 'sid', 'bsa_pro_id', 'bsa_pro_url', 'replytocom', 'attachment_id', 'directory_type']

/** 301 any page URL carrying junk query parameters to the clean URL, so Google
 * sees one URL per page. */
export function middleware(request: NextRequest) {
  const url = new URL(request.url)
  const strip = JUNK_PARAMS.filter(param => url.searchParams.has(param))
  if (strip.length === 0) return NextResponse.next()

  for (const param of strip) url.searchParams.delete(param)
  // Behind Fly the app sees plain http; keep the visitor's scheme so the
  // redirect doesn't add an http hop
  const proto = request.headers.get('x-forwarded-proto')
  if (proto) url.protocol = `${proto.split(',')[0]}:`
  return NextResponse.redirect(url, 301)
}

export const config = {
  matcher: ['/((?!api/|_next/|images/|documents/|favicon.ico|icon.svg|robots.txt|sitemap.xml).*)'],
}
