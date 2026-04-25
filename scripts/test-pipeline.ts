/**
 * End-to-end pipeline test — run after deploying to Vercel.
 * Usage: npx tsx scripts/test-pipeline.ts [--prod]
 *
 * Tests: RSS ingest → Neon queue → AI enhancement → draft articles → FB queue
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { Pool } from 'pg'

const BASE   = process.argv.includes('--prod') ? 'https://www.camer360.com' : 'http://localhost:3000'
const API_KEY = process.env.AUTOMATION_API_KEY!
const NEON   = process.env.NEON_DATABASE_URL!

const pool = new Pool({ connectionString: NEON, ssl: { rejectUnauthorized: false } })

function hdr() {
  return { 'x-api-key': API_KEY, 'Content-Type': 'application/json' }
}

async function step(label: string, fn: () => Promise<string>) {
  process.stdout.write(`  ${label}... `)
  try {
    const result = await fn()
    console.log(`✓ ${result}`)
    return true
  } catch (e: any) {
    console.log(`✗ FAILED: ${e.message}`)
    return false
  }
}

async function main() {
  console.log(`\n=== Camer360 Pipeline Test (${BASE}) ===\n`)

  // ── STEP 1: Ingest endpoint ───────────────────────────────────────────────
  console.log('1. RSS Ingest Endpoint')

  const testItem = {
    source_name: 'Test Source',
    source_url:  'https://test.example.com/article-' + Date.now(),
    raw_title:   'Pipeline Test Article ' + new Date().toISOString(),
    raw_body:    'This is a test article body for pipeline verification.',
    language:    'en',
  }

  let ingestOk = false
  await step('POST /api/n8n/ingest', async () => {
    const res = await fetch(`${BASE}/api/n8n/ingest`, {
      method: 'POST', headers: hdr(), body: JSON.stringify([testItem])
    })
    const json = await res.json() as any
    if (!res.ok) throw new Error(JSON.stringify(json))
    ingestOk = json.inserted > 0
    return `inserted=${json.inserted} skipped=${json.skipped} failed=${json.failed}`
  })

  // ── STEP 2: Neon queue populated ─────────────────────────────────────────
  console.log('\n2. Neon ingested_content Queue')

  let queueId: number | null = null
  await step('Check pending item in Neon', async () => {
    const { rows } = await pool.query(
      `SELECT id, raw_title, status FROM ingested_content WHERE raw_title = $1 LIMIT 1`,
      [testItem.raw_title]
    )
    if (rows.length === 0) throw new Error('item not found in ingested_content')
    queueId = rows[0].id
    return `id=${rows[0].id} status=${rows[0].status}`
  })

  // ── STEP 3: Queue polling endpoint ───────────────────────────────────────
  console.log('\n3. Queue Polling Endpoint')

  await step('GET /api/n8n/queue?limit=5', async () => {
    const res = await fetch(`${BASE}/api/n8n/queue?limit=5`, {
      headers: { 'x-api-key': API_KEY }
    })
    const json = await res.json() as any[]
    if (!res.ok) throw new Error(JSON.stringify(json))
    return `${json.length} item(s) returned`
  })

  // ── STEP 4: Claude/AI endpoint ────────────────────────────────────────────
  console.log('\n4. AI Classification Endpoint')

  let aiCategory = ''
  await step('POST /api/n8n/claude (classifier)', async () => {
    const res = await fetch(`${BASE}/api/n8n/claude`, {
      method: 'POST', headers: hdr(), body: JSON.stringify({
        model: 'fast',
        system: 'Classify content. Respond ONLY with valid JSON: {"category":"celebrities","score":8,"publish":true}',
        user:   `Title: ${testItem.raw_title}\nSummary: ${testItem.raw_body}`,
      })
    })
    const json = await res.json() as any
    if (!res.ok) throw new Error(json.error ?? JSON.stringify(json))
    const parsed = JSON.parse(json.text)
    aiCategory = parsed.category
    return `category=${parsed.category} score=${parsed.score} publish=${parsed.publish}`
  })

  // ── STEP 5: Articles creation endpoint ───────────────────────────────────
  console.log('\n5. Draft Article Creation')

  let articleId: number | null = null
  await step('POST /api/n8n/articles', async () => {
    const res = await fetch(`${BASE}/api/n8n/articles`, {
      method: 'POST', headers: hdr(), body: JSON.stringify({
        title:         testItem.raw_title,
        body:          '<p>Pipeline test body paragraph.</p>',
        excerpt:       testItem.raw_body.slice(0, 160),
        category_slug: aiCategory || 'celebrities',
        meta_title:    testItem.raw_title.slice(0, 60),
        meta_desc:     testItem.raw_body.slice(0, 160),
        language:      'en',
      })
    })
    const json = await res.json() as any
    if (!res.ok || !json.ok) throw new Error(json.error ?? JSON.stringify(json))
    articleId = json.id
    return `draft created id=${json.id} slug=${json.slug}`
  })

  // ── STEP 6: Facebook queue endpoint ──────────────────────────────────────
  console.log('\n6. Facebook Queue Endpoint')

  await step('GET /api/n8n/social/facebook', async () => {
    const res = await fetch(`${BASE}/api/n8n/social/facebook?limit=5`, {
      headers: { 'x-api-key': API_KEY }
    })
    const json = await res.json() as any
    if (!res.ok) throw new Error(JSON.stringify(json))
    return `${Array.isArray(json) ? json.length : 0} unposted published article(s) returned`
  })

  // ── Cleanup: reset test item ──────────────────────────────────────────────
  console.log('\n7. Cleanup')
  await step('Remove test item from Neon queue', async () => {
    if (!queueId) return 'skipped (item not created)'
    await pool.query(`DELETE FROM ingested_content WHERE id = $1`, [queueId])
    return `deleted id=${queueId}`
  })

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n=== Pipeline test complete ===')
  console.log('If all steps show ✓ the pipeline is fully operational.')
  console.log(`Test draft article id: ${articleId ?? 'not created'} (delete it from admin if needed)\n`)

  await pool.end()
}

main().catch(e => { console.error('\nFATAL:', e.message); process.exit(1) })
