import type { Metadata } from 'next'
import { notFound }   from 'next/navigation'
import Link           from 'next/link'
import { JsonLd }     from '@/components/seo/JsonLd'
import { HitTracker } from '@/components/article/HitTracker'
import FamilyTreeRenderer from '@/components/editorial/FamilyTreeRenderer'
import { getArticleBySlug } from '@/lib/db/queries'
import { buildArticleMetadata } from '@/lib/seo/metadata'
import { buildBreadcrumbSchema } from '@/lib/seo/schema'
import { SITE_URL } from '@/lib/constants'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug('family-trees', slug)
  if (!article) return {}
  return {
    ...buildArticleMetadata(article),
    title: `${article.title} — Family Tree | Camer360`,
  }
}

export default async function FamilyTreeDetailPage({ params }: Props) {
  const { slug } = await params
  const article = await getArticleBySlug('family-trees', slug)
  if (!article) notFound()

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home',          url: SITE_URL },
    { name: 'Family Trees',  url: `${SITE_URL}/family-trees` },
    { name: article.title,   url: `${SITE_URL}/family-trees/${slug}` },
  ])

  return (
    <>
      <JsonLd data={breadcrumb} />
      <HitTracker articleId={article.id} />

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Breadcrumb */}
        <nav style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: '#555', marginBottom: '32px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          <Link href="/" style={{ color: '#555', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link href="/family-trees" style={{ color: '#555', textDecoration: 'none' }}>Family Trees</Link>
          <span>›</span>
          <span style={{ color: '#D4AF37' }}>{article.title}</span>
        </nav>

        <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37' }}>
          Dynasty
        </span>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#fff', marginTop: '8px', lineHeight: 1.1, marginBottom: '8px' }}>
          {article.title}
        </h1>
        {article.excerpt && (
          <p style={{ color: '#888', fontSize: '1rem', lineHeight: 1.7, marginBottom: '40px' }}>{article.excerpt}</p>
        )}

        {/* Tree renderer */}
        <FamilyTreeRenderer article={article} />

        {/* Back */}
        <div style={{ marginTop: '48px', borderTop: '1px solid #1E1E1E', paddingTop: '24px' }}>
          <Link href="/family-trees" style={{ color: '#D4AF37', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700 }}>
            ← All Family Trees
          </Link>
        </div>
      </div>
    </>
  )
}
