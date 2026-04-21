import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCelebrity, CELEBRITIES } from '@/lib/celebrities'
import { searchArticles } from '@/lib/db/queries'
import { ArticleCard } from '@/components/article/ArticleCard'
import { FollowButton } from '@/components/celebrities/FollowButton'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildPersonSchema, buildBreadcrumbSchema } from '@/lib/seo/schema'
import { SITE_URL } from '@/lib/constants'

interface Props { params: Promise<{ name: string }> }

export async function generateStaticParams() {
  return CELEBRITIES.map(c => ({ name: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params
  const celeb = getCelebrity(name)
  if (!celeb) return {}
  return {
    title:       `${celeb.name} | Camer360`,
    description: `Latest news, stories and coverage of ${celeb.name} — ${celeb.known_for}. Follow ${celeb.name} on Camer360.`,
    openGraph: {
      title:       `${celeb.name} — Celebrity Hub | Camer360`,
      description: celeb.bio.slice(0, 155),
      url:         `${SITE_URL}/celebrities/${celeb.slug}`,
    },
  }
}

export default async function CelebrityHubPage({ params }: Props) {
  const { name } = await params
  const celeb = getCelebrity(name)
  if (!celeb) notFound()

  const articles = await searchArticles(celeb.searchName, 20)

  const personSchema    = buildPersonSchema(celeb)
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home',        url: SITE_URL },
    { name: 'Celebrities', url: `${SITE_URL}/celebrities` },
    { name: celeb.name,    url: `${SITE_URL}/celebrities/${celeb.slug}` },
  ])

  return (
    <div style={{ background: 'var(--luxury-bg)', minHeight: '100vh' }}>
      <JsonLd data={personSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* ── Hero ── */}
      <div style={{
        background: 'var(--grad-dark)',
        paddingTop: '64px', paddingBottom: '64px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* grain */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '0 40px', position: 'relative' }}>

          {/* Breadcrumb */}
          <nav style={{ display: 'flex', gap: '8px', fontSize: '0.72rem', color: '#555', marginBottom: '28px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <Link href="/" style={{ color: '#555', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <Link href="/celebrities" style={{ color: '#555', textDecoration: 'none' }}>Celebrities</Link>
            <span>›</span>
            <span style={{ color: '#D4AF37' }}>{celeb.name}</span>
          </nav>

          {/* Category pill */}
          <span style={{
            display: 'inline-block',
            background: 'linear-gradient(45deg, #D4AF37, #F0D060)',
            color: '#1A1A1A',
            padding: '6px 18px',
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            fontWeight: 900,
            borderRadius: '20px',
            marginBottom: '20px',
          }}>
            {celeb.category}
          </span>

          {/* Name */}
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 700,
            lineHeight: 1.05,
            color: 'white',
            marginBottom: '12px',
            letterSpacing: '-0.02em',
          }}>
            {celeb.name}
          </h1>

          {/* Known for */}
          <p style={{ fontSize: '0.88rem', color: '#D4AF37', fontWeight: 600, marginBottom: '20px', letterSpacing: '0.02em' }}>
            {celeb.known_for}
          </p>

          {/* Gold divider */}
          <div style={{ width: '60px', height: '2px', background: 'linear-gradient(90deg, #D4AF37, #F0D060)', marginBottom: '24px', borderRadius: '1px' }} />

          {/* Bio */}
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, maxWidth: '680px' }}>
            {celeb.bio}
          </p>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '24px' }}>
            <span style={{ fontSize: '0.65rem', color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', alignSelf: 'center' }}>
              Topics:
            </span>
            {celeb.tags.map(tag => (
              <span key={tag} style={{
                background: '#1A1A1A', border: '1px solid #2A2A2A',
                color: '#888', padding: '4px 12px', borderRadius: '20px',
                fontSize: '0.72rem', fontWeight: 600,
              }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Nationality + Follow */}
          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {celeb.nationality}
            </span>
            <FollowButton type="celeb" slug={celeb.slug} label={celeb.name} />
            <Link href="/my-feed" style={{ fontSize: '0.72rem', color: '#555', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              View My Feed →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Articles ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 40px 80px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '36px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-dark)', margin: 0 }}>
            Stories about {celeb.name}
          </h2>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, var(--border-light), transparent)' }} />
          {articles.length > 0 && (
            <span style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
              {articles.length} article{articles.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {articles.length === 0 ? (
          <div style={{
            background: '#F9F7F4', border: '1px solid var(--border-light)',
            borderRadius: '16px', padding: '64px', textAlign: 'center',
          }}>
            <p style={{ fontSize: '2rem', marginBottom: '12px' }}>✍️</p>
            <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>
              No articles yet — check back soon for the latest {celeb.name} coverage.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {articles.map(a => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}

        {/* Other celebrities */}
        <div style={{ marginTop: '64px', borderTop: '1px solid var(--border-light)', paddingTop: '48px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '24px' }}>
            More Celebrity Profiles
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {CELEBRITIES.filter(c => c.slug !== celeb.slug).map(c => (
              <Link
                key={c.slug}
                href={`/celebrities/${c.slug}`}
                style={{
                  display: 'flex', flexDirection: 'column', gap: '4px',
                  background: 'white', border: '1px solid var(--border-light)',
                  borderRadius: '12px', padding: '16px 20px',
                  textDecoration: 'none', transition: 'border-color 0.15s',
                  minWidth: '160px',
                }}
                className="hover:border-[#D4AF37]"
              >
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary-dark)' }}>{c.name}</span>
                <span style={{ fontSize: '0.65rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{c.category}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
