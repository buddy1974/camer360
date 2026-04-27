import type { Metadata } from 'next'
import Link from 'next/link'
import { VideoCard } from '@/components/music/VideoCard'
import {
  getTrendingMusic, searchVideos, GENRE_QUERIES,
  type YTVideo, type Genre,
} from '@/lib/youtube'

export const revalidate = 3600  // rebuild every hour

const GENRES: { key: Genre | 'trending'; label: string; flag: string; region?: string }[] = [
  { key: 'trending',      label: 'Trending',          flag: '🔥', region: 'NG' },
  { key: 'afrobeats',     label: 'Afrobeats',          flag: '🎵' },
  { key: 'makossa',       label: 'Makossa',            flag: '🇨🇲' },
  { key: 'bikutsi',       label: 'Bikutsi',            flag: '🇨🇲' },
  { key: 'african_hiphop',label: 'African Hip-Hop',    flag: '🎤' },
  { key: 'african_rb',    label: 'African R&B',        flag: '🎶' },
  { key: 'global_collabs',label: 'Global Collabs',     flag: '🌍' },
]

// Curated fallback videos (shown when YouTube API key is not yet configured)
const FALLBACK: YTVideo[] = [
  { id: 'p3cFHfzBBzE', title: 'Burna Boy – Ye (Official Video)', description: '', channelTitle: 'Burna Boy', channelId: '', publishedAt: '2019-03-01', thumbnail: 'https://img.youtube.com/vi/p3cFHfzBBzE/hqdefault.jpg', viewCount: null, likeCount: null, duration: 'PT3M36S', tags: [], embedUrl: 'https://www.youtube-nocookie.com/embed/p3cFHfzBBzE', watchUrl: 'https://www.youtube.com/watch?v=p3cFHfzBBzE', isLive: false },
  { id: 'dRHRFfEmyaM', title: 'Wizkid – Essence ft. Tems (Official Video)', description: '', channelTitle: 'Wizkid', channelId: '', publishedAt: '2021-05-01', thumbnail: 'https://img.youtube.com/vi/dRHRFfEmyaM/hqdefault.jpg', viewCount: null, likeCount: null, duration: 'PT4M12S', tags: [], embedUrl: 'https://www.youtube-nocookie.com/embed/dRHRFfEmyaM', watchUrl: 'https://www.youtube.com/watch?v=dRHRFfEmyaM', isLive: false },
  { id: 'wFne-DFJDes', title: 'Locko – Pour Elle (Official Video)', description: '', channelTitle: 'Locko Official', channelId: '', publishedAt: '2023-06-01', thumbnail: 'https://img.youtube.com/vi/wFne-DFJDes/hqdefault.jpg', viewCount: null, likeCount: null, duration: 'PT3M55S', tags: [], embedUrl: 'https://www.youtube-nocookie.com/embed/wFne-DFJDes', watchUrl: 'https://www.youtube.com/watch?v=wFne-DFJDes', isLive: false },
  { id: 'yyqPZGaD3Ac', title: 'Davido – Fall (Official Video)', description: '', channelTitle: 'Davido Music Worldwide', channelId: '', publishedAt: '2017-08-01', thumbnail: 'https://img.youtube.com/vi/yyqPZGaD3Ac/hqdefault.jpg', viewCount: null, likeCount: null, duration: 'PT3M40S', tags: [], embedUrl: 'https://www.youtube-nocookie.com/embed/yyqPZGaD3Ac', watchUrl: 'https://www.youtube.com/watch?v=yyqPZGaD3Ac', isLive: false },
  { id: 'YiGNiMDkBlE', title: 'Charlotte Dipanda – Bamenda (Official Video)', description: '', channelTitle: 'Charlotte Dipanda', channelId: '', publishedAt: '2022-03-01', thumbnail: 'https://img.youtube.com/vi/YiGNiMDkBlE/hqdefault.jpg', viewCount: null, likeCount: null, duration: 'PT4M10S', tags: [], embedUrl: 'https://www.youtube-nocookie.com/embed/YiGNiMDkBlE', watchUrl: 'https://www.youtube.com/watch?v=YiGNiMDkBlE', isLive: false },
  { id: 'Ktl8K4dB_KY', title: 'Mr Eazi – Leg Over (Official Video)', description: '', channelTitle: 'Mr Eazi', channelId: '', publishedAt: '2016-12-01', thumbnail: 'https://img.youtube.com/vi/Ktl8K4dB_KY/hqdefault.jpg', viewCount: null, likeCount: null, duration: 'PT3M20S', tags: [], embedUrl: 'https://www.youtube-nocookie.com/embed/Ktl8K4dB_KY', watchUrl: 'https://www.youtube.com/watch?v=Ktl8K4dB_KY', isLive: false },
]

