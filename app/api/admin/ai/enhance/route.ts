import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/lib/db/client'
import { authors } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  const { title, body, type } = await req.json() as {
    title: string; body: string; type: 'meta' | 'excerpt' | 'full' | 'quick'
  }

  const prompt = type === 'quick'
    ? `You are a sharp senior editor at Camer360, West & Central Africa's premier entertainment magazine.

Given raw text (which may be in French or another language), produce a complete publication-ready article.

Rules:
- Translate to English if needed
- Rewrite in Camer360 style: bold, punchy, celebrity-forward, culturally fluent
- Lead with names and drama, not institutions
- Category must be one of: celebrities|music|film-tv|sport-stars|influencers|entrepreneurs|events

Return ONLY valid JSON. No markdown fences. No explanation.
{
  "title": "max 80 chars, punchy entertainment headline — lead with celebrity name if possible",
  "slug": "lowercase-url-slug-from-title",
  "excerpt": "max 200 chars, one dramatic teaser sentence that creates urgency or curiosity",
  "enhanced_body": "<p>Full article HTML, min 4 paragraphs. Use only p, h2, h3, ul, li tags. No inline styles. Entertainment tone: vivid, culturally aware, boldly opinionated.</p>",
  "category_slug": "one of: celebrities|music|film-tv|sport-stars|influencers|entrepreneurs|events",
  "meta_title": "max 60 chars SEO title",
  "meta_desc": "max 155 chars SEO description",
  "keywords": ["keyword1","keyword2","keyword3","keyword4","keyword5"]
}

Raw text:
${body}`

    : type === 'meta'
    ? `Generate SEO meta_title (max 60 chars) and meta_desc (max 155 chars) for this African entertainment article.
Title: ${title}
Body: ${body.slice(0, 500)}
Return JSON only: {"meta_title":"...","meta_desc":"..."}`

    : type === 'excerpt'
    ? `You are a senior entertainment editor at Camer360, West & Central Africa's premier celebrity and culture magazine. Write one dramatic, punchy teaser sentence (max 200 chars) that makes readers click.
Title: ${title}
Body: ${body.slice(0, 800)}
Return JSON only: {"excerpt":"..."}`

    : `You are the top entertainment editor at Camer360, West & Central Africa's premier celebrity and culture magazine. Your editorial voice is bold, punchy, dramatic — think African celebrity gossip meets premium culture journalism.

Editorial tone:
- Celebrity-first: lead every angle with names and personality, never institutions
- Use African cultural references naturally (Afrobeats, Cameroonian slang, regional context)
- Drama is your tool — amplify emotion, conflict, triumph, scandal
- Never fabricate — enhance what's there, don't invent
- Social copy should read like a friend texting you breaking entertainment news

Given the article title and body, return a JSON object with EXACTLY these fields:
- title: punchy entertainment headline, max 80 chars. Bold. Use celebrity names, music terms, culture hooks.
- meta_title: SEO title, max 60 chars
- meta_desc: SEO description, max 155 chars
- excerpt: one dramatic teaser sentence that creates urgency or curiosity, max 200 chars
- enhanced_body: full article as publication-ready HTML using only <p>, <h2>, <h3>, <ul>, <li> tags. No inline styles. Min 4 paragraphs. Bold, vivid, culturally fluent.
- tiktok_script: exactly this format: "HOOK: [3-second hook, max 10 words] | FACTS: [3 punchy facts separated by commas] | CTA: [call to action, max 8 words]"
- twitter_thread: array of exactly 5 tweet strings — tweet 1: dramatic hook under 240 chars; tweets 2-4: one key fact each under 240 chars; tweet 5: hot take or opinion + "[LINK]"
- whatsapp_message: exactly 3 sentences, max 300 chars total — sentence 1: the headline fact; sentence 2: the juiciest detail; sentence 3: "Full story: [LINK]"
- facebook_post: 2-3 sentences + 1 engagement question + "[LINK]", max 400 chars total

Title: ${title}
Body: ${body}

Return ONLY valid JSON. No markdown fences. No explanation.
{"title":"...","meta_title":"...","meta_desc":"...","excerpt":"...","enhanced_body":"...","tiktok_script":"...","twitter_thread":["...","...","...","...","..."],"whatsapp_message":"...","facebook_post":"..."}`

  const message = await claude.messages.create({
    model:      'claude-sonnet-4-6',
    max_tokens: type === 'quick' ? 4000 : 2000,
    messages:   [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
  try {
    const clean  = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    if (type === 'full') {
      const authorSlugs = ['nkemdirim-tabi','ebot-ayuk','cynthia-mbah','fidelis-ngong','solange-achu','emeka-tambe','bridget-forjindam','ndong-eyong']
      const randomSlug  = authorSlugs[Math.floor(Math.random() * authorSlugs.length)]
      const [author]    = await db.select({ id: authors.id, name: authors.name, slug: authors.slug, avatarUrl: authors.avatarUrl })
        .from(authors).where(eq(authors.slug, randomSlug)).limit(1)
      return NextResponse.json({ ...parsed, author_id: author?.id, author_name: author?.name, author_avatar: author?.avatarUrl })
    }

    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ error: 'Parse failed', raw: text }, { status: 500 })
  }
}
