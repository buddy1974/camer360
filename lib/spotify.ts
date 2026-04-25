/**
 * Spotify Web API — Client Credentials flow (server-side only).
 * Requires SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET in environment.
 *
 * Add to Vercel dashboard:
 *   SPOTIFY_CLIENT_ID  — from https://developer.spotify.com/dashboard
 *   SPOTIFY_CLIENT_SECRET
 */

export interface SpotifyTrack {
  id:         string
  name:       string
  artists:    { id: string; name: string }[]
  album: {
    id:         string
    name:       string
    images:     { url: string; width: number; height: number }[]
    release_date: string
  }
  preview_url:     string | null
  external_urls:   { spotify: string }
  duration_ms:     number
  popularity:      number
}

export interface SpotifyPlaylistTrack {
  track: SpotifyTrack
  added_at: string
}

// ─── Token cache ────────────────────────────────────────────────────────────

let _token:   string | null = null
let _tokenEx: number        = 0

async function getToken(): Promise<string> {
  if (_token && Date.now() < _tokenEx) return _token

  const id     = process.env['SPOTIFY_CLIENT_ID']
  const secret = process.env['SPOTIFY_CLIENT_SECRET']

  if (!id || !secret) {
    throw new Error('SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET not configured')
  }

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method:  'POST',
    headers: {
      Authorization:  'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })

  if (!res.ok) throw new Error(`Spotify token error: ${res.status}`)
  const data = await res.json() as { access_token: string; expires_in: number }
  _token   = data.access_token
  _tokenEx = Date.now() + (data.expires_in - 60) * 1000
  return _token
}

async function spotifyGet<T>(path: string): Promise<T> {
  const token = await getToken()
  const res   = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    next:    { revalidate: 3600 }, // Cache for 1 hour
  })
  if (!res.ok) throw new Error(`Spotify API error ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

// ─── Public helpers ─────────────────────────────────────────────────────────

/** Get tracks from a playlist */
export async function getPlaylistTracks(playlistId: string, limit = 20): Promise<SpotifyTrack[]> {
  const data = await spotifyGet<{ items: SpotifyPlaylistTrack[] }>(
    `/playlists/${playlistId}/tracks?limit=${limit}&fields=items(track(id,name,artists,album,preview_url,external_urls,duration_ms,popularity))`
  )
  return data.items.map(i => i.track).filter(Boolean)
}

/** Search tracks — good for "Afrobeats Cameroon 2026" style queries */
export async function searchTracks(query: string, limit = 10): Promise<SpotifyTrack[]> {
  const data = await spotifyGet<{ tracks: { items: SpotifyTrack[] } }>(
    `/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&market=CM`
  )
  return data.tracks?.items ?? []
}

/** Get a single track by ID */
export async function getTrack(id: string): Promise<SpotifyTrack> {
  return spotifyGet<SpotifyTrack>(`/tracks/${id}`)
}

/** Format ms → m:ss */
export function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/**
 * Well-known Spotify playlist IDs for Africa/Afrobeats.
 * These are Spotify's own editorial playlists — always up to date.
 */
export const SPOTIFY_PLAYLISTS = {
  AFRICAN_HEAT:          '37i9dQZF1DWYkaDif7Ztbp',
  AFROBEATS:             '37i9dQZF1DWYiR2Uqcon0X',
  AFRO_PARTY_ANTHEMS:    '37i9dQZF1DWYmnD6RNZB8Y',
  NAIJA_HITS:            '37i9dQZF1DWYlNKpFtIjv6',
  AFRO_ROMANCE:          '37i9dQZF1DX2iGB45oTUoU',
  CAMEROON_TOP_HITS:     '37i9dQZF1DXar2hLF2yfqZ', // may vary
} as const
