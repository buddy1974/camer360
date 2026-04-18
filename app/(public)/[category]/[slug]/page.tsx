export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound }      from 'next/navigation'
import Link              from 'next/link'
import { Eye, Clock, Calendar } from 'lucide-react'
import { ArticleCard }      from '@/components/article/ArticleCard'
import AdUnit               from '@/components/ads/AdUnit'
import { JsonLd }           from '@/components/seo/JsonLd'
import CommentsSection      from '@/components/article/CommentSection'
import ShareButtons          from '@/components/article/ShareButtons'
import { ArticleImage }     from '@/components/article/ArticleImage'
import { HitTracker }       from '@/components/article/HitTracker'
import { ReadingProgress }  from '@/components/article/ReadingProgress'
import {
  getArticleBySlug,
  getRelatedArticles,
} from '@/lib/db/queries'
import { buildArticleMetadata }              from '@/lib/seo/metadata'
import { buildNewsArticleSchema, buildBreadcrumbSchema } from '@/lib/seo/schema'
import { formatDate, readingTime, formatHitCount, depthScore } from '@/lib/utils'
import { SITE_URL } from '@/lib/constants'

interface Props { params: Promise<{ category: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params
  const article = await getArticleBySlug(category, slug)
  if (!article) return {}
  return buildArticleMetadata(article)
}

export default async function ArticlePage({ params }: Props) {
  const { category: catSlug, slug } = await params
  const article = await getArticleBySlug(catSlug, slug)
  if (!article) notFound()

  const related = await getRelatedArticles(article.id, article.categoryId, 4)

  const minutes    = readingTime(article.body)
  const depth      = depthScore(article.body)
  const articleUrl = `${SITE_URL}/${catSlug}/${slug}`

  const newsSchema = buildNewsArticleSchema(article)
  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home',                url: SITE_URL },
    { name: article.category.name, url: `${SITE_URL}/${catSlug}` },
    { name: article.title,         url: articleUrl },
  ])

  return (
    <>
      <JsonLd data={newsSchema} />
      <JsonLd data={breadcrumb} />
      <HitTracker articleId={article.id} />
      <ReadingProgress />

      <div style={{ background: 'var(--luxury-bg)', minHeight: '100vh' }}>

        {/* ── Breadcrumb bar ── */}
        <div style={{ borderBottom: '1px solid var(--border-light)', background: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 0', fontSize: '12px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <Link href="/" className="hover:text-[#D4AF37] transition-colors" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Home</Link>
              <span style={{ color: 'var(--border-light)' }}>›</span>
              <Link href={`/${catSlug}`} style={{ color: '#9CA3AF', textDecoration: 'none' }}>{article.category.name}</Link>
              <span style={{ color: 'var(--border-light)' }}>›</span>
              <span style={{ color: 'var(--primary-dark)', fontWeight: 500 }} className="line-clamp-1">{article.title}</span>
            </nav>
          </div>
        </div>

        {/* ── Article header — full-width dark panel ── */}
        <div style={{ background: 'var(--grad-dark)', paddingTop: '64px', paddingBottom: '64px', position: 'relative', overflow: 'hidden' }}>
          {/* grain texture */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

          <div style={{ maxWidth: '820px', margin: '0 auto', padding: '0 40px', position: 'relative' }}>

            {/* Category + Breaking + Depth */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
              <Link href={`/${catSlug}`} style={{
                background: 'linear-gradient(45deg, var(--primary-gold), var(--gold-light))',
                color: 'var(--primary-dark)',
                padding: '8px 20px',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                fontWeight: 700,
                borderRadius: '24px',
                textDecoration: 'none',
                display: 'inline-block',
              }}>
                {article.category.name}
              </Link>
              {article.isBreaking && (
                <span style={{ background: '#F5A623', color: '#1A1A1A', padding: '6px 16px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', borderRadius: '4px' }}>
                  Breaking
                </span>
              )}
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginLeft: 'auto', textTransform: 'uppercase', letterSpacing: '1px' }}>{depth}</span>
            </div>

            {/* Title */}
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: 700,
              lineHeight: 1.15,
              color: 'white',
              marginBottom: '20px',
              letterSpacing: '-0.02em',
            }}>
              {article.title}
            </h1>

            {/* Subtitle */}
            {article.subtitle && (
              <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: '32px', fontWeight: 300 }}>
                {article.subtitle}
              </p>
            )}

            {/* Gold divider */}
            <div style={{ width: '60px', height: '2px', background: 'linear-gradient(90deg, var(--primary-gold), var(--gold-light))', marginBottom: '28px', borderRadius: '1px' }} />

            {/* Meta row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px', fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>
              <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {article.author?.name || 'News Team'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={12} />
                {formatDate(article.publishedAt!)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={12} />
                {minutes} min read
              </span>
              {article.hits > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-gold)', fontWeight: 600 }}>
                  <Eye size={12} />
                  {formatHitCount(article.hits)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Body layout: reading column + sidebar ── */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px', display: 'flex', gap: '60px', alignItems: 'flex-start', paddingTop: '60px', paddingBottom: '80px' }}>

          {/* Main column */}
          <div style={{ flex: '1 1 0', minWidth: 0, maxWidth: '720px' }}>

            {/* Summary */}
            {article.excerpt && (
              <div style={{ background: 'white', border: '1px solid var(--border-light)', borderLeft: '4px solid var(--primary-gold)', borderRadius: '0 12px 12px 0', padding: '24px 28px', marginBottom: '36px', boxShadow: 'var(--shadow-card)' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--primary-gold)', marginBottom: '10px' }}>Summary</p>
                <p style={{ fontSize: '15px', color: '#4B5563', lineHeight: 1.75 }}>{article.excerpt}</p>
              </div>
            )}

            {/* Featured image */}
            {article.featuredImage && (
              <div style={{ marginBottom: '36px', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-hover)' }}>
                <ArticleImage
                  src={article.featuredImage}
                  alt={article.imageAlt || article.title}
                  caption={article.imageCaption}
                  priority={true}
                />
              </div>
            )}

            {/* Article body */}
            <div className="prose" id="article-content" style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-light)' }}>
              {article.body ? (() => {
                const parts = article.body.split('</p>')
                if (parts.length <= 3) {
                  return <div dangerouslySetInnerHTML={{ __html: article.body }} />
                }
                const first  = parts.slice(0, 3).join('</p>') + '</p>'
                const middle = parts.slice(3, 6).join('</p>') + (parts.length > 6 ? '</p>' : '')
                const last   = parts.length > 6 ? parts.slice(6).join('</p>') : ''
                return (
                  <>
                    <div dangerouslySetInnerHTML={{ __html: first }} />
                    <div style={{ margin: '32px -40px', padding: '0 40px' }}>
                      <AdUnit slot="5471720771" format="auto" />
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: middle }} />
                    {last && (
                      <>
                        <div style={{ margin: '32px -40px', padding: '0 40px' }}>
                          <AdUnit slot="5520370976" format="rectangle" />
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: last }} />
                      </>
                    )}
                  </>
                )
              })() : (
                <p style={{ color: '#9CA3AF' }}>Content unavailable.</p>
              )}
            </div>

            {/* Share bar */}
            <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '0 24px', margin: '32px 0', boxShadow: 'var(--shadow-card)' }}>
              <ShareButtons
                title={article.title}
                categorySlug={article.category.slug}
                slug={article.slug}
              />
            </div>

            {/* Author card */}
            {article.author && (
              <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '32px', marginBottom: '40px', boxShadow: 'var(--shadow-card)', position: 'relative', overflow: 'hidden' }}>
                {/* top gold line */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, var(--primary-gold), var(--gold-light), var(--primary-gold))' }} />
                <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#9CA3AF', marginBottom: '20px' }}>About the Author</p>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  {article.author.avatarUrl ? (
                    <img src={article.author.avatarUrl} alt={article.author.name} width={48} height={48} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--primary-gold)' }} />
                  ) : (
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(45deg, var(--primary-gold), var(--gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-dark)', fontWeight: 900, fontSize: '18px', flexShrink: 0 }}>
                      {article.author.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, color: 'var(--primary-dark)', fontSize: '16px' }}>{article.author.name}</p>
                    {article.author.bio && (
                      <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '6px', lineHeight: 1.65 }}>{article.author.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Related articles */}
            {related.length > 0 && (
              <section style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 700, color: 'var(--primary-dark)' }}>Related Stories</h3>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, var(--border-light), transparent)' }} />
                  <Link href={`/${catSlug}`} style={{ fontSize: '12px', color: 'var(--primary-gold)', textDecoration: 'none', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                    See All →
                  </Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  {related.map(a => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
              </section>
            )}

            {/* Comments */}
            <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '32px', boxShadow: 'var(--shadow-card)' }}>
              <CommentsSection articleId={article.id} />
            </div>

          </div>

          {/* ── Sidebar ── */}
          <aside className="hidden lg:flex" style={{ width: '300px', flexShrink: 0, flexDirection: 'column' }}>
            <div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Ad */}
              <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '16px', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
                <AdUnit slot="5520370976" format="rectangle" />
              </div>

              {/* Category card */}
              <div style={{ background: 'var(--grad-dark)', borderRadius: '16px', padding: '28px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, var(--primary-gold), var(--gold-light))' }} />
                <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>More from</p>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>{article.category.name}</h4>
                <Link href={`/${catSlug}`} style={{
                  display: 'inline-block',
                  background: 'linear-gradient(45deg, var(--primary-gold), var(--gold-light))',
                  color: 'var(--primary-dark)',
                  padding: '10px 20px',
                  borderRadius: '24px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  textDecoration: 'none',
                }}>
                  Browse All →
                </Link>
              </div>

            </div>
          </aside>

        </div>
      </div>
    </>
  )
}
