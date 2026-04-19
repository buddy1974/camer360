import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { categories, articles } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST() {
  const jar   = await cookies()
  const token = jar.get('admin_token')?.value
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const steps: string[] = []

  try {
    // ── Snapshot current categories ────────────────────────────
    const existing = await db.select().from(categories)
    const bySlug   = Object.fromEntries(existing.map(c => [c.slug, c]))

    // ── Step 1: Rename fashion-beauty → style ─────────────────
    if (bySlug['fashion-beauty'] && !bySlug['style']) {
      await db.update(categories)
        .set({ slug: 'style', name: 'Style', description: 'Fashion, beauty, lifestyle, trends', sortOrder: 5 })
        .where(eq(categories.id, bySlug['fashion-beauty'].id))
      steps.push('Renamed fashion-beauty → style')
    } else if (bySlug['style']) {
      steps.push('style already exists — skip rename')
    }

    // ── Step 2: Rename money-moves → entrepreneurs ─────────────
    if (bySlug['money-moves'] && !bySlug['entrepreneurs']) {
      await db.update(categories)
        .set({ slug: 'entrepreneurs', name: 'Entrepreneurs', description: 'African business moguls, Forbes Africa, wealth', sortOrder: 6 })
        .where(eq(categories.id, bySlug['money-moves'].id))
      steps.push('Renamed money-moves → entrepreneurs')
    } else if (bySlug['entrepreneurs']) {
      steps.push('entrepreneurs already exists — skip rename')
    }

    // ── Step 3: Create usa if missing ─────────────────────────
    if (!bySlug['usa']) {
      await db.insert(categories).values({
        slug: 'usa', name: 'USA',
        description: 'African American entertainment + Cameroonians in USA',
        sortOrder: 7,
      })
      steps.push('Created usa')
    } else {
      steps.push('usa already exists')
    }

    // ── Step 4: Create europe if missing ─────────────────────
    if (!bySlug['europe']) {
      await db.insert(categories).values({
        slug: 'europe', name: 'Europe',
        description: 'European entertainment + Cameroonians/Africans in Europe',
        sortOrder: 8,
      })
      steps.push('Created europe')
    } else {
      steps.push('europe already exists')
    }

    // ── Refresh after renames & inserts ───────────────────────
    const refreshed   = await db.select().from(categories)
    const refreshBySlug = Object.fromEntries(refreshed.map(c => [c.slug, c]))

    // ── Step 5: Merge → celebrities ──────────────────────────
    const mergeToCeleb = ['gossip', 'influencers', 'viral', 'exposed'].filter(s => refreshBySlug[s])
    if (mergeToCeleb.length && refreshBySlug['celebrities']) {
      const ids = mergeToCeleb.map(s => refreshBySlug[s].id)
      await db.update(articles)
        .set({ categoryId: refreshBySlug['celebrities'].id })
        .where(inArray(articles.categoryId, ids))
      steps.push(`Merged articles [${mergeToCeleb.join(', ')}] → celebrities`)
    }

    // ── Step 6: Merge real-talk → style ──────────────────────
    if (refreshBySlug['real-talk'] && refreshBySlug['style']) {
      await db.update(articles)
        .set({ categoryId: refreshBySlug['style'].id })
        .where(eq(articles.categoryId, refreshBySlug['real-talk'].id))
      steps.push('Merged articles real-talk → style')
    }

    // ── Step 7: Merge diaspora → usa ─────────────────────────
    if (refreshBySlug['diaspora'] && refreshBySlug['usa']) {
      await db.update(articles)
        .set({ categoryId: refreshBySlug['usa'].id })
        .where(eq(articles.categoryId, refreshBySlug['diaspora'].id))
      steps.push('Merged articles diaspora → usa')
    }

    // ── Step 8: Delete merged-away old categories ─────────────
    const toDelete = ['gossip', 'influencers', 'viral', 'exposed', 'real-talk', 'diaspora']
      .filter(s => refreshBySlug[s])
    if (toDelete.length) {
      await db.delete(categories)
        .where(inArray(categories.id, toDelete.map(s => refreshBySlug[s].id)))
      steps.push(`Deleted old categories: ${toDelete.join(', ')}`)
    }

    // ── Final state ───────────────────────────────────────────
    const final = await db.select().from(categories).orderBy(categories.sortOrder)
    return NextResponse.json({ ok: true, steps, finalCategories: final.map(c => c.slug) })

  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), steps }, { status: 500 })
  }
}
