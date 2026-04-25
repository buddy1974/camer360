'use client'
import { useState } from 'react'

const CHANNEL_ID  = 'UCVOFAEB15N3WA8FiOhJ8BKg'
const CHANNEL_URL = 'https://www.youtube.com/channel/' + CHANNEL_ID
const SCOPES = [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/youtube.upload',
].join(' ')

interface ServerVars {
  apiKey:         boolean
  clientId:       boolean
  clientSecret:   boolean
  channelId:      boolean
  refreshToken:   boolean
  publicClientId: string
}

const S: React.CSSProperties = {
  background: '#0F0F0F', border: '1px solid #1A1A1A', borderRadius: '12px', padding: '20px',
}
const LABEL: React.CSSProperties = {
  fontSize: '0.62rem', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.12em',
}
const CODE: React.CSSProperties = {
  fontFamily: 'monospace', fontSize: '0.72rem', color: '#D4AF37',
  background: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: '4px', padding: '1px 6px',
}

function Row({ label, ok, note }: { label: string; ok: boolean; note?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0', borderBottom: '1px solid #111' }}>
      <span style={{ fontSize: '0.85rem', flexShrink: 0, marginTop: '1px' }}>{ok ? '✅' : '❌'}</span>
      <div>
        <span style={{ fontSize: '0.78rem', color: ok ? '#EEE' : '#777', fontFamily: 'monospace' }}>{label}</span>
        {note && <span style={{ fontSize: '0.65rem', color: '#555', marginLeft: '8px' }}>{note}</span>}
      </div>
    </div>
  )
}

