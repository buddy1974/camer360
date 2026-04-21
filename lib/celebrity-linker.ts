import { CELEBRITIES } from '@/lib/celebrities'
import { SITE_URL } from '@/lib/constants'

const sorted = [...CELEBRITIES].sort(
  (a, b) => b.searchName.length - a.searchName.length
)

/**
 * Server-side utility: replaces celebrity name mentions in raw HTML bodies
 * with links to their hub pages. Skips text inside existing anchor tags.
 */
export function linkCelebrities(html: string): string {
  // Split into alternating [text, tag, text, tag, ...]
  const parts = html.split(/(<[^>]+>)/)
  let insideAnchor = false

  return parts
    .map((part, i) => {
      if (i % 2 === 1) {
        // HTML tag
        const lower = part.toLowerCase()
        if (/^<a[\s>]/.test(lower)) insideAnchor = true
        if (lower === '</a>')        insideAnchor = false
        return part
      }
      // Text node — skip if inside an anchor
      if (insideAnchor || !part.trim()) return part

      let text = part
      for (const celeb of sorted) {
        const esc   = celeb.searchName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(`(?<![\\w'])${esc}(?![\\w'])`, 'g')
        text = text.replace(
          regex,
          `<a href="${SITE_URL}/celebrities/${celeb.slug}" class="celeb-link">$&</a>`
        )
      }
      return text
    })
    .join('')
}
