export const dynamic = 'force-dynamic'

export function GET() {
  return new Response('ok\n', {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
