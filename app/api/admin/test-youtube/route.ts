import { NextRequest, NextResponse } from 'next/server'

function authCheck(req: NextRequest) {
  return req.headers.get('x-api-key') === (process.env.AUTOMATION_API_KEY ?? process.env.NEXT_PUBLIC_AUTOMATION_API_KEY)
}

export async function GET(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const key = process.env['YOUTUBE_API_KEY']

  if (!key) return NextResponse.json({ ok: false, error: 'YOUTUBE_API_KEY not set' })

  // Validate it looks like an API key not an OAuth client ID
  const keyType = key.includes('.apps.googleusercontent.com') ? 'OAUTH_CLIENT_ID (wrong!)' : key.startsWith('AIzaSy') ? 'API_KEY (correct)' : 'unknown format'

  // Make a minimal, cheap test call (videos.list = 1 quota unit)
  const testUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=dQw4w9WgXcQ&key=${key}`
  let apiResult: unknown = null
  let apiError: string | null = null

  try {
    const res = await fetch(testUrl, {
      headers: { Referer: 'https://www.camer360.com' },
    })
    apiResult = await res.json()
    if (!res.ok) {
      const err = apiResult as { error?: { message?: string; status?: string } }
      apiError = `HTTP ${res.status}: ${err.error?.message ?? 'unknown'} (${err.error?.status ?? ''})`
    }
  } catch (e) {
    apiError = String(e)
  }

  return NextResponse.json({
    ok: !apiError,
    key_present: true,
    key_prefix: key.slice(0, 12) + '...',
    key_type: keyType,
    api_error: apiError,
    api_result_kind: apiError ? 'error' : 'success',
    items_returned: (apiResult as { items?: unknown[] })?.items?.length ?? 0,
  })
}
