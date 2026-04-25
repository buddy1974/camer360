// Unified embed detection + HTML generation for 8+ platforms
// Used both client-side (EmbedModal preview) and server-side (injectVideoEmbeds)

const WRAP16_9 = (inner: string) =>
  `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:24px 0">${inner}</div>`

const IFRAME = (src: string, extras = '') =>
  `<iframe src="${src}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;border-radius:12px" ` +
  `allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture;fullscreen" allowfullscreen loading="lazy" ${extras}></iframe>`

// ─── YouTube ───────────────────────────────────────────────────────────────
const YT_RE = [
  /https?:\/\/(?:www\.)?youtube\.com\/watch\?(?:[^#&]*&)*v=([\w-]{11})/,
  /https?:\/\/youtu\.be\/([\w-]{11})/,
  /https?:\/\/(?:www\.)?youtube\.com\/embed\/([\w-]{11})/,
  /https?:\/\/(?:www\.)?youtube\.com\/shorts\/([\w-]{11})/,
  /https?:\/\/(?:www\.)?youtube\.com\/live\/([\w-]{11})/,
]

function embedYouTube(url: string): string | null {
  for (const re of YT_RE) {
    const m = url.match(re)
    if (m) return WRAP16_9(IFRAME(`https://www.youtube-nocookie.com/embed/${m[1]}?rel=0`))
  }
  return null
}

// ─── TikTok ────────────────────────────────────────────────────────────────
const TT_RE = /https?:\/\/(?:www\.)?tiktok\.com\/@[\w.]+\/video\/(\d+)/

function embedTikTok(url: string): string | null {
  const m = url.match(TT_RE)
  if (!m) return null
  return (
    `<div style="display:flex;justify-content:center;margin:24px 0">` +
    `<blockquote class="tiktok-embed" cite="${url}" data-video-id="${m[1]}" ` +
    `style="max-width:605px;min-width:325px"><section></section></blockquote>` +
    `<script async src="https://www.tiktok.com/embed.js"></script></div>`
  )
}

// ─── Instagram ─────────────────────────────────────────────────────────────
const IG_RE = /https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/([\w-]+)\/?/

function embedInstagram(url: string): string | null {
  if (!IG_RE.test(url)) return null
  const permaUrl = url.split('?')[0].replace(/\/?$/, '/')
  return (
    `<div style="display:flex;justify-content:center;margin:24px 0">` +
    `<blockquote class="instagram-media" data-instgrm-captioned ` +
    `data-instgrm-permalink="${permaUrl}" data-instgrm-version="14" ` +
    `style="max-width:540px;min-width:326px;width:100%">` +
    `<a href="${permaUrl}">View on Instagram</a></blockquote>` +
    `<script async src="https://www.instagram.com/embed.js"></script></div>`
  )
}

// ─── Vimeo ─────────────────────────────────────────────────────────────────
const VIMEO_RE = /https?:\/\/(?:www\.)?vimeo\.com\/(?:video\/)?(\d+)/

function embedVimeo(url: string): string | null {
  const m = url.match(VIMEO_RE)
  if (!m) return null
  return WRAP16_9(IFRAME(`https://player.vimeo.com/video/${m[1]}?title=0&byline=0`))
}

// ─── Twitter / X ───────────────────────────────────────────────────────────
const TW_RE = /https?:\/\/(?:www\.)?(?:twitter|x)\.com\/\w+\/status\/(\d+)/

function embedTwitter(url: string): string | null {
  if (!TW_RE.test(url)) return null
  const canonical = url.replace('x.com', 'twitter.com').split('?')[0]
  return (
    `<div style="display:flex;justify-content:center;margin:24px 0">` +
    `<blockquote class="twitter-tweet" data-dnt="true">` +
    `<a href="${canonical}">Loading tweet...</a></blockquote>` +
    `<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script></div>`
  )
}

// ─── Facebook video / post ─────────────────────────────────────────────────
const FB_VIDEO_RE = /https?:\/\/(?:www\.)?facebook\.com\/(?:watch\/?\?v=\d+|[^/]+\/videos\/\d+)/
const FB_POST_RE  = /https?:\/\/(?:www\.)?facebook\.com\/(?:permalink|[^/]+\/posts)\//

function embedFacebook(url: string): string | null {
  if (!FB_VIDEO_RE.test(url) && !FB_POST_RE.test(url)) return null
  const type  = FB_VIDEO_RE.test(url) ? 'video' : 'post'
  const src   = `https://www.facebook.com/plugins/${type}.php?href=${encodeURIComponent(url)}&width=560&show_text=true`
  return (
    `<div style="display:flex;justify-content:center;margin:24px 0">` +
    `<iframe src="${src}" width="560" height="314" style="border:none;overflow:hidden;border-radius:12px" ` +
    `allowfullscreen allow="autoplay;clipboard-write;encrypted-media;picture-in-picture;web-share"></iframe></div>`
  )
}

// ─── Twitch ────────────────────────────────────────────────────────────────
const TWITCH_CHANNEL_RE = /https?:\/\/(?:www\.)?twitch\.tv\/([\w]+)(?:\/?$|\?)/
const TWITCH_CLIP_RE    = /https?:\/\/(?:www\.)?twitch\.tv\/[\w]+\/clip\/([\w-]+)/
const TWITCH_VOD_RE     = /https?:\/\/(?:www\.)?twitch\.tv\/videos\/(\d+)/

function embedTwitch(url: string): string | null {
  const clip = url.match(TWITCH_CLIP_RE)
  if (clip) return WRAP16_9(IFRAME(`https://clips.twitch.tv/embed?clip=${clip[1]}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'camer360.com'}`))
  const vod = url.match(TWITCH_VOD_RE)
  if (vod) return WRAP16_9(IFRAME(`https://player.twitch.tv/?video=${vod[1]}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'camer360.com'}`))
  const ch = url.match(TWITCH_CHANNEL_RE)
  if (ch) return WRAP16_9(IFRAME(`https://player.twitch.tv/?channel=${ch[1]}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'camer360.com'}`))
  return null
}

// ─── Spotify ───────────────────────────────────────────────────────────────
const SPOTIFY_RE = /https?:\/\/open\.spotify\.com\/(track|playlist|album|artist|episode|show)\/([\w]+)/

function embedSpotify(url: string): string | null {
  const m = url.match(SPOTIFY_RE)
  if (!m) return null
  const [, type, id] = m
  const height = type === 'track' || type === 'episode' ? '152' : '352'
  return (
    `<div style="margin:24px 0">` +
    `<iframe src="https://open.spotify.com/embed/${type}/${id}" width="100%" height="${height}" ` +
    `style="border-radius:12px;border:none" allow="autoplay;clipboard-write;encrypted-media;fullscreen;picture-in-picture" loading="lazy"></iframe></div>`
  )
}

// ─── Audiomack ─────────────────────────────────────────────────────────────
// URL forms: audiomack.com/artist/song/SLUG  |  audiomack.com/artist/album/SLUG
const AM_TRACK_RE  = /https?:\/\/(?:www\.)?audiomack\.com\/([\w-]+)\/(song|album|playlist)\/([\w-]+)/

function embedAudiomack(url: string): string | null {
  const m = url.match(AM_TRACK_RE)
  if (!m) return null
  const [, artist, type, slug] = m
  const embedType = type === 'album' ? 'album' : type === 'playlist' ? 'playlist' : 'song'
  return (
    `<div style="margin:24px 0">` +
    `<iframe src="https://audiomack.com/embed/${artist}/${embedType}/${slug}" ` +
    `style="width:100%;height:252px;border-radius:12px;border:none" ` +
    `allow="autoplay" loading="lazy"></iframe></div>`
  )
}

// ─── Boomplay ──────────────────────────────────────────────────────────────
const BOOMPLAY_RE = /https?:\/\/(?:www\.)?boomplay\.com\/songs?\/(\d+)/

function embedBoomplay(url: string): string | null {
  const m = url.match(BOOMPLAY_RE)
  if (!m) return null
  return (
    `<div style="margin:24px 0">` +
    `<iframe src="https://www.boomplay.com/embed/song/${m[1]}" ` +
    `style="width:100%;height:200px;border-radius:12px;border:none" loading="lazy"></iframe></div>`
  )
}

// ─── Public API ────────────────────────────────────────────────────────────

export type Platform = 'youtube' | 'tiktok' | 'instagram' | 'vimeo' | 'twitter' | 'facebook' | 'twitch' | 'spotify' | 'audiomack' | 'boomplay' | null

export function detectPlatform(url: string): Platform {
  if (YT_RE.some(r => r.test(url))) return 'youtube'
  if (TT_RE.test(url))  return 'tiktok'
  if (IG_RE.test(url))  return 'instagram'
  if (VIMEO_RE.test(url)) return 'vimeo'
  if (TW_RE.test(url))  return 'twitter'
  if (FB_VIDEO_RE.test(url) || FB_POST_RE.test(url)) return 'facebook'
  if (TWITCH_CHANNEL_RE.test(url) || TWITCH_CLIP_RE.test(url) || TWITCH_VOD_RE.test(url)) return 'twitch'
  if (SPOTIFY_RE.test(url))   return 'spotify'
  if (AM_TRACK_RE.test(url))  return 'audiomack'
  if (BOOMPLAY_RE.test(url))  return 'boomplay'
  return null
}

export function platformLabel(p: Platform): string {
  const map: Record<NonNullable<Platform>, string> = {
    youtube: 'YouTube', tiktok: 'TikTok', instagram: 'Instagram', vimeo: 'Vimeo',
    twitter: 'Twitter / X', facebook: 'Facebook', twitch: 'Twitch', spotify: 'Spotify',
    audiomack: 'Audiomack', boomplay: 'Boomplay',
  }
  return p ? map[p] : 'Unknown'
}

export function platformIcon(p: Platform): string {
  const map: Record<NonNullable<Platform>, string> = {
    youtube: '▶️', tiktok: '🎵', instagram: '📸', vimeo: '🎬',
    twitter: '🐦', facebook: '📘', twitch: '🎮', spotify: '🎧',
    audiomack: '🎶', boomplay: '🎼',
  }
  return p ? map[p] : '📺'
}

/** Generate embed HTML from a URL. Returns null if URL is not a recognised platform. */
export function generateEmbed(url: string): string | null {
  return (
    embedYouTube(url)    ??
    embedTikTok(url)     ??
    embedInstagram(url)  ??
    embedVimeo(url)      ??
    embedTwitter(url)    ??
    embedFacebook(url)   ??
    embedTwitch(url)     ??
    embedSpotify(url)    ??
    embedAudiomack(url)  ??
    embedBoomplay(url)   ??
    null
  )
}

/**
 * Server-side: scan article body HTML for bare platform URLs in text nodes and
 * <a> tags, replace them with responsive embed HTML.
 */
export function injectVideoEmbeds(html: string): string {
  // Replace <a href="URL">URL</a> patterns where the text equals the href
  let result = html.replace(
    /<a[^>]*href="([^"]+)"[^>]*>\s*\1\s*<\/a>/gi,
    (match, url: string) => generateEmbed(url) ?? match
  )

  // Replace bare URLs in text nodes (not inside tags)
  const URL_RE = /https?:\/\/\S+/g
  const parts  = result.split(/(<[^>]+>)/)
  result = parts.map((part, i) => {
    if (i % 2 === 1) return part  // HTML tag token — skip
    return part.replace(URL_RE, (url) => generateEmbed(url) ?? url)
  }).join('')

  return result
}
