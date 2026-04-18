import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { articles } from '@/lib/db/schema/articles'
import { categories } from '@/lib/db/schema/categories'
import { eq } from 'drizzle-orm'
import slugify from 'slugify'

function authCheck(req: NextRequest) {
  return req.headers.get('x-api-key') === (process.env.AUTOMATION_API_KEY ?? process.env.NEXT_PUBLIC_AUTOMATION_API_KEY)
}

// POST /api/n8n/articles — create a draft article from AI-enhanced content
export async function POST(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, slug: rawSlug, excerpt, body: articleBody, category_slug,
          meta_title, meta_desc, source_url, language,
          featured_image, image_alt, image_caption } = body

  if (!title || !articleBody || !category_slug) {
    return NextResponse.json({ error: 'Missing required fields: title, body, category_slug' }, { status: 400 })
  }

  // Resolve category
  const [cat] = await db.select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, category_slug))
    .limit(1)

  if (!cat) {
    return NextResponse.json({ error: `Category not found: ${category_slug}` }, { status: 400 })
  }

  // Build unique slug
  const baseSlug = rawSlug
    ? slugify(rawSlug, { lower: true, strict: true })
    : slugify(title, { lower: true, strict: true })
  const slug = `${baseSlug}-${Date.now().toString(36)}`

  const result = await db.insert(articles).values({
    title,
    slug,
    excerpt: excerpt ?? '',
    body: articleBody,
    categoryId: cat.id,
    metaTitle: meta_title ?? title.slice(0, 160),
    metaDesc: meta_desc ?? excerpt?.slice(0, 320) ?? '',
    canonicalUrl: source_url ?? '',
    featuredImage: featured_image ?? null,
    imageAlt: image_alt ?? null,
    imageCaption: image_caption ?? null,
    status: 'draft',
    aiGenerated: true,
    lang: language ?? 'en',
  }).$returningId()

  const newId = result[0].id
  return NextResponse.json({ ok: true, id: newId, slug })
}
