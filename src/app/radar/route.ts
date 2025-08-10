import { NextResponse } from 'next/server'

// Redirect helper route to keep the UI clean and avoid exposing a very long external URL
export async function GET() {
  const target = 'https://www.rainviewer.com/map.html?loc=45.0576,-78.4186,10&oFa=0&oC=0&oU=0&oCS=1&oF=0&oAP=0&rmt=4&c=1&o=83&lm=0&layer=radar&sm=1&sn=1&oP=0'
  return NextResponse.redirect(target, { status: 307 })
}

export const dynamic = 'force-static'

