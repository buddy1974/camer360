import Link from 'next/link'
import { Eye, Clock, Calendar } from 'lucide-react'
import { ArticleCard }      from '@/components/article/ArticleCard'
import AdUnit               from '@/components/ads/AdUnit'
import { JsonLd }           from '@/components/seo/JsonLd'
import CommentsSection      from '@/components/article/CommentSection'
import ShareButtons         from '@/components/article/ShareButtons'
import { ArticleImage }     from '@/components/article/ArticleImage'
import { HitTracker }       from '@/components/article/HitTracker'
import { ReadingProgress }  from '@/components/article/ReadingProgress'
import { ReactionBar }      from '@/components/article/ReactionBar'
import { AudioReader }      from '@/components/article/AudioReader'
import { ProgressiveBody }  from '@/components/article/ProgressiveBody'
import { PerspectiveEngine } from '@/components/article/PerspectiveEngine'
import { ReadingStreak }    from '@/components/user/ReadingStreak'
import { buildNewsArticleSchema, buildBreadcrumbSchema } from '@/lib/seo/schema'
import { linkCelebrities }  from '@/lib/celebrity-linker'
import { injectVideoEmbeds } from '@/lib/embeds'
import { QuoteShare }        from '@/components/article/QuoteShare'
import { RecordHistory }     from '@/components/user/ReadingHistory'
import { formatDate, readingTime, formatHitCount, depthScore } from '@/lib/utils'
import { SITE_URL } from '@/lib/constants'
import type { ArticleWithRelations } from '@/lib/types'

interface Props {
  article: ArticleWithRelations
  related: ArticleWithRelations[]
}

