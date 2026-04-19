import { db } from '@/lib/db/client'
import { categories, articles } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'

const TARGET_SLUGS  = [
  'celebrities', 'music', 'film-tv', 'sport-stars', 'influencers', 'entrepreneurs', 'events',
  // Editorial content features
  'celebrity-timelines', 'family-trees', 'ones-to-watch', 'cultural-moments',
]
const CLEANUP_SLUGS = ['style', 'usa', 'europe']

/**
 * Idempotent migration to 7-category structure.
 * Skips immediately if all 7 categories already exist and cleanup slugs are gone.
 */
export async function runCategoryMigration(): Promise<{ ok: boolean; steps: string[]; skipped?: boolean }> {
  const steps: string[] = []

  try {
    const existing   = await db.select().from(categories)
    const bySlug     = Object.fromEntries(existing.map(c => [c.slug, c]))
    const missingTargets = TARGET_SLUGS.filter(s => !bySlug[s])
    const hasCleanup     = CLEANUP_SLUGS.some(s => !!bySlug[s])

    // Fast exit — nothing to do
    if (missingTargets.length === 0 && !hasCleanup) {
      return { ok: true, steps: [], skipped: true }
    }

    // ── Step 1: Create influencers if missing ─────────────────
    if (!bySlug['influencers']) {
      await db.insert(categories).values({
        slug: 'influencers', name: 'Influencers',
        description: 'Bloggers, social media personalities, content creators',
        sortOrder: 5,
      })
      steps.push('Created influencers')
    }

    // ── Step 2: Create events if missing ──────────────────────
    if (!bySlug['events']) {
      await db.insert(categories).values({
        slug: 'events', name: 'Events',
        description: 'Seminars, conferences, galas, festivals, cultural events',
        sortOrder: 7,
      })
      steps.push('Created events')
    }

    // ── Step 2b: Create editorial feature categories ──────────
    const featureCategories = [
      { slug: 'celebrity-timelines', name: 'Celebrity Timelines', description: 'Interactive career timelines for African celebrities',   sortOrder: 8  },
      { slug: 'family-trees',        name: 'Family Trees',        description: 'Entertainment dynasties and family connections',         sortOrder: 9  },
      { slug: 'ones-to-watch',       name: 'Ones to Watch',       description: 'Editorial picks for rising African stars',               sortOrder: 10 },
      { slug: 'cultural-moments',    name: 'Cultural Moments',    description: 'Defining moments in African entertainment and culture',  sortOrder: 11 },
    ]
    for (const cat of featureCategories) {
      if (!bySlug[cat.slug]) {
        await db.insert(categories).values(cat)
        steps.push(`Created ${cat.slug}`)
      }
    }

    // ── Refresh after inserts ─────────────────────────────────
    const refreshed     = await db.select().from(categories)
    const refreshBySlug = Object.fromEntries(refreshed.map(c => [c.slug, c]))

    // ── Step 3: Merge style → influencers ────────────────────
    if (refreshBySlug['style'] && refreshBySlug['influencers']) {
      await db.update(articles)
        .set({ categoryId: refreshBySlug['influencers'].id })
        .where(eq(articles.categoryId, refreshBySlug['style'].id))
      steps.push('Merged style → influencers')
    }

    // ── Step 4: Merge usa → celebrities ──────────────────────
    if (refreshBySlug['usa'] && refreshBySlug['celebrities']) {
      await db.update(articles)
        .set({ categoryId: refreshBySlug['celebrities'].id })
        .where(eq(articles.categoryId, refreshBySlug['usa'].id))
      steps.push('Merged usa → celebrities')
    }

    // ── Step 5: Merge europe → celebrities ───────────────────
    if (refreshBySlug['europe'] && refreshBySlug['celebrities']) {
      await db.update(articles)
        .set({ categoryId: refreshBySlug['celebrities'].id })
        .where(eq(articles.categoryId, refreshBySlug['europe'].id))
      steps.push('Merged europe → celebrities')
    }

    // ── Step 6: Delete removed categories ────────────────────
    const toDelete = CLEANUP_SLUGS.filter(s => refreshBySlug[s])
    if (toDelete.length) {
      await db.delete(categories)
        .where(inArray(categories.id, toDelete.map(s => refreshBySlug[s].id)))
      steps.push(`Deleted old categories: ${toDelete.join(', ')}`)
    }

    // ── Step 7: Fix sort orders ───────────────────────────────
    const final = await db.select().from(categories)
    const finalBySlug = Object.fromEntries(final.map(c => [c.slug, c]))
    if (finalBySlug['entrepreneurs']) {
      await db.update(categories)
        .set({ sortOrder: 6 })
        .where(eq(categories.id, finalBySlug['entrepreneurs'].id))
    }
    if (finalBySlug['events']) {
      await db.update(categories)
        .set({ sortOrder: 7 })
        .where(eq(categories.id, finalBySlug['events'].id))
    }
    steps.push('Fixed sort orders')

    console.log('[category-migration] completed:', steps)
    return { ok: true, steps }

  } catch (err) {
    console.error('[category-migration] error:', err)
    return { ok: false, steps, skipped: false }
  }
}
