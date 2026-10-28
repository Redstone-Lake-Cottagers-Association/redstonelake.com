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

export function proxy(request: NextRequest) {
  if (!PASSWORD) return NextResponse.next()

  const header = request.headers.get('authorization') || ''
  const [scheme, encoded] = header.split(' ')
  if (scheme === 'Basic' && encoded) {
    const [user, ...rest] = atob(encoded).split(':')
    if (user === USERNAME && rest.join(':') === PASSWORD) {
      const response = NextResponse.next()
      response.headers.set('X-Robots-Tag', 'noindex, nofollow')
      return response
    }
  }

  return new NextResponse('Password required to preview this site.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="RALA staging", charset="UTF-8"',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}

export const config = {
  // Fly's health check hits /api/live without credentials
  matcher: ['/((?!api/live|_next/static|_next/image).*)'],
}
