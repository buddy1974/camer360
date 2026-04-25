import { NextRequest, NextResponse } from 'next/server'
import { uploadVideo, youtubeOAuthConfigured } from '@/lib/youtube-oauth'

export const maxDuration = 60  // Vercel max for Pro plan

function authCheck(req: NextRequest) {
  return req.headers.get('x-api-key') === (process.env['AUTOMATION_API_KEY'] ?? process.env['NEXT_PUBLIC_AUTOMATION_API_KEY'])
}

/**
 * POST /api/admin/youtube/upload
 *
 * Uploads a video to the Camer360 YouTube channel.
 * The video is sourced from an external URL (downloaded server-side).
 *
 * Body (JSON):
 *   video_url     — publicly accessible video URL (.mp4)
 *   title         — video title (max 100 chars)
 *   description   — video description (max 5000 chars)
 *   tags?         — array of tags
 *   category_id?  — YouTube category ID (default: 24 = Entertainment)
 *   privacy?      — "public" | "unlisted" | "private" (default: public)
 *   is_short?     — true to mark as YouTube Short (adds #Shorts)
 *
 * NOTE on video size: Vercel function memory limit is ~1GB.
 * For videos > 100MB, use a background job or a dedicated upload worker.
 */
export async function POST(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!youtubeOAuthConfigured()) {
    return NextResponse.json({
      error: 'YouTube OAuth not configured — set YOUTUBE_REFRESH_TOKEN and YOUTUBE_CHANNEL_ID in Vercel',
    }, { status: 503 })
  }

  const body = await req.json() as {
    video_url:    string
    title:        string
    description:  string
    tags?:        string[]
    category_id?: string
    privacy?:     'public' | 'unlisted' | 'private'
    is_short?:    boolean
  }

  if (!body.video_url || !body.title || !body.description) {
    return NextResponse.json({ error: 'video_url, title, and description are required' }, { status: 400 })
  }

  // Download video from URL
  let videoBuffer: Buffer
  try {
    const videoRes = await fetch(body.video_url, { signal: AbortSignal.timeout(30000) })
    if (!videoRes.ok) throw new Error(`Failed to fetch video: ${videoRes.status}`)

    const contentLength = videoRes.headers.get('content-length')
    if (contentLength && Number(contentLength) > 512 * 1024 * 1024) {
      throw new Error('Video file too large for serverless upload (max ~512MB)')
    }

    videoBuffer = Buffer.from(await videoRes.arrayBuffer())
  } catch (e: any) {
    return NextResponse.json({ error: `Video download failed: ${e.message}` }, { status: 400 })
  }

  const mimeType = body.video_url.endsWith('.webm') ? 'video/webm'
    : body.video_url.endsWith('.mov')  ? 'video/quicktime'
    : 'video/mp4'

  try {
    const result = await uploadVideo({
      title:        body.title,
      description:  body.description,
      tags:         body.tags,
      categoryId:   body.category_id,
      privacyStatus: body.privacy,
      isShort:      body.is_short,
      videoBuffer,
      mimeType,
    })
    return NextResponse.json({ ok: true, ...result })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 })
  }
}
