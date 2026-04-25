/**
 * Full end-to-end pipeline test
 * Run: npx tsx scripts/full-pipeline-test.ts
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import { createPool } from 'mysql2/promise'

const KEY  = process.env.AUTOMATION_API_KEY!
const B    = 'https://www.camer360.com'
const FB_TOKEN = 'EAAXZAZCWlIzY8BRTSCjQ7rv9ZCOjmNSZCCtqNQq6ezRG0MVPZCkNGuyIb5rZCCtDrKXIXoKNNXJiXHmDPd1UnsInZBjw3OxKG92VyOlZAfq0uDWIK0ovjOBZBt4PQjFCM16ptmKfDEqicsGK7yaZC3tu4eas3wxIr5jjplbDRDFp1ndmEaf4HSLWZBeXO0shcKNkaCX6PYB'
const FB_PAGE = '252443918110445'

function h(req: RequestInit = {}) { return { ...req, headers: { 'x-api-key': KEY, 'Content-Type': 'application/json', ...((req as any).headers ?? {}) } } }

async function step(label: string, fn: () => Promise<string>) {
  try {
    const r = await fn()
    console.log(`  ✓ ${label}: ${r}`)
    return true
  } catch(e: any) {
    console.log(`  ✗ ${label}: ${e.message?.slice(0,100)}`)
    return false
  }
}

async function main() {
  // ── Phase 1: RSS Ingestion ──────────────────────────────────────────────
  console.log('\n═══ Phase 1: RSS → Queue ═══')

  await step('Ingest real article', async () => {
    const ts = Date.now()
    const r = await fetch(`${B}/api/n8n/ingest`, { method:'POST', ...h(), body: JSON.stringify([{
      source_name: 'BellaNaija',
      source_url: `https://bellanaija.com/2026/04/davido-wizkid-higher-${ts}`,
      raw_title: 'Davido Drops "Higher" Ft. Wizkid — 3M YouTube Views in 24 Hours',
      raw_body: 'Davido and Wizkid have teamed up for the official music video of Higher. Directed by TG Omori, shot across Lagos, Accra and London. Within 24 hours of release it has amassed over 3 million views on YouTube.',
      language: 'en'
    }]) })
    const j = await r.json() as any
    if (!r.ok) throw new Error(JSON.stringify(j))
    return `inserted=${j.inserted} skipped=${j.skipped}`
  })

  // ── Phase 2: Queue → AI Enhancement ─────────────────────────────────────
  console.log('\n═══ Phase 2: Queue → AI Enhancement ═══')

  let queueItem: any = null
  await step('Fetch from queue', async () => {
    const r = await fetch(`${B}/api/n8n/queue?limit=1`, h())
    const items = await r.json() as any[]
    if (!Array.isArray(items) || items.length === 0) throw new Error('Queue empty')
    queueItem = items[0]
    const title = queueItem.rawTitle || queueItem.raw_title
    return `id=${queueItem.id} | "${title?.slice(0,45)}"`
  })

  let aiArticle: any = null
  if (queueItem) {
    await step('AI article enhancement', async () => {
      const title = queueItem.rawTitle || queueItem.raw_title
      const body  = queueItem.rawBody  || queueItem.raw_body
      const r = await fetch(`${B}/api/n8n/claude`, { method:'POST', ...h(), body: JSON.stringify({
        model: 'quality',
        system: 'You are a sharp African entertainment editor for Camer360. Respond ONLY with valid JSON: {"title":"headline under 12 words","slug":"url-slug","excerpt":"2-sentence hook under 160 chars","body":"article HTML 300-400 words using <p><h2><strong>","category_slug":"celebrities","meta_title":"SEO title under 60 chars","meta_desc":"SEO desc under 160 chars"}',
        user: `Title: ${title}\nContent: ${body}`
      }) })
      const j = await r.json() as any
      aiArticle = JSON.parse(j.text)
      if (!aiArticle.title || !aiArticle.body) throw new Error('Bad AI response')
      return `"${aiArticle.title.slice(0,55)}"`
    })
  }

  // ── Phase 3: Create Draft Article ────────────────────────────────────────
  console.log('\n═══ Phase 3: Article Creation ═══')

  let articleId: number | null = null
  if (aiArticle) {
    await step('Create draft article', async () => {
      const r = await fetch(`${B}/api/n8n/articles`, { method:'POST', ...h(), body: JSON.stringify({
        title: aiArticle.title, slug: aiArticle.slug, excerpt: aiArticle.excerpt,
        body: aiArticle.body, category_slug: aiArticle.category_slug || 'celebrities',
        meta_title: aiArticle.meta_title, meta_desc: aiArticle.meta_desc, language: 'en',
      }) })
      const j = await r.json() as any
      if (!j.ok) throw new Error(j.error || 'Create failed')
      articleId = j.id
      return `id=${j.id} | slug=${j.slug}`
    })

    if (queueItem) {
      await step('Mark queue item processed', async () => {
        const r = await fetch(`${B}/api/n8n/queue`, { method:'PATCH', ...h(), body: JSON.stringify({ id: queueItem.id, status: 'processed', article_id: articleId }) })
        const j = await r.json() as any
        if (!j.ok) throw new Error(JSON.stringify(j))
        return `queue id=${queueItem.id} → processed`
      })
    }
  }

  // ── Phase 4: Facebook API ─────────────────────────────────────────────────
  console.log('\n═══ Phase 4: Facebook API Verification ═══')

  await step('Facebook token validity', async () => {
    const r = await fetch(`https://graph.facebook.com/v19.0/${FB_PAGE}?fields=name,fan_count&access_token=${FB_TOKEN}`)
    const j = await r.json() as any
    if (j.error) throw new Error(j.error.message)
    return `Page: "${j.name}" | Followers: ${j.fan_count ?? 'N/A'}`
  })

  await step('Last Facebook post on page', async () => {
    const r = await fetch(`https://graph.facebook.com/v19.0/${FB_PAGE}/posts?limit=1&fields=message,created_time,permalink_url&access_token=${FB_TOKEN}`)
    const j = await r.json() as any
    if (j.error) throw new Error(j.error.message)
    const post = j.data?.[0]
    if (!post) throw new Error('No posts found on page')
    return `"${post.message?.slice(0,55)}" (${post.created_time?.slice(0,10)})`
  })

  await step('Facebook queue (unposted articles)', async () => {
    const r = await fetch(`${B}/api/n8n/social/facebook?limit=5`, h())
    const items = await r.json() as any[]
    return `${Array.isArray(items) ? items.length : 0} articles ready to post`
  })

  // ── Phase 5: YouTube Status ───────────────────────────────────────────────
  console.log('\n═══ Phase 5: YouTube OAuth Status ═══')

  await step('Credentials check', async () => {
    const channelId  = process.env['YOUTUBE_CHANNEL_ID']
    const refreshTok = process.env['YOUTUBE_REFRESH_TOKEN']
    const apiKey     = process.env['YOUTUBE_API_KEY']
    const apiKeyOk   = !!(apiKey && !apiKey.includes('.apps.'))
    return [
      `channel=${channelId ? channelId : 'MISSING'}`,
      `refresh_token=${refreshTok ? 'SET' : 'NEEDED (run /admin/youtube OAuth flow)'}`,
      `api_key=${apiKeyOk ? 'SET' : 'NEEDED (AIzaSy... from Google Cloud Console)'}`,
    ].join(' | ')
  })

  await step('YouTube social queue', async () => {
    const r = await fetch(`${B}/api/n8n/social/youtube?limit=3`, h())
    const items = await r.json() as any[]
    return `${Array.isArray(items) ? items.length : 0} articles ready to post`
  })

  // ── Final DB State ────────────────────────────────────────────────────────
  console.log('\n═══ Final Database State ═══')

  const pool = createPool({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT)||3306, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, ssl:{rejectUnauthorized:false} })
  const [arts]  = await pool.query('SELECT status, COUNT(*) as n FROM articles GROUP BY status ORDER BY n DESC') as any
  const [queue] = await pool.query('SELECT status, COUNT(*) as n FROM ingested_content GROUP BY status ORDER BY n DESC') as any
  const [soc]   = await pool.query('SELECT platform, status, COUNT(*) as n FROM social_queue GROUP BY platform, status') as any

  console.log(`  Articles:    ${arts.map((r:any) => r.status+'='+r.n).join(' | ')}`)
  console.log(`  Queue:       ${queue.map((r:any) => r.status+'='+r.n).join(' | ') || 'empty'}`)
  console.log(`  Social posts:${soc.length ? soc.map((r:any) => r.platform+'/'+r.status+'='+r.n).join(' | ') : ' none recorded yet'}`)

  await pool.end()
  console.log('\n═══════════════════════════════════════')
  console.log(' Pipeline test complete.')
  console.log('═══════════════════════════════════════\n')
}

main().catch(e => { console.error('\nFATAL:', e.message); process.exit(1) })
