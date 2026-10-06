import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { articles } from '@/lib/db/schema'
import { openai, MODEL_FAST, completionText } from '@/lib/ai/client'

type Perspectives = { fanView: string; criticView: string; insiderView: string }

// Public endpoint: the caller may only name a published article. Prompt content
// comes from the database, never from the request, and results are cached per
// article so anonymous traffic cannot amplify OpenAI usage.
const getPerspectives = unstable_cache(
  async (articleId: number): Promise<Perspectives | null> => {
    const [article] = await db
      .select({ title: articles.title, excerpt: articles.excerpt, body: articles.body })
      .from(articles)
      .where(and(eq(articles.id, articleId), eq(articles.status, 'published')))
      .limit(1)
    if (!article) return null

    const prompt = `You are a cultural analyst writing for Camer360, West & Central Africa's premier entertainment magazine.

For this entertainment story, write three short, punchy perspectives (max 60 words each):

1. FAN VIEW 💜 — How fans and stans see this. Passionate, emotional, protective or celebratory.
2. CRITIC VIEW 🎯 — Sharp, objective analysis. What does this mean for the industry or artistry?
3. INDUSTRY INSIDER 🤫 — Behind-the-scenes business/power angle. What's really going on that the public doesn't see?

Article: "${article.title}"
${article.excerpt ? `Summary: ${article.excerpt}` : ''}
${article.body ? `Content: ${article.body.replace(/<[^>]+>/g, '').slice(0, 600)}` : ''}

Return ONLY valid JSON. No markdown fences.
{"fanView":"...","criticView":"...","insiderView":"..."}`

    const completion = await openai.chat.completions.create({
      model:      MODEL_FAST,
      max_tokens: 600,
      messages:   [{ role: 'user', content: prompt }],
    })
    const text  = completionText(completion) || '{}'
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean) as Perspectives
    if (!parsed.fanView) throw new Error('Empty perspectives') // thrown results are not cached
    return parsed
  },
  ['article-perspectives'],
  { revalidate: 60 * 60 * 24 * 7, tags: ['perspectives'] }
)

export async function POST(req: NextRequest) {
  const input = await req.json().catch(() => null) as { articleId?: unknown } | null
  const articleId = Number(input?.articleId)
  if (!Number.isInteger(articleId) || articleId <= 0) {
    return NextResponse.json({ error: 'articleId required' }, { status: 400 })
  }

  try {
    const perspectives = await getPerspectives(articleId)
    if (!perspectives) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(perspectives)
  } catch {
    return NextResponse.json({ error: 'Failed to generate perspectives' }, { status: 500 })
  }
}
