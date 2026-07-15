/**
 * Organization brand toggle.
 *
 * The membership voted at the 2026 AGM to rename the association to the
 * Redstone Area Lakes Association (RALA), but the site stays branded with the
 * legacy name until (a) the charity/non-profit status application clears and
 * (b) members have been formally notified.
 *
 * To switch the whole site to the new name, set NEXT_PUBLIC_BRAND=rala at
 * BUILD time (fly.toml [build.args] for production, .env.local for dev) and
 * redeploy. Unset or any other value = legacy name.
 */
const isRala = process.env.NEXT_PUBLIC_BRAND === 'rala'

export const ORG_NAME = isRala
  ? 'Redstone Area Lakes Association'
  : 'Redstone Lake Cottagers Association'

export const ORG_ACRONYM = isRala ? 'RALA' : 'RLCA'
