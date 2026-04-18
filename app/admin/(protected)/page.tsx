import { db } from '@/lib/db/client'
import { articles, categories, articleHits } from '@/lib/db/schema'
import { desc, eq, sql } from 'drizzle-orm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type StatRow = { count: number }

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn() } catch { return fallback }
}

async function getQueueStats(): Promise<Record<string, number>> {
  try {
    const { Pool } = await import('pg')
    const pool = new Pool({
      connectionString: process.env.NEON_DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 4000,
    })
    try {
      const { rows } = await pool.query(
        `SELECT status, COUNT(*) as count FROM ingested_content GROUP BY status`
      )
      const stats: Record<string, number> = {}
      for (const r of rows) stats[r.status] = Number(r.count)
      return stats
    } finally {
      await pool.end()
    }
  } catch {
    return {}
  }
}

export default async function AdminDashboard() {
  const [
    [totalArticles],
    [published],
    [drafts],
    [aiGenCount],
    recent,
    topArticles,
    categoryStats,
    queueStats,
  ] = await Promise.all([
    safeQuery(() => db.select({ count: sql<number>`count(*)` }).from(articles), [{ count: 0 }] as StatRow[]),
    safeQuery(() => db.select({ count: sql<number>`count(*)` }).from(articles).where(eq(articles.status, 'published')), [{ count: 0 }] as StatRow[]),
    safeQuery(() => db.select({ count: sql<number>`count(*)` }).from(articles).where(eq(articles.status, 'draft')), [{ count: 0 }] as StatRow[]),
    safeQuery(() => db.select({ count: sql<number>`count(*)` }).from(articles).where(eq(articles.aiGenerated, true)), [{ count: 0 }] as StatRow[]),
    safeQuery(() => db
      .select({
        id: articles.id, title: articles.title, status: articles.status,
        publishedAt: articles.publishedAt, catName: categories.name,
        catSlug: categories.slug, slug: articles.slug, aiGenerated: articles.aiGenerated,
      })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .orderBy(desc(articles.createdAt))
      .limit(10), []),
    safeQuery(() => db
      .select({
        id: articles.id, title: articles.title, slug: articles.slug,
        hits: articleHits.hits, catSlug: categories.slug,
      })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .leftJoin(articleHits, eq(articles.id, articleHits.articleId))
      .where(eq(articles.status, 'published'))
      .orderBy(desc(articleHits.hits))
      .limit(8), []),
    safeQuery(() => db
      .select({
        category: categories.name, slug: categories.slug,
        totalHits: sql<number>`COALESCE(SUM(${articleHits.hits}), 0)`,
        articleCount: sql<number>`COUNT(${articles.id})`,
      })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .leftJoin(articleHits, eq(articles.id, articleHits.articleId))
      .where(eq(articles.status, 'published'))
      .groupBy(categories.id, categories.name, categories.slug)
      .orderBy(desc(sql`SUM(${articleHits.hits})`)), []),
    getQueueStats(),
  ])

  const queuePending    = queueStats['pending']    ?? 0
  const queueProcessing = queueStats['processing'] ?? 0
  const queueProcessed  = queueStats['processed']  ?? 0
  const queueRejected   = queueStats['rejected']   ?? 0
  const queueTotal      = Object.values(queueStats).reduce((a, b) => a + b, 0)

  return (
    <div style={{ maxWidth: '1200px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
            Dashboard
          </h1>
          <p style={{ color: '#333', fontSize: '0.72rem', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Camer360 · Entertainment CMS
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/admin/quick-publish" style={{
            padding: '9px 18px',
            background: 'linear-gradient(135deg, #D4AF37, #F7DC6F)',
            color: '#1A1A1A', borderRadius: '8px',
            fontSize: '0.72rem', fontWeight: 700,
            textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            ⚡ Quick Publish
          </Link>
          <Link href="/admin/articles/new" style={{
            padding: '9px 18px',
            background: '#DC2626', color: '#fff', borderRadius: '8px',
            fontSize: '0.72rem', fontWeight: 700,
            textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            + New Article
          </Link>
        </div>
      </div>

      {/* Article stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
        {[
          { label: 'Total Articles', value: Number(totalArticles?.count ?? 0).toLocaleString(), color: '#D4AF37', border: 'rgba(212,175,55,0.2)' },
          { label: 'Published',      value: Number(published?.count ?? 0).toLocaleString(),     color: '#4CAF50', border: 'rgba(76,175,80,0.2)' },
          { label: 'Drafts',         value: Number(drafts?.count ?? 0).toLocaleString(),         color: '#FF9800', border: 'rgba(255,152,0,0.2)' },
          { label: 'AI Generated',   value: Number(aiGenCount?.count ?? 0).toLocaleString(),     color: '#9C27B0', border: 'rgba(156,39,176,0.2)' },
        ].map(s => (
          <div key={s.label} style={{ background: '#0F0F0F', border: `1px solid ${s.border}`, borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.62rem', color: '#333', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Automation Pipeline */}
      <div style={{ background: '#080808', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '12px', padding: '20px 24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#D4AF37' }}>
            Automation Pipeline · Neon Queue
          </div>
          <div style={{ fontSize: '0.62rem', color: '#333' }}>
            {queueTotal > 0 ? `${queueTotal.toLocaleString()} total items` : 'Queue unavailable'}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { label: 'Pending',    value: queuePending,    color: '#FF9800' },
            { label: 'Processing', value: queueProcessing, color: '#2196F3' },
            { label: 'Processed',  value: queueProcessed,  color: '#4CAF50' },
            { label: 'Rejected',   value: queueRejected,   color: '#F44336' },
          ].map(s => (
            <div key={s.label} style={{ background: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: '8px', padding: '14px 16px' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>
                {s.value.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.6rem', color: '#333', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '14px', fontSize: '0.65rem', color: '#222' }}>
          RSS Ingestion runs every 2h · Article Enhancement runs every 30min · Articles auto-published after AI scoring ≥6
        </div>
      </div>

      {/* 2-col: top articles + category performance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>

        <div style={{ background: '#0F0F0F', border: '1px solid #1A1A1A', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #1A1A1A' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Top Articles by Hits
            </span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {topArticles.map((a, i) => (
                <tr key={a.id} style={{ borderBottom: '1px solid #111' }}>
                  <td style={{ padding: '9px 18px', width: '28px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 900, color: i < 3 ? '#D4AF37' : '#222' }}>{i + 1}</span>
                  </td>
                  <td style={{ padding: '9px 6px' }}>
                    <a href={`/${a.catSlug}/${a.slug}`} target="_blank" style={{ color: '#CCC', textDecoration: 'none', fontSize: '0.78rem', lineHeight: 1.3 }}>
                      {a.title?.slice(0, 65)}
                    </a>
                  </td>
                  <td style={{ padding: '9px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D4AF37' }}>{(a.hits || 0).toLocaleString()}</span>
                  </td>
                </tr>
              ))}
              {topArticles.length === 0 && (
                <tr><td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: '#222', fontSize: '0.75rem' }}>No hits yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ background: '#0F0F0F', border: '1px solid #1A1A1A', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #1A1A1A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Category Performance
            </span>
            <Link href="/admin/categories" style={{ fontSize: '0.62rem', color: '#333', textDecoration: 'none' }}>manage →</Link>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {categoryStats.slice(0, 8).map(c => (
                <tr key={c.slug} style={{ borderBottom: '1px solid #111' }}>
                  <td style={{ padding: '9px 18px', fontSize: '0.8rem', color: '#CCC' }}>{c.category}</td>
                  <td style={{ padding: '9px 6px', fontSize: '0.72rem', color: '#444', textAlign: 'right' }}>{Number(c.articleCount).toLocaleString()} art.</td>
                  <td style={{ padding: '9px 18px', fontSize: '0.78rem', fontWeight: 700, color: '#D4AF37', textAlign: 'right' }}>{Number(c.totalHits).toLocaleString()}</td>
                </tr>
              ))}
              {categoryStats.length === 0 && (
                <tr><td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: '#222', fontSize: '0.75rem' }}>No data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent articles */}
      <div style={{ background: '#0F0F0F', border: '1px solid #1A1A1A', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #1A1A1A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Recent Articles
          </span>
          <Link href="/admin/articles" style={{ fontSize: '0.62rem', color: '#333', textDecoration: 'none' }}>View all →</Link>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {recent.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid #111' }}>
                <td style={{ padding: '11px 20px' }}>
                  <Link href={`/admin/articles/${a.id}/edit`} style={{ color: '#EEE', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500, lineHeight: 1.3, display: 'block' }}>
                    {a.title}
                  </Link>
                  <div style={{ fontSize: '0.62rem', color: '#333', marginTop: '3px', display: 'flex', gap: '10px' }}>
                    <span>{a.catName}</span>
                    {a.aiGenerated && <span style={{ color: '#9C27B0' }}>AI</span>}
                    {a.publishedAt && <span>{new Date(a.publishedAt).toLocaleDateString()}</span>}
                  </div>
                </td>
                <td style={{ padding: '11px 20px', whiteSpace: 'nowrap' }}>
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 700, padding: '3px 8px', borderRadius: '20px',
                    background: a.status === 'published' ? 'rgba(76,175,80,0.1)' : 'rgba(255,152,0,0.1)',
                    color: a.status === 'published' ? '#4CAF50' : '#FF9800',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>
                    {a.status}
                  </span>
                </td>
                <td style={{ padding: '11px 20px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Link href={`/admin/articles/${a.id}/edit`}
                      style={{ fontSize: '0.68rem', color: '#444', textDecoration: 'none', padding: '4px 10px', border: '1px solid #1A1A1A', borderRadius: '6px' }}>
                      Edit
                    </Link>
                    {a.status === 'published' && (
                      <Link href={`/${a.catSlug}/${a.slug}`} target="_blank"
                        style={{ fontSize: '0.68rem', color: '#333', textDecoration: 'none', padding: '4px 10px', border: '1px solid #1A1A1A', borderRadius: '6px' }}>
                        View
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr><td colSpan={3} style={{ padding: '32px', textAlign: 'center', color: '#333', fontSize: '0.8rem' }}>
                No articles yet. <Link href="/admin/articles/new" style={{ color: '#D4AF37' }}>Create one →</Link>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}
