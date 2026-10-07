/**
 * Cache revalidation after newsroom mutations — the same tag/paths the CMS
 * article routes revalidate. Errors are swallowed: outside a Next request
 * context (tests, scripts) revalidation is simply unavailable. This module
 * deliberately does nothing social (no Facebook, IndexNow or social_queue).
 */
import { revalidatePath, revalidateTag } from 'next/cache'
import type { RevalidateTarget } from './articles'

function safe(fn: () => void) {
  try { fn() } catch { /* not in a request context */ }
}

export function revalidateArticles(targets: RevalidateTarget[]): void {
  if (!targets.length) return
  safe(() => revalidateTag('articles', {}))
  safe(() => revalidatePath('/'))
  safe(() => revalidatePath('/[category]', 'layout'))
  safe(() => revalidatePath('/[category]/[slug]', 'page'))
  for (const t of targets) {
    if (!t.categorySlug) continue
    safe(() => revalidatePath(`/${t.categorySlug}/${t.slug}`))
    safe(() => revalidatePath(`/${t.categorySlug}`))
  }
}
