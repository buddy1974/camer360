import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { articles } from '@/lib/db/schema'
import { like, or } from 'drizzle-orm'
import {
  getTrendingMusic, searchVideos, getPlaylistVideos,
  GENRE_QUERIES, type Genre, type YTVideo,
} from '@/lib/youtube'

function authCheck(req: NextRequest) {
  return req.headers.get('x-api-key') === (process.env['AUTOMATION_API_KEY'] ?? process.env['NEXT_PUBLIC_AUTOMATION_API_KEY'])
}

/**
 * GET /api/n8n/youtube
 *   ?action=trending&region=NG&limit=5
 *   ?action=search&q=afrobeats+2026&region=NG&limit=5
 *   ?action=genre&genre=afrobeats&limit=5
 *   ?action=playlist&id=PLAYLIST_ID&limit=5
 *
 * Returns only videos NOT already covered in existing articles (deduplication by video ID).
 */
export async function GET(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const p       = req.nextUrl.searchParams
  const action  = p.get('action') ?? 'trending'
  const region  = p.get('region') ?? 'NG'
  const limit   = Math.min(Number(p.get('limit') ?? 5), 20)
  const genre   = (p.get('genre') ?? 'afrobeats') as Genre
  const query   = p.get('q') ?? ''
  const plId    = p.get('id') ?? ''

  // Check if YouTube API is configured
  if (!process.env['YOUTUBE_API_KEY']) {
    return NextResponse.json({ error: 'YOUTUBE_API_KEY not configured', videos: [] })
  }

  let videos: YTVideo[] = []

  try {
    if (action === 'trending') {
      videos = await getTrendingMusic(region, limit)
    } else if (action === 'search') {
      videos = await searchVideos(query || 'afrobeats 2026', limit, region || undefined)
    } else if (action === 'genre') {
      const preset = GENRE_QUERIES[genre] ?? GENRE_QUERIES.afrobeats
      // Search across all preset regions and dedupe
      const all = await Promise.all(
        preset.regions.map(r => searchVideos(preset.q, Math.ceil(limit / preset.regions.length), r))
      )
      const seen = new Set<string>()
      for (const batch of all) {
        for (const v of batch) {
          if (!seen.has(v.id)) { seen.add(v.id); videos.push(v) }
        }
      }
      videos = videos.slice(0, limit)
    } else if (action === 'playlist') {
      if (!plId) return NextResponse.json({ error: 'id required for playlist action' }, { status: 400 })
      videos = await getPlaylistVideos(plId, limit)
    } else {
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message, videos: [] }, { status: 502 })
  }

  // Deduplicate: remove videos already embedded in existing articles
  if (videos.length > 0) {
    const conditions = videos.map(v => like(articles.body, `%${v.id}%`))
    const covered = await db
      .select({ body: articles.body })
      .from(articles)
      .where(or(...conditions))

    const coveredIds = new Set<string>()
    for (const row of covered) {
      for (const v of videos) {
        if ((row.body ?? '').includes(v.id)) coveredIds.add(v.id)
      }
    }
    videos = videos.filter(v => !coveredIds.has(v.id))
  }

  return NextResponse.json({ videos, total: videos.length, action, region, genre })
}
