import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { articles, categories } from '@/lib/db/schema'
import { socialQueue } from '@/lib/db/schema/social'
import { eq } from 'drizzle-orm'
import { revalidatePath, revalidateTag } from 'next/cache'
import { postArticleToSocial } from '@/server/lib/social'
import { sanitizeArticleBody } from '@/lib/sanitize'

export const dynamic = 'force-dynamic'

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const rows = await db.select().from(articles).where(eq(articles.id, parseInt(id))).limit(1)
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rows[0])
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id }  = await params
  const articleId = parseInt(id)
  const body = await req.json() as Partial<typeof articles.$inferInsert>
  const validCats = await db.select({ id: categories.id }).from(categories);
  const validCatIds = validCats.map(c => c.id);
  if (body.categoryId && !validCatIds.includes(Number(body.categoryId))) {
    body.categoryId = validCatIds[0] || 7;
  }

  const updateData = { ...body, updatedAt: new Date() };
  if (updateData.body) updateData.body = sanitizeArticleBody(updateData.body)
  if (body.status === 'published') {
    updateData.publishedAt = updateData.publishedAt || new Date();
  }
  // Read full article before update so we have all fields regardless of partial body
  const [existing] = await db
    .select({
      status:        articles.status,
      title:         articles.title,
      slug:          articles.slug,
      excerpt:       articles.excerpt,
      featuredImage: articles.featuredImage,
      categoryId:    articles.categoryId,
    })
    .from(articles)
    .where(eq(articles.id, articleId))
    .limit(1)
  const wasAlreadyPublished = existing?.status === 'published'

  await db.update(articles)
    .set(updateData)
    .where(eq(articles.id, articleId))

  revalidateTag('articles', {})

  // On first-time draft→published transition, queue a Facebook post and fire social triggers.
  // Use DB-fetched data (not body) so partial updates like {status:'published'} still work.
  if (body.status === 'published' && !wasAlreadyPublished && existing) {
    const catId = body.categoryId ?? existing.categoryId
    const slug  = body.slug  ?? existing.slug
    const title = body.title ?? existing.title

    const cat = catId
      ? await db.select({ slug: categories.slug, name: categories.name })
          .from(categories).where(eq(categories.id, catId)).limit(1)
      : []

    // Queue a pending Facebook post — n8n Facebook workflow picks this up on next run
    await db.insert(socialQueue).values({
      articleId: articleId,
      platform:  'facebook',
      status:    'pending',
    }).catch(console.error)

    if (cat[0] && slug && title) {
      postArticleToSocial({
        id:            articleId,
        title,
        slug,
        excerpt:       body.excerpt       ?? existing.excerpt       ?? undefined,
        featuredImage: body.featuredImage ?? existing.featuredImage ?? undefined,
        category:      cat[0],
      }).catch(console.error)

      const articleUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${cat[0].slug}/${slug}`
      fetch(`https://api.indexnow.org/indexnow?url=${encodeURIComponent(articleUrl)}&key=aa09538f68b64fe688308d20511485f0`, {
        method: 'GET',
      }).catch(() => {})
    }
  }

  revalidatePath('/')
  revalidatePath('/[category]', 'layout')
  revalidatePath('/[category]/[slug]', 'page')

  // Ping Facebook to re-scrape og:image (use DB slug/categoryId as fallback)
  const scrapeSlug   = body.slug       ?? existing?.slug
  const scrapeCatId  = body.categoryId ?? existing?.categoryId
  if (body.status === 'published' && scrapeSlug && scrapeCatId) {
    const catRes = await db.select({ slug: categories.slug })
      .from(categories).where(eq(categories.id, scrapeCatId)).limit(1);
    if (catRes[0]) {
      const articleUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${catRes[0].slug}/${scrapeSlug}`;
      fetch(`https://graph.facebook.com/?id=${encodeURIComponent(articleUrl)}&scrape=true`, {
        method: 'POST'
      }).catch(() => {});
      revalidatePath(`/${catRes[0].slug}/${scrapeSlug}`)
      revalidatePath(`/${catRes[0].slug}`)
    }
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await db.delete(articles).where(eq(articles.id, parseInt(id)))
  return NextResponse.json({ ok: true })
}
