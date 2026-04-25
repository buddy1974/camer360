import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'YouTube Integration | Camer360 Admin' }
export const dynamic = 'force-dynamic'

const CHANNEL_ID  = 'UCVOFAEB15N3WA8FiOhJ8BKg'
const CHANNEL_URL = 'https://www.youtube.com/channel/' + CHANNEL_ID

const S: React.CSSProperties = {
  background: '#0F0F0F', border: '1px solid #1A1A1A', borderRadius: '12px', padding: '20px',
}
const labelStyle: React.CSSProperties = {
  fontSize: '0.62rem', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.12em',
}

function StatusDot({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '0.75rem' }}>{ok ? '✅' : '⬜'}</span>
      <span style={{ fontSize: '0.78rem', color: ok ? '#22C55E' : '#555' }}>{label}</span>
    </div>
  )
}

export default async function YouTubeAdminPage() {
  const apiKeySet     = !!process.env['YOUTUBE_API_KEY'] && !process.env['YOUTUBE_API_KEY']?.includes('.apps.googleusercontent')
  const clientSet     = !!process.env['YOUTUBE_CLIENT_ID'] && !!process.env['YOUTUBE_CLIENT_SECRET']
  const refreshSet    = !!process.env['YOUTUBE_REFRESH_TOKEN']
  const channelIdSet  = !!process.env['YOUTUBE_CHANNEL_ID']
  const oauthReady    = clientSet && refreshSet && channelIdSet

  return (
    <div style={{ maxWidth: '860px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>
          YouTube Channel Integration
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: '#D4AF37', textDecoration: 'none', fontWeight: 700 }}>
            ▶ Camer360 on YouTube →
          </a>
          <code style={{ fontSize: '0.65rem', color: '#444', background: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: '4px', padding: '2px 8px' }}>
            {CHANNEL_ID}
          </code>
        </div>
      </div>

      {/* Credential status */}
      <div style={{ ...S, marginBottom: '20px' }}>
        <div style={{ ...labelStyle, marginBottom: '14px' }}>Credential Status</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <StatusDot ok={apiKeySet}    label="YOUTUBE_API_KEY (for search/discovery)" />
          <StatusDot ok={clientSet}    label="OAuth Client ID + Secret" />
          <StatusDot ok={channelIdSet} label="YOUTUBE_CHANNEL_ID" />
          <StatusDot ok={refreshSet}   label="YOUTUBE_REFRESH_TOKEN (write access)" />
        </div>

        {oauthReady ? (
          <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px' }}>
            <span>✅</span>
            <span style={{ fontSize: '0.78rem', color: '#22C55E', fontWeight: 700 }}>OAuth fully configured — Community Posts and Playlist Sync are active</span>
          </div>
        ) : (
          <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(200,16,46,0.08)', border: '1px solid rgba(200,16,46,0.2)', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 6px', fontSize: '0.75rem', color: '#C8102E', fontWeight: 700 }}>Missing credentials — complete the steps below</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {!apiKeySet    && <span style={{ fontSize: '0.7rem', color: '#666' }}>• YOUTUBE_API_KEY — needed for music discovery (AIzaSy... format)</span>}
              {!refreshSet   && <span style={{ fontSize: '0.7rem', color: '#666' }}>• YOUTUBE_REFRESH_TOKEN — run OAuth flow below</span>}
            </div>
          </div>
        )}
      </div>

      {/* Setup steps */}
      <div style={{ ...S, marginBottom: '20px' }}>
        <div style={{ ...labelStyle, marginBottom: '16px' }}>Setup Steps</div>
        <ol style={{ color: '#777', fontSize: '0.82rem', lineHeight: 2.2, margin: 0, paddingLeft: '20px' }}>
          <li>
            <strong style={{ color: '#EEE' }}>Get YouTube API Key</strong>
            {' '}(for trending music discovery):{' '}
            <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" style={{ color: '#D4AF37', textDecoration: 'none' }}>
              console.cloud.google.com
            </a>
            {' '}→ Credentials → Create credentials → API Key.
            Enable <em>YouTube Data API v3</em>.
            Add to Vercel as <code style={{ color: '#D4AF37', fontSize: '0.72rem' }}>YOUTUBE_API_KEY</code>.
            {apiKeySet && <span style={{ color: '#22C55E', marginLeft: '8px' }}>✓ Set</span>}
          </li>
          <li>
            <strong style={{ color: '#EEE' }}>Channel ID:</strong> Already confirmed →{' '}
            <code style={{ color: '#D4AF37', fontSize: '0.72rem' }}>{CHANNEL_ID}</code>
            {' '}(already set in env) {channelIdSet && <span style={{ color: '#22C55E' }}>✓</span>}
          </li>
          <li>
            <strong style={{ color: '#EEE' }}>Authorize write access</strong>
            {' '}(one-time OAuth flow to get refresh token):
            <div style={{ marginTop: '8px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a
                href="/api/admin/youtube/setup?action=auth-url"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: '#C8102E', color: '#fff', borderRadius: '8px',
                  padding: '8px 16px', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none',
                }}
              >
                🔗 Get OAuth Authorization URL →
              </a>
              <a
                href="/api/admin/youtube/setup?action=status"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center',
                  background: '#111', border: '1px solid #2A2A2A',
                  color: '#888', borderRadius: '8px', padding: '8px 14px',
                  fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none',
                }}
              >
                Check Status
              </a>
            </div>
            <p style={{ fontSize: '0.7rem', color: '#555', margin: '8px 0 0' }}>
              After authorizing: copy the <code style={{ color: '#D4AF37', fontSize: '0.68rem' }}>refresh_token</code> shown → add to Vercel as <code style={{ color: '#D4AF37', fontSize: '0.68rem' }}>YOUTUBE_REFRESH_TOKEN</code> → redeploy.
            </p>
            {refreshSet && <span style={{ color: '#22C55E', fontSize: '0.72rem', fontWeight: 700 }}>✓ Refresh token set</span>}
          </li>
        </ol>
      </div>

      {/* Workflows */}
      <div style={{ ...S, marginBottom: '20px' }}>
        <div style={{ ...labelStyle, marginBottom: '14px' }}>n8n Workflows — Import in Order</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { file: 'rss-ingestion-engine.json',      status: 'active',   label: 'RSS Ingestion',       desc: 'Every 2h — fetches RSS, classifies, queues articles' },
            { file: 'article-enhancement-engine.json', status: 'active',  label: 'Article Enhancement', desc: 'Every 30m — AI rewrites queue items → draft articles' },
            { file: 'facebook-auto-post.json',         status: 'active',   label: 'Facebook Auto-Post',  desc: 'Every 15m — posts published articles to Facebook page' },
            { file: 'youtube-community-post.json',     status: 'active',   label: 'YouTube Community Posts', desc: 'Every 30m — posts articles to YouTube Community feed', needs: 'YOUTUBE_REFRESH_TOKEN' },
            { file: 'youtube-discovery.json',          status: 'active',   label: 'YouTube Discovery',   desc: 'Every 6h — finds trending African music → auto-creates articles', needs: 'YOUTUBE_API_KEY' },
            { file: 'youtube-playlist-sync.json',      status: 'active',   label: 'YouTube Playlist Sync', desc: 'Every 12h — adds trending videos to 5 genre playlists on your channel', needs: 'YOUTUBE_REFRESH_TOKEN + API_KEY' },
          ].map(w => (
            <div key={w.file} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', background: '#0A0A0A', borderRadius: '8px', border: '1px solid #1A1A1A' }}>
              <span style={{ fontSize: '0.7rem', marginTop: '2px', color: w.status === 'active' ? '#22C55E' : '#666' }}>
                {w.status === 'active' ? '●' : '○'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <code style={{ color: '#D4AF37', fontSize: '0.7rem', fontWeight: 700 }}>{w.file}</code>
                  <span style={{ fontSize: '0.65rem', color: '#555' }}>{w.label}</span>
                </div>
                <p style={{ margin: '3px 0 0', fontSize: '0.72rem', color: '#666', lineHeight: 1.4 }}>{w.desc}</p>
                {w.needs && <p style={{ margin: '2px 0 0', fontSize: '0.62rem', color: '#444' }}>Requires: {w.needs}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What uploading videos needs */}
      <div style={{ ...S }}>
        <div style={{ ...labelStyle, marginBottom: '12px' }}>Video Uploading to YouTube Channel</div>
        <p style={{ fontSize: '0.78rem', color: '#666', lineHeight: 1.6, margin: '0 0 12px' }}>
          Uploading actual videos to your YouTube channel is supported via{' '}
          <code style={{ color: '#D4AF37', fontSize: '0.72rem' }}>POST /api/admin/youtube/upload</code>.
          Pass a <code style={{ color: '#D4AF37', fontSize: '0.72rem' }}>video_url</code> (publicly accessible .mp4), title, and description.
          The endpoint downloads the video and uploads it to your channel.
        </p>
        <p style={{ fontSize: '0.75rem', color: '#555', lineHeight: 1.6, margin: '0 0 12px' }}>
          <strong style={{ color: '#888' }}>To auto-generate videos from articles</strong> (YouTube Shorts), you need a
          video rendering service. Options:
        </p>
        <ul style={{ fontSize: '0.72rem', color: '#555', lineHeight: 1.8, margin: 0, paddingLeft: '16px' }}>
          <li><strong style={{ color: '#888' }}>Pictory.ai</strong> or <strong style={{ color: '#888' }}>InVideo.ai</strong> — turn articles into videos via API, then upload to YouTube</li>
          <li><strong style={{ color: '#888' }}>ElevenLabs + FFmpeg worker</strong> — TTS narration + image slides on a dedicated server</li>
          <li><strong style={{ color: '#888' }}>Record manually</strong> — upload via the admin endpoint or YouTube Studio</li>
        </ul>
      </div>
    </div>
  )
}
