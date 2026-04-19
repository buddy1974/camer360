import { db } from '@/lib/db/client'
import { categories, articles } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'

const TARGET_SLUGS = ['celebrities', 'music', 'film-tv', 'sport-stars', 'style', 'entrepreneurs', 'usa', 'europe']

/**
 * Idempotent migration to 8-category structure.
 * Skips immediately if all 8 categories already exist.
 */
export async function runCategoryMigration(): Promise<{ ok: boolean; steps: string[]; skipped?: boolean }> {
  const steps: string[] = []

  try {
    const existing  = await db.select().from(categories)
    const bySlug    = Object.fromEntries(existing.map(c => [c.slug, c]))
    const missingTargets = TARGET_SLUGS.filter(s => !bySlug[s])

    // Fast exit — nothing to do
    if (missingTargets.length === 0) {
      return { ok: true, steps: [], skipped: true }
    }

    // ── Step 1: Rename fashion-beauty → style ──────────────────
    if (bySlug['fashion-beauty'] && !bySlug['style']) {
      await db.update(categories)
        .set({ slug: 'style', name: 'Style', description: 'Fashion, beauty, lifestyle, trends', sortOrder: 5 })
        .where(eq(categories.id, bySlug['fashion-beauty'].id))
      steps.push('Renamed fashion-beauty → style')
    }

    // ── Step 2: Rename money-moves → entrepreneurs ─────────────
    if (bySlug['money-moves'] && !bySlug['entrepreneurs']) {
      await db.update(categories)
        .set({ slug: 'entrepreneurs', name: 'Entrepreneurs', description: 'African business moguls, Forbes Africa, wealth', sortOrder: 6 })
        .where(eq(categories.id, bySlug['money-moves'].id))
      steps.push('Renamed money-moves → entrepreneurs')
    }

    // ── Step 3: Create usa if missing ──────────────────────────
    if (!bySlug['usa']) {
      await db.insert(categories).values({
        slug: 'usa', name: 'USA',
        description: 'African American entertainment + Cameroonians in USA',
        sortOrder: 7,
      })
      steps.push('Created usa')
    }

    // ── Step 4: Create europe if missing ───────────────────────
    if (!bySlug['europe']) {
      await db.insert(categories).values({
        slug: 'europe', name: 'Europe',
        description: 'European entertainment + Cameroonians/Africans in Europe',
        sortOrder: 8,
      })
      steps.push('Created europe')
    }

    // ── Refresh after renames & inserts ────────────────────────
    const refreshed    = await db.select().from(categories)
    const refreshBySlug = Object.fromEntries(refreshed.map(c => [c.slug, c]))

    // ── Step 5: Merge → celebrities ────────────────────────────
    const mergeToCeleb = ['gossip', 'influencers', 'viral', 'exposed'].filter(s => refreshBySlug[s])
    if (mergeToCeleb.length && refreshBySlug['celebrities']) {
      await db.update(articles)
        .set({ categoryId: refreshBySlug['celebrities'].id })
        .where(inArray(articles.categoryId, mergeToCeleb.map(s => refreshBySlug[s].id)))
      steps.push(`Merged [${mergeToCeleb.join(', ')}] → celebrities`)
    }

    // ── Step 6: Merge real-talk → style ────────────────────────
    if (refreshBySlug['real-talk'] && refreshBySlug['style']) {
      await db.update(articles)
        .set({ categoryId: refreshBySlug['style'].id })
        .where(eq(articles.categoryId, refreshBySlug['real-talk'].id))
      steps.push('Merged real-talk → style')
    }

    // ── Step 7: Merge diaspora → usa ───────────────────────────
    if (refreshBySlug['diaspora'] && refreshBySlug['usa']) {
      await db.update(articles)
        .set({ categoryId: refreshBySlug['usa'].id })
        .where(eq(articles.categoryId, refreshBySlug['diaspora'].id))
      steps.push('Merged diaspora → usa')
    }

    // ── Step 8: Delete merged-away old categories ───────────────
    const toDelete = ['gossip', 'influencers', 'viral', 'exposed', 'real-talk', 'diaspora']
      .filter(s => refreshBySlug[s])
    if (toDelete.length) {
      await db.delete(categories)
        .where(inArray(categories.id, toDelete.map(s => refreshBySlug[s].id)))
      steps.push(`Deleted old categories: ${toDelete.join(', ')}`)
    }

    console.log('[category-migration] completed:', steps)
    return { ok: true, steps }

  } catch (err) {
    console.error('[category-migration] error:', err)
    return { ok: false, steps, skipped: false }
  }
}
