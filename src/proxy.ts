import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Password-protects the staging site (staging.redstonelake.com).
 *
 * Only active when STAGING_PASSWORD is set, which is only the case on the
 * redstonelake-com-staging Fly app; production never sets it, so this is a
 * pass-through there. Username is "preview".
 */
const PASSWORD = process.env.STAGING_PASSWORD
const USERNAME = 'preview'

// Query parameters no page on this site uses, which Google keeps crawling and
// reports as duplicate pages: old WordPress search, page-ID and REST URLs, and an
// ad plugin's tracking params. (Next.js's `_rsc` param never reaches the proxy;
// see the headers() rule in next.config.js.)
const JUNK_PARAMS = ['s', 'p', 'page_id', 'rest_route', 'sid', 'bsa_pro_id', 'bsa_pro_url', 'replytocom', 'attachment_id', 'directory_type']
const NOT_A_PAGE = /^\/(api|_next|images|documents|brand)\/|^\/(favicon\.ico|icon\.png|apple-icon\.png|robots\.txt|sitemap\.xml)$/

function requireStagingPassword(request: NextRequest): NextResponse | null {
  if (!PASSWORD) return null

  const header = request.headers.get('authorization') || ''
  const [scheme, encoded] = header.split(' ')
  if (scheme === 'Basic' && encoded) {
    const [user, ...rest] = atob(encoded).split(':')
    if (user === USERNAME && rest.join(':') === PASSWORD) return null
  }

  return new NextResponse('Password required to preview this site.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="RALA staging", charset="UTF-8"',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}

/** 301 any page URL carrying junk query parameters to the clean URL, so Google
 * sees one URL per page. */
function stripJunkParams(request: NextRequest): NextResponse | null {
  if (NOT_A_PAGE.test(request.nextUrl.pathname)) return null
  const url = new URL(request.url)
  const strip = JUNK_PARAMS.filter(param => url.searchParams.has(param))
  if (strip.length === 0) return null

  for (const param of strip) url.searchParams.delete(param)
  // Behind Fly the app sees plain http; keep the visitor's scheme so the
  // redirect doesn't add an http hop
  const proto = request.headers.get('x-forwarded-proto')
  if (proto) url.protocol = `${proto.split(',')[0]}:`
  return NextResponse.redirect(url, 301)
}

export function proxy(request: NextRequest) {
  const response = requireStagingPassword(request) ?? stripJunkParams(request) ?? NextResponse.next()
  if (PASSWORD) response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return response
}

export const config = {
  // Fly's health check hits /api/live without credentials
  matcher: ['/((?!api/live|_next/static|_next/image).*)'],
}