export async function ArticlePageContent({ article, related }: Props) {
  const catSlug    = article.category.slug
  const slug       = article.slug
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
      <RecordHistory
        id={article.id}
        title={article.title}
        slug={article.slug}
        categorySlug={catSlug}
        categoryName={article.category.name}
      />
      <QuoteShare articleTitle={article.title} categorySlug={catSlug} slug={slug} />

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

        {/* ── Article header — cinematic ── */}
        <div style={{
          position:   'relative',
          overflow:   'hidden',
          background: 'var(--grad-dark)',
          minHeight:  article.featuredImage ? '420px' : 'auto',
          display:    'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}>
          {/* Cinematic bg image */}
          {article.featuredImage && (
            <>
              <div style={{
                position:   'absolute',
                inset:       0,
                backgroundImage: `url(${article.featuredImage})`,
                backgroundSize:  'cover',
                backgroundPosition: 'center top',
                transform:   'scale(1.02)',
                filter:      'blur(0px)',
              }} />
              {/* Hero overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'var(--gradient-hero-overlay)' }} />
            </>
          )}

          <div style={{ maxWidth: '820px', margin: '0 auto', padding: article.featuredImage ? '140px 40px 56px' : '64px 40px', position: 'relative', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <Link href={`/${catSlug}`} style={{
                background:    'var(--gradient-gold)',
                color:         '#1A1A1A',
                padding:       '6px 16px',
                fontSize:      '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                fontWeight:    800,
                borderRadius:  '99px',
                textDecoration:'none',
              }}>
                {article.category.name}
              </Link>
              {article.isBreaking && (
                <span style={{ background: '#C8102E', color: 'white', padding: '5px 14px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', borderRadius: '99px' }}>
                  Breaking
                </span>
              )}
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginLeft: 'auto', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'var(--font-mono), monospace' }}>{depth}</span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 700, lineHeight: 1.1, color: 'white', marginBottom: '16px', letterSpacing: '-0.02em', textShadow: article.featuredImage ? '0 2px 20px rgba(0,0,0,0.5)' : 'none' }}>
              {article.title}
            </h1>

            {article.subtitle && (
              <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: '24px', fontWeight: 300 }}>
                {article.subtitle}
              </p>
            )}

            {/* Gold rule */}
            <div style={{ width: '48px', height: '2px', background: 'var(--gradient-gold)', marginBottom: '20px', borderRadius: '1px' }} />

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px', fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>
              {/* Author avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {article.author?.avatarUrl ? (
                  <img src={article.author.avatarUrl} alt={article.author.name} width={28} height={28} style={{ borderRadius: '50%', objectFit: 'cover', border: '1.5px solid hsl(var(--gold))' }} />
                ) : (
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900, color: '#1A1A1A', flexShrink: 0 }}>
                    {(article.author?.name || 'N').charAt(0)}
                  </div>
                )}
                <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '11px' }}>
                  {article.author?.name || 'News Team'}
                </span>
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={11} />
                {formatDate(article.publishedAt!)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={11} />
                {minutes} min read
              </span>
              {article.hits > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'hsl(var(--gold))' }}>
                  <Eye size={11} />
                  {formatHitCount(article.hits)}
                </span>
              )}
              <ReadingStreak />
            </div>
          </div>
        </div>

        {/* ── Body layout ── */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px', display: 'flex', gap: '60px', alignItems: 'flex-start', paddingTop: '60px', paddingBottom: '80px' }}>

          <div style={{ flex: '1 1 0', minWidth: 0, maxWidth: '720px' }}>

            {article.excerpt && (
              <div style={{ background: 'white', border: '1px solid var(--border-light)', borderLeft: '4px solid var(--primary-gold)', borderRadius: '0 12px 12px 0', padding: '24px 28px', marginBottom: '36px', boxShadow: 'var(--shadow-card)' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--primary-gold)', marginBottom: '10px' }}>Summary</p>
                <p style={{ fontSize: '15px', color: '#4B5563', lineHeight: 1.75 }}>{article.excerpt}</p>
              </div>
            )}

            {article.featuredImage && (
              <div style={{ marginBottom: '36px', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-hover)' }}>
                <ArticleImage src={article.featuredImage} alt={article.imageAlt || article.title} caption={article.imageCaption} priority={true} />
              </div>
            )}

            <AudioReader title={article.title} body={article.body ?? ''} />

            <div className="prose prose-editorial" id="article-content" style={{ background: 'white', padding: '40px 44px', borderRadius: '16px', boxShadow: 'var(--shadow-soft-ed)', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
              <ProgressiveBody body={injectVideoEmbeds(linkCelebrities(article.body ?? ''))} />
            </div>

            <ReactionBar articleId={article.id} />

            <PerspectiveEngine articleId={article.id} title={article.title} excerpt={article.excerpt ?? undefined} />

            <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '0 24px', margin: '32px 0', boxShadow: 'var(--shadow-card)' }}>
              <ShareButtons title={article.title} categorySlug={article.category.slug} slug={article.slug} />
            </div>

            {article.author && (
              <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '32px', marginBottom: '40px', boxShadow: 'var(--shadow-card)', position: 'relative', overflow: 'hidden' }}>
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
                    <Link href={`/authors/${article.author.slug}`} style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, color: 'var(--primary-dark)', fontSize: '16px', textDecoration: 'none' }}>
                      {article.author.name}
                    </Link>
                    {article.author.bio && (
                      <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '6px', lineHeight: 1.65 }}>{article.author.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Inline subscribe CTA ── */}
            <div className="bg-secondary border-y border-border my-8" style={{ margin: '32px -44px', padding: '40px 44px' }}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="eyebrow text-gold-deep mb-2">Enjoyed this story?</div>
                  <h3 className="font-display text-2xl md:text-3xl font-semibold">
                    Don&apos;t miss the next one. Join 84,000 readers.
                  </h3>
                </div>
                <Link href="/newsletter"
                  className="inline-flex items-center gap-2 bg-onyx text-ivory px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] whitespace-nowrap hover:opacity-90 transition-opacity shrink-0">
                  Subscribe to Camer360 →
                </Link>
              </div>
            </div>

            {related.length > 0 && (
              <section style={{ marginBottom: '40px' }}>
                <div className="flex items-center gap-4 mb-7">
                  <div className="eyebrow text-gold flex items-center gap-3">
                    <span className="gold-rule" /> More to read
                  </div>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, hsl(var(--gold)), transparent)' }} />
                  <Link href={`/${catSlug}`} className="story-link text-[12px] font-semibold uppercase tracking-[0.12em] text-gold whitespace-nowrap">
                    See All →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {related.map(a => <ArticleCard key={a.id} article={a} variant="editorial" />)}
                </div>
              </section>
            )}

            <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '32px', boxShadow: 'var(--shadow-card)' }}>
              <CommentsSection articleId={article.id} />
            </div>

          </div>

          <aside className="hidden lg:block" style={{ width: '280px', flexShrink: 0 }}>
            <div style={{ position: 'sticky', top: '128px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {/* Subscribe CTA */}
              <div className="bg-onyx text-ivory p-6">
                <div className="eyebrow text-gold mb-3">Inside Edition</div>
                <h3 className="font-display text-xl font-semibold leading-snug text-ivory">
                  Get tomorrow&apos;s stories tonight.
                </h3>
                <p className="mt-3 text-sm text-ivory/60">Subscribers get our newsroom&apos;s drafts before they&apos;re public.</p>
                <Link href="/newsletter"
                  className="mt-5 inline-flex w-full items-center justify-center py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-onyx"
                  style={{ background: 'var(--gradient-gold)' }}>
                  Subscribe Free
                </Link>
              </div>

              {/* Keep reading */}
              {related.length > 0 && (
                <div>
                  <div className="eyebrow text-gold-deep mb-4">Keep reading</div>
                  <ul className="space-y-5">
                    {related.slice(0, 3).map((a, i) => (
                      <li key={a.id}>
                        <Link href={`/${a.category.slug}/${a.slug}`} className="group flex gap-3">
                          <span className="font-display text-2xl font-bold leading-none text-gold/60 group-hover:text-gold transition-colors w-7 shrink-0">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="text-sm font-medium leading-snug group-hover:text-gold-deep transition-colors">
                            {a.title}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ad unit */}
              <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '12px', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
                <AdUnit slot="5520370976" format="rectangle" />
              </div>
            </div>
          </aside>

        </div>
      </div>
    </>
  )
}