export async function generateMetadata({ searchParams }: { searchParams: Promise<{genre?: string}> }): Promise<Metadata> {
  const p = await searchParams
  const genre = GENRES.find(g => g.key === p.genre) ?? GENRES[0]
  return {
    title:       `${genre.label} Music Videos 2026 | Camer360`,
    description: `Watch the hottest ${genre.label} music videos — Cameroon, Nigeria, Ghana and across Africa.`,
  }
}

export default async function MusicVideosPage({ searchParams }: { searchParams: Promise<{genre?: string; region?: string}> }) {
  const p      = await searchParams
  const active = (p.genre ?? 'trending') as Genre | 'trending'
  const region = p.region ?? 'NG'

  const hasApiKey = !!process.env['YOUTUBE_API_KEY']
  let videos: YTVideo[] = []
  let usedFallback = false

  if (hasApiKey) {
    try {
      if (active === 'trending') {
        videos = await getTrendingMusic(region, 12)
      } else {
        const preset = GENRE_QUERIES[active as Genre]
        if (preset) {
          videos = await searchVideos(preset.q, 12, preset.regions[0])
        }
      }
    } catch (err) {
      console.error('[/music/videos] YouTube API error:', err)
      // fall through to fallback
    }
  }

  if (videos.length === 0) {
    videos = FALLBACK
    usedFallback = true
  }

  const activeGenre = GENRES.find(g => g.key === active)

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 80px' }}>

      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '20px', padding: '3px 12px' }}>
            Music Videos
          </span>
          {usedFallback && !hasApiKey && (
            <span style={{ fontSize: '0.6rem', color: '#444', background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '2px 8px' }}>
              Add YOUTUBE_API_KEY to Vercel for live trending data
            </span>
          )}
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--primary-dark)', margin: '0 0 8px', lineHeight: 1.1 }}>
          {activeGenre?.flag} {activeGenre?.label ?? 'Music Videos'}
        </h1>
        <p style={{ color: '#666', fontSize: '0.85rem', margin: 0, maxWidth: '500px', lineHeight: 1.7 }}>
          The hottest African music videos — Afrobeats, Makossa, Hip-Hop, R&amp;B and global crossover.
        </p>
      </div>

      {/* Genre filter tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {GENRES.map(g => (
          <Link
            key={g.key}
            href={`/music/videos?genre=${g.key}`}
            style={{
              display:      'inline-flex',
              alignItems:   'center',
              gap:          '5px',
              padding:      '6px 14px',
              borderRadius: '20px',
              fontSize:     '0.75rem',
              fontWeight:   700,
              textDecoration: 'none',
              background:   g.key === active ? '#D4AF37' : '#111',
              color:        g.key === active ? '#000'    : '#666',
              border:       `1px solid ${g.key === active ? '#D4AF37' : '#1E1E1E'}`,
              transition:   'all 0.15s',
            }}
          >
            <span>{g.flag}</span>
            <span>{g.label}</span>
          </Link>
        ))}
      </div>

      {/* Region selector (shown for trending) */}
      {active === 'trending' && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.65rem', color: '#444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', alignSelf: 'center' }}>
            Region:
          </span>
          {[{code:'NG',name:'🇳🇬 Nigeria'},{code:'GH',name:'🇬🇭 Ghana'},{code:'CM',name:'🇨🇲 Cameroon'},{code:'ZA',name:'🇿🇦 S. Africa'},{code:'US',name:'🇺🇸 Global'}].map(r => (
            <Link
              key={r.code}
              href={`/music/videos?genre=trending&region=${r.code}`}
              style={{
                padding:      '4px 10px',
                borderRadius: '12px',
                fontSize:     '0.68rem',
                fontWeight:   700,
                textDecoration: 'none',
                background:   r.code === region ? '#1A1A1A' : 'transparent',
                color:        r.code === region ? '#EEE'    : '#555',
                border:       `1px solid ${r.code === region ? '#333' : '#1A1A1A'}`,
              }}
            >
              {r.name}
            </Link>
          ))}
        </div>
      )}

      {/* Video grid */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap:                 '20px',
      }}>
        {videos.map((v, i) => (
          <VideoCard
            key={v.id}
            video={v}
            genreLabel={activeGenre?.label}
            priority={i < 2}
          />
        ))}
      </div>

      {/* Links */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '40px', flexWrap: 'wrap' }}>
        <Link href="/music/afrobeats" style={{ fontSize: '0.72rem', fontWeight: 700, color: '#D4AF37', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          🔥 Afrobeats Chart →
        </Link>
        <Link href="/music/new-releases" style={{ fontSize: '0.72rem', fontWeight: 700, color: '#666', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          New Releases →
        </Link>
        <Link href="/music" style={{ fontSize: '0.72rem', fontWeight: 700, color: '#444', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Music Stories →
        </Link>
      </div>
    </div>
  )
}
