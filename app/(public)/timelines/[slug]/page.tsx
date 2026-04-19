import type { Metadata } from 'next'
import { notFound }   from 'next/navigation'
import Link           from 'next/link'
import { JsonLd }     from '@/components/seo/JsonLd'
import { HitTracker } from '@/components/article/HitTracker'
import CelebrityTimeline from '@/components/editorial/CelebrityTimeline'
import { getArticleBySlug } from '@/lib/db/queries'
import { buildArticleMetadata } from '@/lib/seo/metadata'
import { buildBreadcrumbSchema } from '@/lib/seo/schema'
import { SITE_URL } from '@/lib/constants'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug('celebrity-timelines', slug)
  if (!article) return {}
  return {
    ...buildArticleMetadata(article),
    title: `${article.title} — Career Timeline | Camer360`,
  }
}

export default async function TimelineDetailPage({ params }: Props) {
  const { slug } = await params
  const article = await getArticleBySlug('celebrity-timelines', slug)
  if (!article) notFound()

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home',               url: SITE_URL },
    { name: 'Celebrity Timelines', url: `${SITE_URL}/timelines` },
    { name: article.title,        url: `${SITE_URL}/timelines/${slug}` },
  ])

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    'name': article.title,
    'description': article.excerpt ?? undefined,
    'image': article.featuredImage ?? undefined,
    'url': `${SITE_URL}/timelines/${slug}`,
  }

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={personSchema} />
      <HitTracker articleId={article.id} />

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Breadcrumb */}
        <nav style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: '#555', marginBottom: '32px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          <Link href="/" style={{ color: '#555', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link href="/timelines" style={{ color: '#555', textDecoration: 'none' }}>Timelines</Link>
          <span>›</span>
          <span style={{ color: '#D4AF37' }}>{article.title}</span>
        </nav>

        {/* Label */}
        <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37' }}>
          Career Timeline
        </span>

        {/* Timeline renderer */}
        <div style={{ marginTop: '24px' }}>
          <CelebrityTimeline article={article} />
        </div>

        {/* Back link */}
        <div style={{ marginTop: '48px', borderTop: '1px solid #1E1E1E', paddingTop: '24px' }}>
          <Link href="/timelines" style={{ color: '#D4AF37', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700 }}>
            ← All Celebrity Timelines
          </Link>
        </div>
      </div>
    </>
  )
}
