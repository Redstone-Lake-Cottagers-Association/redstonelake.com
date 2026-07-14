# Cloudflare setup

## Data-refresh cron (`data-refresh-worker/`)

The site's data widgets (water levels, weather, fire ban) only fetch when a
visitor loads a page, and the API routes cache upstream responses in server
memory (water/weather: 15 min, fire ban: 6 h fallback). This worker runs on a
Cloudflare Cron Trigger every 15 minutes and pings those routes so:

- the caches are always warm (no visitor waits on Parks Canada / Dysart et al)
- the fire ban is force-refreshed each run, so a newly declared ban appears
  within ~15 minutes instead of up to 6 hours

Deploy:

```bash
cd cloudflare/data-refresh-worker
# set SITE_BASE_URL in wrangler.toml to the app's current URL first
npx wrangler deploy
```

Check runs under Cloudflare Dashboard → Workers → rlca-data-refresh → Logs.

## Recommended cache rule (optional)

If Cloudflare proxies the site, add a Cache Rule for `/api/*` with
"Respect origin cache headers". The routes already send
`Cache-Control: s-maxage=900` (water/weather) and `s-maxage=21600` (fire ban),
so the edge will absorb traffic and survive app restarts (the in-memory cache
is per-instance and empties on redeploy).
