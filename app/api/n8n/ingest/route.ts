import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { db } from '@/lib/db/client'
import { ingestedContent } from '@/lib/db/schema'

function authCheck(req: NextRequest) {
  return req.headers.get('x-api-key') === (process.env['AUTOMATION_API_KEY'] ?? process.env['NEXT_PUBLIC_AUTOMATION_API_KEY'])
}

function contentHash(title: string, url: string): string {
  return createHash('sha256').update(`${title}|${url}`).digest('hex').slice(0, 64)
}

const KEEP_KEYWORDS = [
  'music', 'album', 'concert', 'celebrity', 'nollywood', 'afrobeats',
  'tour', 'award', 'film', 'movie', 'entertainment', 'singer', 'actor',
  'actress', 'rapper', 'fifa', 'transfer', 'goal',
]

const REJECT_KEYWORDS = [
  'shot', 'killed', 'dead', 'death', 'police', 'army', 'court',
  'arrested', 'election', 'governor', 'apc', 'pdp', 'nysc',
  'xenophob', 'immigrant worker',
]

function classifyContent(title: string, body: string): 'keep' | 'reject' | 'neutral' {
  const haystack = `${title} ${body}`.toLowerCase()

  if (KEEP_KEYWORDS.some(kw => haystack.includes(kw))) return 'keep'
  if (REJECT_KEYWORDS.some(kw => haystack.includes(kw))) return 'reject'
  return 'neutral'
}

// POST /api/n8n/ingest — receive RSS items from n8n, filter + dedup + store in MySQL queue
export async function POST(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const items: Array<{
    source_name?: string
    source_url?: string
    raw_title: string
    raw_body?: string
    raw_image_url?: string
    language?: string
  }> = Array.isArray(body) ? body : [body]

  const results = await Promise.allSettled(items.map(async (item) => {
    const title = (item.raw_title ?? '').trim().slice(0, 319)
    if (!title) return { skipped: true, reason: 'empty title' }

    const rawBody = item.raw_body ?? ''
    const classification = classifyContent(title, rawBody)

    if (classification === 'reject') {
      // Store immediately as rejected so it's deduplicated on future runs
      const hash = contentHash(title, item.source_url ?? '')
      try {
        await db.insert(ingestedContent).values({
          sourceName:   item.source_name ?? 'RSS Feed',
          sourceUrl:    item.source_url  ?? null,
          contentHash:  hash,
          rawTitle:     title,
          rawBody:      rawBody.slice(0, 60000),
          rawImageUrl:  item.raw_image_url ?? null,
          language:     item.language ?? 'en',
          status:       'rejected',
          rejectReason: 'off_topic',
        })
      } catch (e: any) {
        if (e.code !== 'ER_DUP_ENTRY') throw e
      }
      return { skipped: true, reason: 'off_topic' }
    }

    const hash = contentHash(title, item.source_url ?? '')

    try {
      await db.insert(ingestedContent).values({
        sourceName:   item.source_name ?? 'RSS Feed',
        sourceUrl:    item.source_url  ?? null,
        contentHash:  hash,
        rawTitle:     title,
        rawBody:      rawBody.slice(0, 60000),
        rawImageUrl:  item.raw_image_url ?? null,
        language:     item.language ?? 'en',
        status:       'pending',
      })
      return { inserted: true }
    } catch (e: any) {
      if (e.code === 'ER_DUP_ENTRY') return { skipped: true, reason: 'duplicate' }
      throw e
    }
  }))

  const inserted  = results.filter(r => r.status === 'fulfilled' && (r.value as any)?.inserted).length
  const offTopic  = results.filter(r => r.status === 'fulfilled' && (r.value as any)?.reason === 'off_topic').length
  const duplicate = results.filter(r => r.status === 'fulfilled' && (r.value as any)?.reason === 'duplicate').length
  const failed    = results.filter(r => r.status === 'rejected').length

  return NextResponse.json({ inserted, off_topic: offTopic, duplicate, failed, total: items.length })
}
