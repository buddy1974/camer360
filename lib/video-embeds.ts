const YT_PATTERNS = [
  /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([\w-]+)/,
  /https?:\/\/youtu\.be\/([\w-]+)/,
  /https?:\/\/(?:www\.)?youtube\.com\/embed\/([\w-]+)/,
]

const TT_PATTERN = /https?:\/\/(?:www\.)?tiktok\.com\/@[\w.]+\/video\/(\d+)/

const WRAP = (inner: string) =>
  `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:24px 0">${inner}</div>`

const IFRAME_STYLE =
  'position:absolute;top:0;left:0;width:100%;height:100%;border:0;border-radius:12px'

function ytEmbed(videoId: string): string {
  return WRAP(
    `<iframe src="https://www.youtube-nocookie.com/embed/${videoId}?rel=0" ` +
    `style="${IFRAME_STYLE}" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen loading="lazy"></iframe>`
  )
}

function ttEmbed(videoId: string): string {
  return (
    `<div style="display:flex;justify-content:center;margin:24px 0">` +
    `<blockquote class="tiktok-embed" cite="https://www.tiktok.com/video/${videoId}" ` +
    `data-video-id="${videoId}" style="max-width:605px;min-width:325px">` +
    `<section></section></blockquote>` +
    `<script async src="https://www.tiktok.com/embed.js"></script></div>`
  )
}

/**
 * Server-side: scans raw HTML body for YouTube/TikTok URLs inside <a> tags or
 * bare in text nodes and replaces them with responsive embed iframes.
 */
export function injectVideoEmbeds(html: string): string {
  // Replace anchor tags wrapping a lone YouTube URL
  let result = html.replace(
    /<a[^>]*href="([^"]+)"[^>]*>\s*\1\s*<\/a>/gi,
    (match, url: string) => {
      for (const pat of YT_PATTERNS) {
        const m = url.match(pat)
        if (m) return ytEmbed(m[1])
      }
      const tt = url.match(TT_PATTERN)
      if (tt) return ttEmbed(tt[1])
      return match
    }
  )

  // Replace bare YouTube/TikTok URLs in text nodes (not inside tags)
  const parts = result.split(/(<[^>]+>)/)
  result = parts.map((part, i) => {
    if (i % 2 === 1) return part  // HTML tag — skip
    // text node
    for (const pat of YT_PATTERNS) {
      part = part.replace(new RegExp(pat.source, 'g'), (url) => {
        const m = url.match(pat)
        return m ? ytEmbed(m[1]) : url
      })
    }
    part = part.replace(new RegExp(TT_PATTERN.source, 'g'), (url) => {
      const m = url.match(TT_PATTERN)
      return m ? ttEmbed(m[1]) : url
    })
    return part
  }).join('')

  return result
}
