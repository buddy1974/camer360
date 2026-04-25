import { NextRequest, NextResponse } from 'next/server'
import { createCommunityPost, youtubeOAuthConfigured } from '@/lib/youtube-oauth'

function authCheck(req: NextRequest) {
  return req.headers.get('x-api-key') === (process.env['AUTOMATION_API_KEY'] ?? process.env['NEXT_PUBLIC_AUTOMATION_API_KEY'])
}

/**
 * POST /api/admin/youtube/community-post
 * Body: { text: string, image_url?: string }
 *
 * Creates a YouTube Community Post on the authorized channel.
 * Requires YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN, YOUTUBE_CHANNEL_ID.
 */
export async function POST(req: NextRequest) {
  if (!authCheck(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!youtubeOAuthConfigured()) {
    return NextResponse.json({
      error: 'YouTube OAuth not configured',
      missing: [
        !process.env['YOUTUBE_REFRESH_TOKEN'] && 'YOUTUBE_REFRESH_TOKEN',
        !process.env['YOUTUBE_CHANNEL_ID']    && 'YOUTUBE_CHANNEL_ID',
      ].filter(Boolean),
    }, { status: 503 })
  }

  const body = await req.json() as { text?: string; image_url?: string }
  if (!body.text?.trim()) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 })
  }

  try {
    const result = await createCommunityPost({
      text:     body.text.trim(),
      imageUrl: body.image_url ?? undefined,
    })
    return NextResponse.json({ ok: true, id: result.id, url: result.url })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 })
  }
}
