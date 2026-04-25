import { NextRequest, NextResponse } from 'next/server'
import { getChannelPlaylists, createPlaylist, addToPlaylist, youtubeOAuthConfigured } from '@/lib/youtube-oauth'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

async function isAuthed(req: NextRequest): Promise<boolean> {
  // Accept admin cookie OR automation API key
  const apiKey = req.headers.get('x-api-key')
  if (apiKey === (process.env['AUTOMATION_API_KEY'] ?? process.env['NEXT_PUBLIC_AUTOMATION_API_KEY'])) return true
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  return !!(token && verifyToken(token))
}

/**
 * GET /api/admin/youtube/playlists — list channel playlists
 * POST /api/admin/youtube/playlists — create a playlist OR add video to existing
 *
 * POST body for create:
 *   { action: "create", title, description, privacy? }
 *
 * POST body for add video:
 *   { action: "add", playlist_id, video_id }
 *
 * POST body for ensure (create if not exists, then add):
 *   { action: "ensure", title, description, video_id }
 */
export async function GET(req: NextRequest) {
  if (!await isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!youtubeOAuthConfigured()) return NextResponse.json({ error: 'YouTube OAuth not configured' }, { status: 503 })

  try {
    const playlists = await getChannelPlaylists()
    return NextResponse.json({ playlists })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 })
  }
}

export async function POST(req: NextRequest) {
  if (!await isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!youtubeOAuthConfigured()) return NextResponse.json({ error: 'YouTube OAuth not configured' }, { status: 503 })

  const body = await req.json() as {
    action:       'create' | 'add' | 'ensure'
    title?:       string
    description?: string
    privacy?:     'public' | 'unlisted' | 'private'
    playlist_id?: string
    video_id?:    string
  }

  try {
    if (body.action === 'create') {
      if (!body.title) return NextResponse.json({ error: 'title required' }, { status: 400 })
      const playlist = await createPlaylist({
        title:       body.title,
        description: body.description ?? '',
        privacy:     body.privacy,
      })
      return NextResponse.json({ ok: true, playlist })

    } else if (body.action === 'add') {
      if (!body.playlist_id || !body.video_id) {
        return NextResponse.json({ error: 'playlist_id and video_id required' }, { status: 400 })
      }
      await addToPlaylist(body.playlist_id, body.video_id)
      return NextResponse.json({ ok: true })

    } else if (body.action === 'ensure') {
      // Find or create playlist by title, then add video
      if (!body.title || !body.video_id) {
        return NextResponse.json({ error: 'title and video_id required' }, { status: 400 })
      }
      const playlists = await getChannelPlaylists()
      let playlist = playlists.find(p => p.title.toLowerCase() === body.title!.toLowerCase())
      if (!playlist) {
        playlist = await createPlaylist({
          title:       body.title,
          description: body.description ?? `Camer360 ${body.title} — Updated automatically`,
        })
      }
      await addToPlaylist(playlist.id, body.video_id)
      return NextResponse.json({ ok: true, playlist_id: playlist.id, playlist_url: playlist.url })

    } else {
      return NextResponse.json({ error: 'action must be create | add | ensure' }, { status: 400 })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 })
  }
}
