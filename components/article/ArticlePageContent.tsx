import Link from 'next/link'
import { Eye, Clock, Calendar } from 'lucide-react'
import { db } from '@/lib/db/client'
import { musicDrops } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { ArticleCard }      from '@/components/article/ArticleCard'
import AdUnit               from '@/components/ads/AdUnit'
import { JsonLd }           from '@/components/seo/JsonLd'
import ShareButtons         from '@/components/article/ShareButtons'
import { ArticleImage }     from '@/components/article/ArticleImage'
import { HitTracker }       from '@/components/article/HitTracker'
import { ReadingProgress }  from '@/components/article/ReadingProgress'
import { AudioReader }      from '@/components/article/AudioReader'
import { ProgressiveBody }  from '@/components/article/ProgressiveBody'
import { ReadingStreak }    from '@/components/user/ReadingStreak'
import { NewsletterSection } from '@/components/home/NewsletterSection'
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
  type MusicDrop = typeof musicDrops.$inferSelect
  let latestDrop: MusicDrop | null = null
  try {
    const rows = await db.select().from(musicDrops).orderBy(desc(musicDrops.createdAt)).limit(1)
    latestDrop = rows[0] ?? null
  } catch { /* table may not exist yet */ }

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

      <div style={{ background: '#ffffff', minHeight: '100vh' }}>

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

        {/* ── Body layout — 3 columns on desktop: [share rail] [article] [sidebar] ── */}
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 40px', display: 'flex', gap: '40px', alignItems: 'flex-start', paddingTop: '60px', paddingBottom: '80px' }}>

          {/* ── LEFT: sticky vertical share rail (desktop only) ── */}
          <aside className="hidden lg:flex" style={{ width: '44px', flexShrink: 0, flexDirection: 'column' }}>
            <div style={{ position: 'sticky', top: '128px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'block', transform: 'rotate(-90deg)', transformOrigin: 'center', whiteSpace: 'nowrap', margin: '40px 0', fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#9CA3AF', fontFamily: 'var(--font-sans)' }}>
                Share
              </span>
              {[
                { label: 'X / Twitter', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(articleUrl)}`, d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                { label: 'Facebook',  href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`,  d: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
                { label: 'WhatsApp',  href: `https://wa.me/?text=${encodeURIComponent(`${article.title} ${articleUrl}`)}`,  d: 'M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.18 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.571-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z' },
                { label: 'LinkedIn',  href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`, d: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
              ].map(({ label, href, d }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="article-share-icon"
                  style={{ display: 'flex', height: '40px', width: '40px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '1px solid var(--border-light)', background: 'white', color: '#9CA3AF', textDecoration: 'none', flexShrink: 0, transition: 'border-color 0.2s, color 0.2s' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d={d}/></svg>
                </a>
              ))}
            </div>
          </aside>

          <div style={{ flex: '1 1 0', minWidth: 0, maxWidth: '720px' }}>

            {article.featuredImage && (
              <div style={{ marginBottom: '36px', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-hover)' }}>
                <ArticleImage src={article.featuredImage} alt={article.imageAlt || article.title} caption={article.imageCaption} priority={true} />
              </div>
            )}

            <AudioReader title={article.title} body={article.body ?? ''} />

            {/* Prose — no card wrapper; overflow:visible so drop cap and blockquote decoration render */}
            <div className="prose prose-editorial" id="article-content">
              <ProgressiveBody body={injectVideoEmbeds(linkCelebrities(article.body ?? ''))} />
            </div>

            {/* Share bar — hidden on desktop (replaced by left rail), shown on mobile */}
            <div className="lg:hidden share-wrapper" style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '0 24px', margin: '32px 0', boxShadow: 'var(--shadow-card)' }}>
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

              {/* MODULE A — Spotify embed */}
              <div className="bg-onyx text-ivory" style={{ borderRadius: '12px', padding: '16px' }}>
                <div className="eyebrow text-gold mb-3" style={{ fontSize: '0.58rem' }}>Listen Now</div>
                <iframe
                  style={{ borderRadius: '8px' }}
                  src="https://open.spotify.com/embed/playlist/37i9dQZF1DX0XUsuxWHRQd?utm_source=generator&theme=0"
                  width="100%"
                  height="152"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
                <a href="https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd" target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: '8px', fontSize: '0.62rem', color: '#1DB954', fontWeight: 700, textDecoration: 'none' }}>
                  Full playlist on Spotify →
                </a>
              </div>

              {/* MODULE B — Latest Drop */}
              {latestDrop && (
                <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '16px', boxShadow: 'var(--shadow-card)' }}>
                  <div className="eyebrow text-gold-deep mb-3" style={{ fontSize: '0.58rem' }}>Latest Drop</div>
                  {latestDrop.coverUrl ? (
                    <img src={latestDrop.coverUrl} alt={latestDrop.title} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} loading="lazy" />
                  ) : (
                    <div style={{ aspectRatio: '1', background: 'linear-gradient(135deg, #1A1A1A, #2A2A2A)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '10px' }}>🎵</div>
                  )}
                  <p style={{ margin: '0 0 2px', fontWeight: 800, color: 'var(--primary-dark)', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{latestDrop.title}</p>
                  <p style={{ margin: '0 0 8px', fontSize: '0.72rem', color: '#6B7280' }}>{latestDrop.artist}</p>
                  <Link href="/music/videos" className="text-gold" style={{ fontSize: '0.62rem', fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Watch Now →</Link>
                </div>
              )}

              {/* Ad unit */}
              <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '12px', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
                <AdUnit slot="5520370976" format="rectangle" />
              </div>
            </div>
          </aside>

        </div>

        {/* ── Camer360 Brief CTA — matches Lovable article page bottom ── */}
        <NewsletterSection />

      </div>
    </>
  )
}
