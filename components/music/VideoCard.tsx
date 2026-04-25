import type { YTVideo } from '@/lib/youtube'
import { formatViews, formatDuration } from '@/lib/youtube'
import Link from 'next/link'

interface Props {
  video:       YTVideo
  genreLabel?: string
  priority?:   boolean  // preload thumbnail
}

const GENRE_COLOR: Record<string, string> = {
  'Afrobeats Nigeria': '#D4AF37',
  'Makossa Cameroon':  '#1DB954',
  'Bikutsi Cameroun':  '#22C55E',
  'African Hip-Hop':   '#E91E8C',
  'African R&B':       '#3B82F6',
  'Trending Ghana':    '#F59E0B',
  'Global Collabs':    '#8B5CF6',
}

export function VideoCard({ video, genreLabel, priority = false }: Props) {
  const dur   = formatDuration(video.duration)
  const views = formatViews(video.viewCount)
  const color = genreLabel ? (GENRE_COLOR[genreLabel] ?? '#D4AF37') : '#D4AF37'
  const daysAgo = video.publishedAt
    ? Math.floor((Date.now() - new Date(video.publishedAt).getTime()) / 86_400_000)
    : null
  const timeAgo = daysAgo === null ? '' : daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : daysAgo < 7 ? `${daysAgo}d ago` : daysAgo < 30 ? `${Math.floor(daysAgo/7)}w ago` : `${Math.floor(daysAgo/30)}mo ago`

  return (
    <article style={{
      background:   '#0A0A0A',
      border:       '1px solid #1A1A1A',
      borderRadius: '12px',
      overflow:     'hidden',
      display:      'flex',
      flexDirection: 'column',
      transition:   'border-color 0.15s',
    }}>
      {/* Embed */}
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
        {video.isLive && (
          <span style={{
            position:   'absolute', top: 8, left: 8, zIndex: 2,
            background: '#C8102E', color: '#fff', borderRadius: '4px',
            fontSize:   '0.6rem', fontWeight: 900, padding: '2px 8px',
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            🔴 LIVE
          </span>
        )}
        {dur && (
          <span style={{
            position:   'absolute', bottom: 8, right: 8, zIndex: 2,
            background: 'rgba(0,0,0,0.8)', color: '#fff', borderRadius: '4px',
            fontSize:   '0.65rem', fontWeight: 700, padding: '2px 6px',
          }}>
            {dur}
          </span>
        )}
        <iframe
          src={`${video.embedUrl}?rel=0&loading=lazy`}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
          title={video.title}
        />
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {genreLabel && (
          <span style={{
            display:      'inline-block',
            fontSize:     '0.58rem', fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '0.1em', color, background: `${color}18`,
            border:       `1px solid ${color}30`, borderRadius: '4px', padding: '2px 7px',
            width:        'fit-content',
          }}>
            {genreLabel}
          </span>
        )}

        <h3 style={{
          margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#EEE', lineHeight: 1.3,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {video.title}
        </h3>

        <p style={{ margin: 0, fontSize: '0.75rem', color: '#D4AF37', fontWeight: 700 }}>
          {video.channelTitle}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 'auto' }}>
          {views && (
            <span style={{ fontSize: '0.65rem', color: '#555' }}>
              👁 {views} views
            </span>
          )}
          {timeAgo && (
            <span style={{ fontSize: '0.65rem', color: '#444' }}>
              {timeAgo}
            </span>
          )}
          <a
            href={video.watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginLeft: 'auto', fontSize: '0.65rem', color: '#888', textDecoration: 'none', fontWeight: 700 }}
          >
            YouTube ↗
          </a>
        </div>
      </div>
    </article>
  )
}