export function YouTubeSetupClient({ serverVars }: { serverVars: ServerVars }) {
  const [oauthUrl, setOauthUrl] = useState('')
  const [testing,  setTesting]  = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  // The CLIENT_ID for OAuth URL — use NEXT_PUBLIC_ which always works,
  // fallback to what server saw (may be empty if Vercel dashboard not updated yet)
  const clientId = process.env['NEXT_PUBLIC_YOUTUBE_CLIENT_ID'] || serverVars.publicClientId

  function buildOAuthUrl() {
    if (!clientId) return ''
    const redirect = `${window.location.origin}/api/admin/youtube/setup`
    const params = new URLSearchParams({
      client_id:     clientId,
      redirect_uri:  redirect,
      response_type: 'code',
      scope:         SCOPES,
      access_type:   'offline',
      prompt:        'consent',
    })
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  }

  async function testApiKey() {
    setTesting(true)
    setTestResult(null)
    try {
      const r = await fetch('/api/admin/youtube/setup?action=status')
      const d = await r.json() as any
      setTestResult(JSON.stringify(d, null, 2))
    } catch(e: any) {
      setTestResult('Error: ' + e.message)
    }
    setTesting(false)
  }

  const allReady = serverVars.apiKey && serverVars.clientId && serverVars.clientSecret &&
                   serverVars.channelId && serverVars.refreshToken

  return (
    <div style={{ maxWidth: '860px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>
          YouTube Integration
        </h1>
        <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: '0.72rem', color: '#D4AF37', textDecoration: 'none', fontWeight: 700 }}>
          ▶ youtube.com/channel/{CHANNEL_ID} →
        </a>
      </div>

      {/* Environment Variable Status */}
      <div style={{ ...S, marginBottom: '20px' }}>
        <div style={{ ...LABEL, marginBottom: '4px' }}>Environment Variable Status (Runtime Check)</div>
        <p style={{ fontSize: '0.65rem', color: '#444', margin: '0 0 12px' }}>
          Variables marked ❌ are not accessible in the Vercel production runtime.
          They must be added manually via the Vercel Dashboard (not CLI or API).
        </p>

        <Row label="YOUTUBE_API_KEY" ok={serverVars.apiKey}
          note={!serverVars.apiKey ? '→ Add via Vercel Dashboard' : 'AIzaSy... ✓'} />
        <Row label="YOUTUBE_CLIENT_ID" ok={serverVars.clientId}
          note={!serverVars.clientId ? '→ Add via Vercel Dashboard' : '✓'} />
        <Row label="YOUTUBE_CLIENT_SECRET" ok={serverVars.clientSecret}
          note={!serverVars.clientSecret ? '→ Add via Vercel Dashboard' : '✓'} />
        <Row label="YOUTUBE_CHANNEL_ID" ok={serverVars.channelId}
          note={!serverVars.channelId ? '→ Add via Vercel Dashboard' : CHANNEL_ID} />
        <Row label="YOUTUBE_REFRESH_TOKEN" ok={serverVars.refreshToken}
          note={!serverVars.refreshToken ? '→ Complete OAuth flow below first' : '✓'} />
        <Row label="NEXT_PUBLIC_YOUTUBE_CLIENT_ID" ok={!!clientId}
          note={clientId ? `${clientId.slice(0,20)}... (baked into build)` : '→ Add via Vercel Dashboard'} />

        {allReady ? (
          <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', fontSize: '0.78rem', color: '#22C55E', fontWeight: 700 }}>
            ✅ All YouTube vars configured — Community Posts and Playlist Sync are active
          </div>
        ) : (
          <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(200,16,46,0.06)', border: '1px solid rgba(200,16,46,0.15)', borderRadius: '8px', fontSize: '0.72rem', color: '#888', lineHeight: 1.6 }}>
            <strong style={{ color: '#C8102E' }}>To fix missing vars:</strong> Go to{' '}
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={{ color: '#D4AF37' }}>vercel.com</a>
            {' '}→ camer360.com → Settings → Environment Variables → Add each missing var manually → Redeploy.
          </div>
        )}
      </div>

      {/* Vercel Dashboard Values to Copy */}
      <div style={{ ...S, marginBottom: '20px' }}>
        <div style={{ ...LABEL, marginBottom: '12px' }}>Values to Paste into Vercel Dashboard</div>
        <p style={{ fontSize: '0.7rem', color: '#555', margin: '0 0 14px' }}>
          Add these at vercel.com → camer360.com → Settings → Environment Variables → Production only
        </p>
        {[
          { key: 'YOUTUBE_API_KEY',               note: 'AIzaSy... format. After adding: fix referrer restriction (see below)' },
          { key: 'YOUTUBE_CLIENT_ID',             note: '725865975118-xxx.apps.googleusercontent.com' },
          { key: 'YOUTUBE_CLIENT_SECRET',         note: 'GOCSPX-... format' },
          { key: 'YOUTUBE_CHANNEL_ID',            note: 'UCVOFAEB15N3WA8FiOhJ8BKg' },
          { key: 'NEXT_PUBLIC_YOUTUBE_CLIENT_ID', note: 'Same as CLIENT_ID — public, needed for OAuth button' },
        ].map(v => (
          <div key={v.key} style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <code style={CODE}>{v.key}</code>
              {v.note && <span style={{ fontSize: '0.62rem', color: '#555' }}>{v.note}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* API Key Referrer Fix */}
      <div style={{ ...S, marginBottom: '20px' }}>
        <div style={{ ...LABEL, marginBottom: '10px' }}>⚠ Fix YouTube API Key Restriction</div>
        <p style={{ fontSize: '0.75rem', color: '#888', lineHeight: 1.6, margin: '0 0 10px' }}>
          The API key currently has "HTTP referrer restrictions" which block server-side calls (no browser referer header).
          Must be removed for the YouTube discovery workflow to work.
        </p>
        <ol style={{ fontSize: '0.75rem', color: '#666', lineHeight: 2, margin: 0, paddingLeft: '18px' }}>
          <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" style={{ color: '#D4AF37' }}>console.cloud.google.com/apis/credentials</a></li>
          <li>Click your API key (<code style={{ ...CODE, display: 'inline' }}>AIzaSyD1C64...</code>)</li>
          <li>Under <strong style={{ color: '#EEE' }}>Application restrictions</strong> → change to <strong style={{ color: '#22C55E' }}>None</strong></li>
          <li>Under <strong style={{ color: '#EEE' }}>API restrictions</strong> → restrict to <strong style={{ color: '#22C55E' }}>YouTube Data API v3</strong></li>
          <li>Save</li>
        </ol>
      </div>

      {/* OAuth Flow */}
      <div style={{ ...S, marginBottom: '20px' }}>
        <div style={{ ...LABEL, marginBottom: '10px' }}>OAuth Authorization (get YOUTUBE_REFRESH_TOKEN)</div>
        <p style={{ fontSize: '0.73rem', color: '#666', lineHeight: 1.6, margin: '0 0 14px' }}>
          After adding all vars above and redeploying, click below. Sign in with the Google account
          that owns the Camer360 YouTube channel. Copy the <code style={CODE}>refresh_token</code> shown
          and add it to Vercel as <code style={CODE}>YOUTUBE_REFRESH_TOKEN</code>.
        </p>

        {clientId ? (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a
              href={buildOAuthUrl()}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: '#C8102E', color: '#fff', borderRadius: '8px',
                padding: '10px 20px', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none',
              }}
            >
              🔗 Connect YouTube Channel →
            </a>
            <button onClick={testApiKey} disabled={testing} style={{
              background: '#111', border: '1px solid #2A2A2A', color: '#888',
              borderRadius: '8px', padding: '10px 16px', fontSize: '0.75rem',
              fontWeight: 700, cursor: testing ? 'not-allowed' : 'pointer',
            }}>
              {testing ? 'Testing...' : 'Check Status'}
            </button>
          </div>
        ) : (
          <div style={{ padding: '12px', background: '#0A0A0A', borderRadius: '8px', border: '1px solid #1A1A1A' }}>
            <span style={{ fontSize: '0.73rem', color: '#666' }}>
              Add <code style={CODE}>NEXT_PUBLIC_YOUTUBE_CLIENT_ID</code> to Vercel and redeploy to enable this button.
            </span>
          </div>
        )}

        {testResult && (
          <pre style={{
            marginTop: '12px', background: '#080808', border: '1px solid #1A1A1A',
            borderRadius: '8px', padding: '12px', fontSize: '0.7rem', color: '#888',
            overflow: 'auto', maxHeight: '200px',
          }}>
            {testResult}
          </pre>
        )}
      </div>

      {/* Workflow status */}
      <div style={S}>
        <div style={{ ...LABEL, marginBottom: '12px' }}>Workflow Status</div>
        {[
          { file: 'rss-ingestion-engine.json',       label: '✅ RSS Ingestion',        status: 'Active',  needs: '' },
          { file: 'article-enhancement-engine.json',  label: '✅ Article Enhancement', status: 'Active',  needs: '' },
          { file: 'facebook-auto-post.json',           label: '✅ Facebook Auto-Post',  status: 'Active',  needs: '' },
          { file: 'youtube-community-post.json',       label: '⏳ YouTube Community',   status: 'Waiting', needs: 'YOUTUBE_REFRESH_TOKEN' },
          { file: 'youtube-discovery.json',            label: '⏳ YouTube Discovery',   status: 'Waiting', needs: 'YOUTUBE_API_KEY (fix referer restriction)' },
          { file: 'youtube-playlist-sync.json',        label: '⏳ Playlist Sync',       status: 'Waiting', needs: 'YOUTUBE_API_KEY + YOUTUBE_REFRESH_TOKEN' },
        ].map(w => (
          <div key={w.file} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #111' }}>
            <span style={{ fontSize: '0.7rem', width: '160px', flexShrink: 0, color: w.status === 'Active' ? '#22C55E' : '#888' }}>
              {w.label}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#555' }}>{w.needs || 'No additional config needed'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

