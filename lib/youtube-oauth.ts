/**
 * YouTube OAuth 2.0 client for write operations (Community Posts, channel management).
 *
 * Credential chain:
 *   YOUTUBE_CLIENT_ID + YOUTUBE_CLIENT_SECRET = OAuth app identity
 *   YOUTUBE_REFRESH_TOKEN                     = One-time user authorization
 *
 * Get YOUTUBE_REFRESH_TOKEN:
 *   1. Visit https://www.camer360.com/admin/youtube
 *   2. Click "Connect YouTube Channel"
 *   3. Authorize with your Google account
 *   4. Copy the refresh token shown and add to Vercel env vars
 *
 * IMPORTANT: YouTube API does NOT support Client Credentials flow (unlike Spotify).
 * User authorization is required once to get the refresh token.
 */

const TOKEN_URL     = 'https://oauth2.googleapis.com/token'
const CHANNELS_URL  = 'https://www.googleapis.com/youtube/v3/channels'
const ACTIVITIES_URL = 'https://www.googleapis.com/youtube/v3/activities'

export const OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/youtube.upload',
].join(' ')

// ─── Token cache ─────────────────────────────────────────────────────────────

let _cachedToken:   string | null = null
let _tokenExpiry:   number        = 0

export function youtubeOAuthConfigured(): boolean {
  return !!(
    process.env['YOUTUBE_CLIENT_ID'] &&
    process.env['YOUTUBE_CLIENT_SECRET'] &&
    process.env['YOUTUBE_REFRESH_TOKEN']
  )
}

/** Exchange refresh token → short-lived access token (cached for 55 min) */
export async function getAccessToken(): Promise<string> {
  if (_cachedToken && Date.now() < _tokenExpiry) return _cachedToken

  const clientId     = process.env['YOUTUBE_CLIENT_ID']
  const clientSecret = process.env['YOUTUBE_CLIENT_SECRET']
  const refreshToken = process.env['YOUTUBE_REFRESH_TOKEN']

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('YouTube OAuth not fully configured — YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, and YOUTUBE_REFRESH_TOKEN all required')
  }

  const res = await fetch(TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      client_id:     clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type:    'refresh_token',
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string; error_description?: string }
    throw new Error(`YouTube token refresh failed: ${err.error_description ?? err.error ?? res.status}`)
  }

  const data = await res.json() as { access_token: string; expires_in: number }
  _cachedToken = data.access_token
  _tokenExpiry = Date.now() + (data.expires_in - 60) * 1000
  return _cachedToken
}

/** Build Authorization URL for the one-time OAuth consent flow */
export function buildAuthUrl(redirectUri: string, state?: string): string {
  const clientId = process.env['YOUTUBE_CLIENT_ID']
  if (!clientId) throw new Error('YOUTUBE_CLIENT_ID not configured')

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         OAUTH_SCOPES,
    access_type:   'offline',
    prompt:        'consent',   // force refresh_token to be returned
    ...(state ? { state } : {}),
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

/** Exchange authorization code for tokens (call once after OAuth consent) */
export async function exchangeCode(code: string, redirectUri: string): Promise<{ accessToken: string; refreshToken: string }> {
  const clientId     = process.env['YOUTUBE_CLIENT_ID']!
  const clientSecret = process.env['YOUTUBE_CLIENT_SECRET']!

  const res = await fetch(TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      code, client_id: clientId, client_secret: clientSecret,
      redirect_uri: redirectUri, grant_type: 'authorization_code',
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error_description?: string }
    throw new Error(`Token exchange failed: ${err.error_description ?? res.status}`)
  }

  const data = await res.json() as { access_token: string; refresh_token?: string }
  if (!data.refresh_token) throw new Error('No refresh_token returned — re-authorize with prompt=consent')
  return { accessToken: data.access_token, refreshToken: data.refresh_token }
}

// ─── Channel operations ───────────────────────────────────────────────────────

export interface YTChannel {
  id:          string
  title:       string
  description: string
  thumbnail:   string
  subscriberCount: number | null
  videoCount:  number | null
  viewCount:   number | null
  customUrl:   string
}

/** Get authenticated channel info */
export async function getMyChannel(): Promise<YTChannel> {
  const token = await getAccessToken()
  const res   = await fetch(`${CHANNELS_URL}?part=snippet,statistics&mine=true`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Channel fetch failed: ${res.status}`)
  const data = await res.json() as { items?: any[] }
  const ch   = data.items?.[0]
  if (!ch) throw new Error('No channel found for authorized account')
  const sn = ch.snippet ?? {}
  const st = ch.statistics ?? {}
  return {
    id:              ch.id,
    title:           sn.title ?? '',
    description:     sn.description ?? '',
    thumbnail:       sn.thumbnails?.default?.url ?? '',
    subscriberCount: st.subscriberCount ? Number(st.subscriberCount) : null,
    videoCount:      st.videoCount      ? Number(st.videoCount)      : null,
    viewCount:       st.viewCount       ? Number(st.viewCount)       : null,
    customUrl:       sn.customUrl ?? '',
  }
}

// ─── Community Posts ─────────────────────────────────────────────────────────
// NOTE: Community Posts require a channel with Community tab enabled (500+ subs
// or YouTube's eligibility criteria). Uses the undocumented but functional
// youtube.v3/posts endpoint that mirrors the YouTube Studio API.

export interface CommunityPostResult {
  id:        string
  url:       string
  published: boolean
}

/**
 * Create a YouTube Community Post (text + optional image link).
 * The post appears in subscribers' YouTube feed exactly like a Facebook post.
 */
export async function createCommunityPost(opts: {
  text:      string
  imageUrl?: string
}): Promise<CommunityPostResult> {
  const token     = await getAccessToken()
  const channelId = process.env['YOUTUBE_CHANNEL_ID']
  if (!channelId) throw new Error('YOUTUBE_CHANNEL_ID not configured')

  const body: Record<string, any> = {
    snippet: {
      type:                'textPost',
      textOriginalPost:    { text: opts.text },
      authorChannelId:     { value: channelId },
    },
  }

  // Community posts with images use the imagePost type
  if (opts.imageUrl) {
    body.snippet.type = 'imagePost'
    body.snippet.imagePost = {
      images: [{ imageUrl: opts.imageUrl, displayAspectRatio: 'LANDSCAPE' }],
    }
    // Also include text if imagePost
    body.snippet.textOriginalPost = { text: opts.text }
  }

  const res = await fetch(
    'https://www.googleapis.com/youtube/v3/posts?part=snippet',
    {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } }
    throw new Error(`Community Post failed: ${err.error?.message ?? res.status}`)
  }

  const data = await res.json() as { id?: string }
  const postId = data.id ?? ''
  return {
    id:        postId,
    url:       `https://www.youtube.com/post/${postId}`,
    published: !!postId,
  }
}
