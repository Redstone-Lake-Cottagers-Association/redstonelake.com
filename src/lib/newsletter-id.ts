export function labelSlug(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function newsletterId(label: string, url: string, campaignId?: string) {
  if (campaignId && /^[a-zA-Z0-9_-]+$/.test(campaignId)) return `campaign-${campaignId}`

  let hash = 0
  for (let index = 0; index < url.length; index += 1) {
    hash = ((hash << 5) - hash + url.charCodeAt(index)) | 0
  }

  return `${labelSlug(label)}-${Math.abs(hash).toString(36)}`
}
