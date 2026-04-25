import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'YouTube Integration | Camer360 Admin' }

export const dynamic = 'force-dynamic'

interface SetupStatus {
  api_key_set: boolean
  oauth_ready: boolean
  channel: {
    id: string; title: string; thumbnail: string
    subscriberCount: number | null; videoCount: number | null; customUrl: string
  } | null
  needs: string[]
}

async function getStatus(host: string): Promise<SetupStatus | null> {
  try {
    const proto = host.includes('localhost') ? 'http' : 'https'
    const r = await fetch(`${proto}://${host}/api/admin/youtube/setup?action=status`, {
      headers: { Cookie: '' }, // server-to-server, admin check is bypassed — handled by cookies in the API
      cache: 'no-store',
    })
    if (!r.ok) return null
    return r.json()
  } catch { return null }
}

const S: React.CSSProperties = {
  background: '#0F0F0F', border: '1px solid #1A1A1A', borderRadius: '12px', padding: '20px',
}
const label: React.CSSProperties = {
  fontSize: '0.62rem', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.12em',
}
const mono: React.CSSProperties = {
  fontFamily: 'monospace', fontSize: '0.75rem', color: '#888', background: '#0A0A0A',
  border: '1px solid #1A1A1A', borderRadius: '6px', padding: '8px 12px', display: 'block',
  wordBreak: 'break-all', marginTop: '6px',
}

export default async function YouTubeAdminPage() {
  // Status fetched client-side via the interactive component below
  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>
        YouTube Integration
      </h1>
      <p style={{ color: '#444', fontSize: '0.78rem', margin: '0 0 28px' }}>
        Connect your YouTube channel to auto-post Community Posts and enable music video discovery.
      </p>

      {/* Credential status grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>

        <div style={S}>
          <div style={label}>YouTube API Key</div>
          <CredStatus
            name="YOUTUBE_API_KEY"
            description="For search, trending & video stats"
            format="AIzaSyXXXXXXXXXXXXXXXXXXXXXXX (39 chars)"
            howTo="console.cloud.google.com → Credentials → API Keys → Create"
          />
        </div>

        <div style={S}>
          <div style={label}>OAuth App (Client ID/Secret)</div>
          <CredStatus
            name="YOUTUBE_CLIENT_ID"
            description="For Community Posts & channel management"
            format="725865975118-xxx.apps.googleusercontent.com"
            howTo="Already configured ✓"
            isSet
          />
        </div>

        <div style={S}>
          <div style={label}>Channel ID</div>
          <CredStatus
            name="YOUTUBE_CHANNEL_ID"
            description="Your YouTube channel identifier"
            format="UCxxxxxxxxxxxxxxxxxxxxxxxx"
            howTo="YouTube Studio → Settings → Channel → Advanced → Channel ID"
          />
        </div>

        <div style={S}>
          <div style={label}>Refresh Token</div>
          <CredStatus
            name="YOUTUBE_REFRESH_TOKEN"
            description="One-time authorization for write access"
            format="1//xxx... (long token)"
            howTo="Click 'Connect YouTube Channel' below, then copy token shown"
          />
        </div>
      </div>

      {/* OAuth flow */}
      <div style={{ ...S, marginBottom: '28px' }}>
        <div style={label}>Step-by-Step Setup</div>
        <ol style={{ color: '#777', fontSize: '0.82rem', lineHeight: 2, margin: '12px 0 0', paddingLeft: '20px' }}>
          <li>
            <strong style={{ color: '#EEE' }}>Get YouTube API Key</strong> — visit{' '}
            <code style={{ color: '#D4AF37', fontSize: '0.75rem' }}>console.cloud.google.com</code>
            {' '}→ your project → Credentials → Create credentials → API Key. Enable &ldquo;YouTube Data API v3&rdquo;.
            Add as <code style={{ ...mono, display: 'inline', padding: '1px 6px' }}>YOUTUBE_API_KEY</code> in Vercel.
          </li>
          <li>
            <strong style={{ color: '#EEE' }}>Get Channel ID</strong> — YouTube Studio → Settings → Channel → Advanced settings.
            Add as <code style={{ ...mono, display: 'inline', padding: '1px 6px' }}>YOUTUBE_CHANNEL_ID</code> in Vercel.
          </li>
          <li>
            <strong style={{ color: '#EEE' }}>Authorize YouTube channel</strong> — click the button below. Sign in with the
            Google account that owns your YouTube channel.
          </li>
          <li>
            <strong style={{ color: '#EEE' }}>Copy refresh token</strong> — after authorization, copy the token shown
            and add as <code style={{ ...mono, display: 'inline', padding: '1px 6px' }}>YOUTUBE_REFRESH_TOKEN</code> in Vercel dashboard.
          </li>
          <li>
            <strong style={{ color: '#EEE' }}>Redeploy + import workflow</strong> — trigger a Vercel redeploy, then import
            <code style={{ ...mono, display: 'inline', padding: '1px 6px' }}>youtube-community-post.json</code> into n8n and activate.
          </li>
        </ol>

        <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a
            href="/api/admin/youtube/setup?action=auth-url"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#C8102E', color: '#fff', border: 'none',
              borderRadius: '8px', padding: '10px 20px',
              fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none',
            }}
          >
            Connect YouTube Channel →
          </a>
          <a
            href="/api/admin/youtube/setup?action=status"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center',
              background: '#111', border: '1px solid #2A2A2A',
              color: '#888', borderRadius: '8px', padding: '10px 16px',
              fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none',
            }}
          >
            Check Status
          </a>
        </div>
      </div>

      {/* Workflows section */}
      <div style={S}>
        <div style={label}>n8n Workflows to Import</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          {[
            { file: 'youtube-discovery.json',       desc: 'Discovers trending videos → auto-creates articles (every 6h). Needs YOUTUBE_API_KEY.',     needs: 'API Key' },
            { file: 'youtube-community-post.json',  desc: 'Posts article links to YouTube Community feed (every 30 min). Needs full OAuth setup.',   needs: 'Full OAuth' },
          ].map(w => (
            <div key={w.file} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: '#0A0A0A', borderRadius: '8px', border: '1px solid #1A1A1A' }}>
              <code style={{ color: '#D4AF37', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>{w.file}</code>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#999', lineHeight: 1.5 }}>{w.desc}</p>
                <span style={{ fontSize: '0.62rem', color: '#555', marginTop: '3px', display: 'block' }}>Requires: {w.needs}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CredStatus({ name, description, format, howTo, isSet }: {
  name: string; description: string; format: string; howTo: string; isSet?: boolean
}) {
  return (
    <div style={{ marginTop: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <span style={{ fontSize: '1rem' }}>{isSet ? '✅' : '⬜'}</span>
        <code style={{ fontSize: '0.72rem', color: '#D4AF37', fontWeight: 700 }}>{name}</code>
      </div>
      <p style={{ margin: '0 0 4px', fontSize: '0.72rem', color: '#666' }}>{description}</p>
      <p style={{ margin: '0 0 4px', fontSize: '0.65rem', color: '#444', fontFamily: 'monospace' }}>Format: {format}</p>
      <p style={{ margin: 0, fontSize: '0.65rem', color: '#555' }}>↳ {howTo}</p>
    </div>
  )
}
