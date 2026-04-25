import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { buildAuthUrl, exchangeCode, getMyChannel, youtubeOAuthConfigured } from '@/lib/youtube-oauth'

function redirectUri(req: NextRequest): string {
  const host = req.headers.get('host') ?? 'www.camer360.com'
  const proto = host.includes('localhost') ? 'http' : 'https'
  return `${proto}://${host}/api/admin/youtube/setup`
}

async function isAdmin(req: NextRequest): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  return !!(token && verifyToken(token))
}

/**
 * GET /api/admin/youtube/setup
 *   ?action=auth-url   → returns the OAuth consent URL
 *   ?action=status     → returns current OAuth status + channel info
 *   ?code=XXX          → OAuth callback: exchange code for refresh token
 */
export async function GET(req: NextRequest) {
  if (!await isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const p      = req.nextUrl.searchParams
  const action = p.get('action')
  const code   = p.get('code')

  // ── OAuth callback: exchange authorization code for tokens ──────────────
  if (code) {
    if (!process.env['YOUTUBE_CLIENT_ID'] || !process.env['YOUTUBE_CLIENT_SECRET']) {
      return NextResponse.json({ error: 'YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET not configured' }, { status: 400 })
    }
    try {
      const { refreshToken, accessToken } = await exchangeCode(code, redirectUri(req))
      return NextResponse.json({
        ok:           true,
        refresh_token: refreshToken,
        message:      'Copy the refresh_token above and add it to Vercel dashboard as YOUTUBE_REFRESH_TOKEN',
        next_step:    'Set YOUTUBE_REFRESH_TOKEN in Vercel → Settings → Environment Variables → redeploy',
      })
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 })
    }
  }

  // ── Generate auth URL ───────────────────────────────────────────────────
  if (action === 'auth-url') {
    if (!process.env['YOUTUBE_CLIENT_ID']) {
      return NextResponse.json({ error: 'YOUTUBE_CLIENT_ID not configured' }, { status: 400 })
    }
    try {
      const url = buildAuthUrl(redirectUri(req))
      return NextResponse.json({ auth_url: url })
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 })
    }
  }

  // ── Status check ────────────────────────────────────────────────────────
  const configured = youtubeOAuthConfigured()
  const hasApiKey  = !!process.env['YOUTUBE_API_KEY']

  let channel = null
  if (configured) {
    try { channel = await getMyChannel() } catch { /* token may be expired */ }
  }

  return NextResponse.json({
    api_key_set:    hasApiKey,
    oauth_ready:    configured,
    channel,
    needs: [
      !hasApiKey   && 'YOUTUBE_API_KEY (simple key for search/trending — AIzaSy...)',
      !process.env['YOUTUBE_REFRESH_TOKEN'] && 'YOUTUBE_REFRESH_TOKEN (run OAuth flow)',
      !process.env['YOUTUBE_CHANNEL_ID']    && 'YOUTUBE_CHANNEL_ID (your channel ID: UCxxxxxx)',
    ].filter(Boolean),
  })
}
