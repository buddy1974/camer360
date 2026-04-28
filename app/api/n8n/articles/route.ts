import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { articles } from '@/lib/db/schema/articles'
import { categories } from '@/lib/db/schema/categories'
import { ingestedContent } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import slugify from 'slugify'

function authCheck(req: NextRequest) {
  return req.headers.get('x-api-key') === (process.env.AUTOMATION_API_KEY ?? process.env.NEXT_PUBLIC_AUTOMATION_API_KEY)
}

// POST /api/n8n/articles — create a draft article from AI-enhanced content
export async function POST(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const {
    title, slug: rawSlug, excerpt, body: articleBody, category_slug,
    meta_title, meta_desc, source_url, language,
    featured_image, image_alt, image_caption, country,
    queue_id,  // optional: if provided, queue item is auto-rejected on failure
  } = body as Record<string, unknown>

  if (!title || !articleBody || !category_slug) {
    return NextResponse.json({
      ok: false,
      error: 'Missing required fields: title, body, category_slug',
    }, { status: 400 })
  }

  try {
    // Resolve category — exact slug first, fall back to celebrities
    let [cat] = await db.select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, category_slug as string))
      .limit(1)

    if (!cat) {
      const [fallback] = await db.select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, 'celebrities'))
        .limit(1)
      cat = fallback
    }

    if (!cat) {
      return NextResponse.json({ ok: false, error: `Category not found: ${category_slug}` }, { status: 400 })
    }

    const baseSlug = rawSlug
      ? slugify(rawSlug as string, { lower: true, strict: true })
      : slugify(title as string, { lower: true, strict: true })
    const slug = `${baseSlug}-${Date.now().toString(36)}`

    const result = await db.insert(articles).values({
      title:         title as string,
      slug,
      excerpt:       (excerpt as string) ?? '',
      body:          articleBody as string,
      categoryId:    cat.id,
      metaTitle:     (meta_title as string) ?? (title as string).slice(0, 160),
      metaDesc:      (meta_desc as string) ?? (excerpt as string)?.slice(0, 320) ?? '',
      canonicalUrl:  (source_url as string) ?? '',
      featuredImage: (featured_image as string) ?? null,
      imageAlt:      (image_alt as string) ?? null,
      imageCaption:  (image_caption as string) ?? null,
      country:       (country as string) ?? null,
      status:        'draft',
      aiGenerated:   true,
      lang:          (language as string) ?? 'en',
    }).$returningId()

    const newId = result[0].id
    return NextResponse.json({ ok: true, id: newId, slug })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[n8n/articles] Article creation failed:', message)

    // Self-heal: if the caller passed queue_id, mark the queue item rejected
    // so it doesn't stay stuck in 'processing' when n8n fails to call PATCH
    if (queue_id && typeof queue_id === 'number') {
      try {
        await db
          .update(ingestedContent)
          .set({
            status:       'rejected',
            rejectReason: `article_creation_failed: ${message.slice(0, 500)}`,
            lastError:    message.slice(0, 2000),
          })
          .where(eq(ingestedContent.id, queue_id))
      } catch {
        // lastError column not yet migrated
        try {
          await db
            .update(ingestedContent)
            .set({
              status:       'rejected',
              rejectReason: `article_creation_failed: ${message.slice(0, 500)}`,
            })
            .where(eq(ingestedContent.id, queue_id))
        } catch { /* ignore secondary failure */ }
      }
    }

    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
