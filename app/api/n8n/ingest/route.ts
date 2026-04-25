import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { db } from '@/lib/db/client'
import { ingestedContent } from '@/lib/db/schema'
import { eq, and, gt } from 'drizzle-orm'

function authCheck(req: NextRequest) {
  return req.headers.get('x-api-key') === (process.env['AUTOMATION_API_KEY'] ?? process.env['NEXT_PUBLIC_AUTOMATION_API_KEY'])
}

function contentHash(title: string, url: string): string {
  return createHash('sha256').update(`${title}|${url}`).digest('hex').slice(0, 64)
}

// POST /api/n8n/ingest — receive RSS items from n8n, dedup + store in MySQL queue
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

    const hash = contentHash(title, item.source_url ?? '')

    // Try insert — UNIQUE KEY on content_hash handles dedup
    try {
      await db.insert(ingestedContent).values({
        sourceName:   item.source_name ?? 'RSS Feed',
        sourceUrl:    item.source_url  ?? null,
        contentHash:  hash,
        rawTitle:     title,
        rawBody:      (item.raw_body ?? '').slice(0, 60000),
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

  const inserted = results.filter(r => r.status === 'fulfilled' && (r.value as any)?.inserted).length
  const skipped  = results.filter(r => r.status === 'fulfilled' && (r.value as any)?.skipped).length
  const failed   = results.filter(r => r.status === 'rejected').length

  return NextResponse.json({ inserted, skipped, failed, total: items.length })
}
