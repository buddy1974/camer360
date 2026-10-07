/**
 * Newsroom API v1 configuration. Read lazily from the environment on every
 * call so that toggling the kill switches needs no code change and tests can
 * flip them per case. Never log or return the secret itself.
 */
export const PUBLICATION = 'camer360'

export interface NewsroomConfig {
  enabled: boolean
  writesEnabled: boolean
  /** null when NEWSROOM_SIGNING_SECRET is missing/blank → 503 API_NOT_CONFIGURED */
  secret: string | null
  /** Telegram ids treated as active `publisher` (owner bootstrap) */
  ownerIds: ReadonlySet<string>
  publication: string
}

export function getNewsroomConfig(): NewsroomConfig {
  const secret = process.env.NEWSROOM_SIGNING_SECRET?.trim() || null
  const ownerIds = new Set(
    (process.env.NEWSROOM_OWNER_TELEGRAM_IDS ?? '')
      .split(',')
      .map(s => s.trim())
      .filter(s => /^\d{1,20}$/.test(s)),
  )
  return {
    enabled: process.env.NEWSROOM_API_ENABLED === 'true',
    writesEnabled: process.env.NEWSROOM_WRITES_ENABLED !== 'false',
    secret,
    ownerIds,
    publication: PUBLICATION,
  }
}

/** Public base URL used for article links (same source as lib/constants SITE_URL). */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.camer360.com').replace(/\/+$/, '')
}
