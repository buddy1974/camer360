/**
 * YouTube OAuth 2.0 — one-time refresh token generator
 *
 * Run: npx tsx scripts/youtube-auth.ts
 *
 * Step 1 — script prints an authorization URL → open it in your browser
 * Step 2 — Google redirects to a localhost URL containing ?code=XXX
 * Step 3 — copy the 'code' value and paste back into this script
 * Step 4 — script exchanges it for tokens and shows your REFRESH_TOKEN
 * Step 5 — copy the refresh_token into Vercel dashboard as YOUTUBE_REFRESH_TOKEN
 */

import { config } from 'dotenv'
import { createServer } from 'http'
import { URL } from 'url'
import { createInterface } from 'readline'

config({ path: '.env.local' })

const CLIENT_ID     = process.env.YOUTUBE_CLIENT_ID!
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET!
const REDIRECT_URI  = 'http://localhost:8765/callback'

const SCOPES = [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/youtube.upload',
].join(' ')

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('\n✗ YOUTUBE_CLIENT_ID or YOUTUBE_CLIENT_SECRET missing in .env.local\n')
  process.exit(1)
}

function buildAuthUrl(): string {
  const params = new URLSearchParams({
    client_id:     CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    response_type: 'code',
    scope:         SCOPES,
    access_type:   'offline',
    prompt:        'consent',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

async function exchangeCode(code: string): Promise<{ access_token: string; refresh_token: string }> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      code,
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri:  REDIRECT_URI,
      grant_type:    'authorization_code',
    }),
  })
  const data = await res.json() as any
  if (data.error) throw new Error(`${data.error}: ${data.error_description}`)
  if (!data.refresh_token) throw new Error('No refresh_token returned. Try re-running the script.')
  return { access_token: data.access_token, refresh_token: data.refresh_token }
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗')
  console.log('║   YouTube OAuth — Camer360 Channel Authorization         ║')
  console.log('╚══════════════════════════════════════════════════════════╝\n')

  const authUrl = buildAuthUrl()
  console.log('Step 1 — Open this URL in your browser:\n')
  console.log('  ' + authUrl + '\n')
  console.log('Sign in with the Google account that owns the Camer360 YouTube channel.')
  console.log('After authorizing, Google will redirect to localhost:8765 (may show an error — that\'s fine).\n')

  // Start a local server to catch the redirect
  let resolveCode: (code: string) => void
  const codePromise = new Promise<string>(resolve => { resolveCode = resolve })

  const server = createServer((req, res) => {
    const url = new URL(req.url!, 'http://localhost:8765')
    const code = url.searchParams.get('code')
    if (code) {
      resolveCode!(code)
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end('<h2 style="font-family:sans-serif;color:green">✓ Authorization code received! Return to your terminal.</h2>')
      server.close()
    } else {
      res.writeHead(400)
      res.end('No code in request')
    }
  })

  server.listen(8765, () => {
    console.log('Listening on http://localhost:8765/callback for the OAuth redirect...\n')
  })

  server.on('error', () => {
    // Port in use — fall back to manual code input
    server.close()
    askForCodeManually().then(resolveCode!)
  })

  const code = await codePromise

  console.log('\nStep 2 — Exchanging authorization code for tokens...')
  try {
    const { access_token, refresh_token } = await exchangeCode(code)

    console.log('\n╔══════════════════════════════════════════════════════════╗')
    console.log('║   ✅ SUCCESS — Copy your YOUTUBE_REFRESH_TOKEN below     ║')
    console.log('╚══════════════════════════════════════════════════════════╝\n')
    console.log('YOUTUBE_REFRESH_TOKEN=' + refresh_token)
    console.log('\n───────────────────────────────────────────────────────────')
    console.log('Next steps:')
    console.log('  1. Go to vercel.com → camer360.com → Settings → Environment Variables')
    console.log('  2. Add: YOUTUBE_REFRESH_TOKEN = (value above)')
    console.log('  3. Add: YOUTUBE_CLIENT_SECRET = ' + CLIENT_SECRET.slice(0,8) + '...')
    console.log('  4. Add: YOUTUBE_CLIENT_ID     = ' + CLIENT_ID.slice(0,20) + '...')
    console.log('  5. Add: YOUTUBE_API_KEY       = (from .env.local)')
    console.log('  6. Add: YOUTUBE_CHANNEL_ID    = UCVOFAEB15N3WA8FiOhJ8BKg')
    console.log('  7. Redeploy → YouTube Community Posts and Playlist Sync will activate')
    console.log('───────────────────────────────────────────────────────────\n')
  } catch (e: any) {
    console.error('\n✗ Token exchange failed:', e.message)
    process.exit(1)
  }
}

function askForCodeManually(): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    console.log('\n(Port 8765 in use — paste the "code" parameter from the redirect URL instead)')
    rl.question('Paste the authorization code here: ', code => {
      rl.close()
      resolve(code.trim())
    })
  })
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1) })
