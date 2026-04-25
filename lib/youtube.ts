/**
 * YouTube Data API v3 client (server-side only).
 * Requires YOUTUBE_API_KEY in environment.
 *
 * Get a key at https://console.cloud.google.com/
 *   → Enable "YouTube Data API v3"
 *   → Credentials → API Key → restrict to YouTube Data API v3
 *
 * Daily quota: 10,000 units  |  search.list = 100 units  |  videos.list = 1 unit
 * Run discovery workflows every 6–12 hours to stay well under quota.
 */

const BASE = 'https://www.googleapis.com/youtube/v3'

function apiKey(): string {
  const k = process.env['YOUTUBE_API_KEY']
  // Validate it's a proper API key (AIzaSy...), not an OAuth Client ID
  if (!k) throw new Error('YOUTUBE_API_KEY not set — get it from console.cloud.google.com → Credentials → API Keys')
  if (k.includes('.apps.googleusercontent.com')) {
    throw new Error('YOUTUBE_API_KEY is set to an OAuth Client ID — set it to a simple API key (AIzaSy...) instead')
  }
  return k
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface YTVideo {
  id:           string
  title:        string
  description:  string
  channelTitle: string
  channelId:    string
  publishedAt:  string
  thumbnail:    string   // maxres > high > default
  viewCount:    number | null
  likeCount:    number | null
  duration:     string | null  // ISO 8601: PT3M42S
  tags:         string[]
  embedUrl:     string   // youtube-nocookie.com/embed/ID
  watchUrl:     string   // youtube.com/watch?v=ID
  isLive:       boolean
}

// ─── Internals ──────────────────────────────────────────────────────────────

async function ytFetch<T>(path: string, params: Record<string,string>): Promise<T> {
  const url = new URL(BASE + path)
  url.searchParams.set('key', apiKey())
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } }
    throw new Error(`YouTube API ${res.status}: ${err.error?.message ?? path}`)
  }
  return res.json() as Promise<T>
}

interface RawItem {
  id?: string | { videoId?: string }
  snippet?: {
    title?: string; description?: string; publishedAt?: string
    channelTitle?: string; channelId?: string
    thumbnails?: { maxres?: {url:string}; high?: {url:string}; default?: {url:string} }
    tags?: string[]
    liveBroadcastContent?: string
  }
  statistics?: { viewCount?: string; likeCount?: string }
  contentDetails?: { duration?: string }
}

function parseVideo(item: RawItem): YTVideo {
  const id  = typeof item.id === 'string' ? item.id : (item.id as any)?.videoId ?? ''
  const sn  = item.snippet ?? {}
  const tn  = sn.thumbnails
  const thumbnail = tn?.maxres?.url ?? tn?.high?.url ?? tn?.default?.url ?? ''
  return {
    id,
    title:        sn.title        ?? '',
    description:  (sn.description ?? '').slice(0, 500),
    channelTitle: sn.channelTitle ?? '',
    channelId:    sn.channelId    ?? '',
    publishedAt:  sn.publishedAt  ?? '',
    thumbnail,
    viewCount:    item.statistics?.viewCount  ? Number(item.statistics.viewCount)  : null,
    likeCount:    item.statistics?.likeCount  ? Number(item.statistics.likeCount)  : null,
    duration:     item.contentDetails?.duration ?? null,
    tags:         sn.tags ?? [],
    embedUrl:     `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
    watchUrl:     `https://www.youtube.com/watch?v=${id}`,
    isLive:       sn.liveBroadcastContent === 'live',
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Trending music videos by country (chart=mostPopular, videoCategoryId=10).
 * Region codes: NG=Nigeria, GH=Ghana, CM=Cameroon, ZA=South Africa, US=USA, GB=UK
 */
export async function getTrendingMusic(regionCode = 'NG', maxResults = 10): Promise<YTVideo[]> {
  const data = await ytFetch<{ items: RawItem[] }>('/videos', {
    part:            'snippet,statistics,contentDetails',
    chart:           'mostPopular',
    videoCategoryId: '10',  // Music
    regionCode,
    maxResults:      String(maxResults),
  })
  return (data.items ?? []).map(parseVideo)
}

/**
 * Search videos — use genre-rich queries like "afrobeats 2026 Nigeria" or "Burna Boy"
 */
export async function searchVideos(query: string, maxResults = 10, regionCode?: string): Promise<YTVideo[]> {
  const params: Record<string,string> = {
    part:       'snippet',
    q:          query,
    type:       'video',
    videoCategoryId: '10',
    maxResults: String(maxResults),
    order:      'relevance',
  }
  if (regionCode) params.regionCode = regionCode

  const search = await ytFetch<{ items: RawItem[] }>('/search', params)
  const ids = search.items?.map(i => typeof i.id === 'object' ? i.id?.videoId : i.id).filter(Boolean) as string[]
  if (!ids.length) return []

  // Enrich with statistics + duration
  return getVideoDetails(ids)
}

/**
 * Get full details + statistics for specific video IDs.
 */
export async function getVideoDetails(videoIds: string[]): Promise<YTVideo[]> {
  if (!videoIds.length) return []
  const data = await ytFetch<{ items: RawItem[] }>('/videos', {
    part: 'snippet,statistics,contentDetails',
    id:   videoIds.join(','),
  })
  return (data.items ?? []).map(parseVideo)
}

/**
 * Get videos from a public playlist.
 */
export async function getPlaylistVideos(playlistId: string, maxResults = 10): Promise<YTVideo[]> {
  const data = await ytFetch<{ items: RawItem[] }>('/playlistItems', {
    part:       'snippet',
    playlistId,
    maxResults: String(maxResults),
  })
  const ids = data.items?.map(i => (i.snippet as any)?.resourceId?.videoId).filter(Boolean) as string[]
  return getVideoDetails(ids)
}

// ─── Format helpers ──────────────────────────────────────────────────────────

/** Format ISO 8601 duration PT3M42S → "3:42" */
export function formatDuration(iso: string | null): string {
  if (!iso) return ''
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return ''
  const h = Number(m[1] ?? 0), min = Number(m[2] ?? 0), s = Number(m[3] ?? 0)
  if (h > 0) return `${h}:${String(min).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  return `${min}:${String(s).padStart(2,'0')}`
}

/** Format large view counts: 1_200_000 → "1.2M" */
export function formatViews(n: number | null): string {
  if (n === null) return ''
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0','') + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace('.0','') + 'K'
  return String(n)
}

// ─── Genre query presets ─────────────────────────────────────────────────────

export const GENRE_QUERIES: Record<string, { q: string; regions: string[] }> = {
  afrobeats:   { q: 'afrobeats 2026',              regions: ['NG', 'GH', 'CM'] },
  afropop:     { q: 'afropop africa official video', regions: ['NG', 'GH', 'ZA'] },
  makossa:     { q: 'makossa cameroon 2026',         regions: ['CM'] },
  bikutsi:     { q: 'bikutsi cameroun 2026',         regions: ['CM'] },
  african_hiphop: { q: 'african hip hop rap 2026',   regions: ['ZA', 'GH', 'NG'] },
  african_rb:  { q: 'african r&b soul 2026',         regions: ['NG', 'ZA', 'GH'] },
  global_collabs: { q: 'afrobeats drake wizkid burna boy collaboration', regions: ['US', 'GB'] },
}

export type Genre = keyof typeof GENRE_QUERIES
