/**
 * RLCA data-refresh worker.
 *
 * Runs on a Cloudflare Cron Trigger and pings the site's data API routes so
 * their server-side caches stay warm:
 *  - water levels & weather refetch upstream when their 15-minute cache expires
 *  - fire ban is force-refreshed (?force=1) so a new ban shows within one cron
 *    interval instead of the route's 6-hour fallback TTL
 *
 * Visitors always hit a warm cache; nobody waits on Parks Canada / Dysart.
 */

export default {
  async scheduled(event, env, ctx) {
    const base = env.SITE_BASE_URL || 'https://www.redstonelake.com'
    const targets = [
      `${base}/api/water-levels?stationId=17&lang=EN`,
      `${base}/api/weather?type=current`,
      `${base}/api/weather?type=forecast`,
      `${base}/api/fire-ban?force=1`,
    ]

    const results = await Promise.allSettled(
      targets.map(url =>
        fetch(url, { headers: { 'User-Agent': 'RLCA-Data-Refresh-Worker' } })
      )
    )

    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.error(`refresh failed: ${targets[i]}: ${r.reason}`)
      } else if (!r.value.ok) {
        console.error(`refresh non-OK (${r.value.status}): ${targets[i]}`)
      }
    })
  },
}
