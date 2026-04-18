export const dynamic = 'force-dynamic'
export const revalidate = 0

import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BreakingBanner } from '@/components/article/BreakingBanner'
import { ArticleCard } from '@/components/article/ArticleCard'
import InstallBanner from '@/components/pwa/InstallBanner'
import SubscribeForm from '@/components/newsletter/SubscribeForm'
import { JsonLd } from '@/components/seo/JsonLd'
import {
  getFeaturedArticles, getLatestArticles,
  getMostRead, getArticlesByCategory, getAllCategories,
  getBreakingNews,
} from '@/lib/db/queries'
import { buildSiteMetadata } from '@/lib/seo/metadata'
import { buildOrganizationSchema } from '@/lib/seo/schema'
import type { ArticleWithRelations, Category } from '@/lib/types'

export const metadata: Metadata = buildSiteMetadata()

export default async function HomePage() {
  let featured:  ArticleWithRelations[] = []
  let latest:    ArticleWithRelations[] = []
  let mostRead:  ArticleWithRelations[] = []
  let allCats:   Category[]             = []
  let breaking:  Awaited<ReturnType<typeof getBreakingNews>> = []

  try {
    ;[featured, latest, mostRead, allCats, breaking] = await Promise.all([
      getFeaturedArticles(7),
      getLatestArticles(18),
      getMostRead(5),
      getAllCategories(),
      getBreakingNews(5),
    ])
  } catch (err) {
    console.error('Homepage DB error:', err)
  }

  const targetSlugs = ['celebrities', 'music', 'gossip', 'viral', 'film-tv', 'fashion-beauty', 'money-moves', 'diaspora']
  const availableSlugs = targetSlugs.filter(s => allCats.some(c => c.slug === s))

  let categoryRows: { slug: string; name: string; articles: ArticleWithRelations[] }[] = []
  try {
    categoryRows = await Promise.all(
      availableSlugs.slice(0, 6).map(async slug => {
        const cat = allCats.find(c => c.slug === slug)!
        const { articles: arts } = await getArticlesByCategory(cat.slug, 1, 4)
        return { slug: cat.slug, name: cat.name, articles: arts }
      })
    )
  } catch (err) {
    console.error('Category rows DB error:', err)
  }

  return (
    <>
      {/* styles live in globals.css */}
      {false && `
        
        /* CSS CUSTOM PROPERTIES */
        :root {
          --primary-gold: #D4AF37;
          --gold-light: #F7DC6F;
          --primary-dark: #1A1A1A;
          --secondary-dark: #2D2D2D;
          --text-light: rgba(255,255,255,0.9);
          --text-muted: rgba(255,255,255,0.7);
          --luxury-bg: #FEFEFD;
          --luxury-secondary: #F8F8F7;
          --border-light: #E8E8E6;
        }

        /* FORCE OVERRIDE ALL EXISTING STYLES */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', sans-serif !important;
          background: var(--luxury-bg) !important;
          line-height: 1.6 !important;
          overflow-x: hidden !important;
          color: #1A1A1A !important;
        }

        .ultra-premium-page {
          font-family: 'Inter', sans-serif;
          background: var(--luxury-bg);
          overflow-x: hidden;
          position: relative;
        }

        .playfair {
          font-family: 'Playfair Display', serif !important;
        }

        /* ULTRA-PREMIUM HEADER SYSTEM */
        .premium-header {
          position: relative;
          background: linear-gradient(135deg, var(--luxury-bg) 0%, var(--luxury-secondary) 100%);
          border-bottom: 1px solid var(--border-light);
          z-index: 100;
        }

        .trending-bar {
          background: rgba(0,0,0,0.95);
          padding: 12px 0;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 2px;
          position: relative;
          overflow: hidden;
        }

        .trending-bar::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .trending-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .trending-items {
          display: flex;
          align-items: center;
          gap: 40px;
          flex-wrap: wrap;
        }

        .trending-label {
          color: var(--primary-gold);
          font-weight: 600;
          margin-right: 20px;
          position: relative;
        }

        .trending-label::after {
          content: '';
          position: absolute;
          right: -15px;
          top: 50%;
          transform: translateY(-50%);
          width: 6px;
          height: 6px;
          background: var(--primary-gold);
          border-radius: 50%;
        }

        .trending-link {
          color: #E8E8E6;
          text-decoration: none;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          white-space: nowrap;
        }

        .trending-link::before {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1px;
          background: var(--primary-gold);
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .trending-link:hover::before {
          width: 100%;
        }

        .trending-link:hover {
          color: var(--primary-gold);
        }

        .social-links {
          display: flex;
          gap: 20px;
        }

        .social-link {
          width: 32px;
          height: 32px;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #E8E8E6;
          text-decoration: none;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 14px;
          font-weight: 600;
        }

        .social-link:hover {
          background: var(--primary-gold);
          border-color: var(--primary-gold);
          transform: translateY(-2px);
          color: var(--primary-dark);
        }

        .main-header {
          padding: 48px 40px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          position: relative;
          gap: 40px;
        }

        .main-header::before {
          content: '';
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 1px;
          height: calc(100% - 40px);
          background: linear-gradient(to bottom, transparent, var(--border-light), transparent);
        }

        .logo {
          justify-self: center;
          font-family: 'Playfair Display', serif;
          font-size: 42px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--primary-dark);
          position: relative;
          text-transform: uppercase;
          text-decoration: none;
        }

        .logo::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--primary-gold), transparent);
        }

        .nav-left, .nav-right {
          display: flex;
          gap: 36px;
          align-items: center;
          flex-wrap: wrap;
        }

        .nav-right {
          justify-content: flex-end;
        }

        .nav-link {
          color: #2A2A2A !important;
          text-decoration: none !important;
          font-size: 13px !important;
          text-transform: uppercase !important;
          letter-spacing: 1.5px !important;
          font-weight: 500 !important;
          position: relative !important;
          padding: 8px 0 !important;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background: var(--primary-gold);
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .nav-link:hover {
          color: var(--primary-gold) !important;
        }

        /* ULTRA-SOPHISTICATED HERO SECTION */
        .hero-section {
          position: relative;
          height: 100vh;
          min-height: 800px;
          background: linear-gradient(135deg, var(--primary-dark) 0%, var(--secondary-dark) 50%, var(--primary-dark) 100%);
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .hero-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="0.5" fill="%23ffffff" opacity="0.1"/><circle cx="80" cy="40" r="0.3" fill="%23ffffff" opacity="0.15"/><circle cx="40" cy="80" r="0.4" fill="%23ffffff" opacity="0.1"/><circle cx="70" cy="70" r="0.2" fill="%23ffffff" opacity="0.2"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          opacity: 0.3;
        }

        .hero-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          display: grid;
          grid-template-columns: 2.5fr 1fr;
          gap: 80px;
          align-items: center;
          position: relative;
          z-index: 2;
          width: 100%;
        }

        .hero-main {
          position: relative;
        }

        .hero-meta {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .hero-category {
          background: linear-gradient(45deg, var(--primary-gold), var(--gold-light));
          color: var(--primary-dark);
          padding: 12px 24px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 600;
          border-radius: 24px;
          position: relative;
          overflow: hidden;
        }

        .hero-category::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 2s infinite;
        }

        .hero-date {
          color: var(--text-muted);
          font-size: 13px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(48px, 6vw, 72px);
          font-weight: 700;
          line-height: 1.1;
          color: white;
          margin-bottom: 32px;
          position: relative;
        }

        .hero-excerpt {
          font-size: 18px;
          line-height: 1.7;
          color: var(--text-light);
          margin-bottom: 48px;
          max-width: 600px;
          font-weight: 300;
        }

        .hero-cta {
          display: flex;
          gap: 24px;
          align-items: center;
          flex-wrap: wrap;
        }

        .cta-primary {
          background: linear-gradient(45deg, var(--primary-gold), var(--gold-light));
          color: var(--primary-dark);
          padding: 18px 36px;
          border: none;
          border-radius: 32px;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          text-decoration: none;
          display: inline-block;
        }

        .cta-primary::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 0;
          height: 0;
          background: rgba(255,255,255,0.3);
          border-radius: 50%;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .cta-primary:hover::before {
          width: 300px;
          height: 300px;
        }

        .cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(212, 175, 55, 0.3);
        }

        .cta-secondary {
          color: var(--text-light);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
          position: relative;
          padding: 18px 0;
        }

        .cta-secondary::after {
          content: '→';
          margin-left: 12px;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .cta-secondary:hover::after {
          transform: translateX(4px);
        }

        /* PREMIUM SIDEBAR CARDS */
        .hero-sidebar {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .sidebar-card {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(20px);
          padding: 40px;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.2);
          position: relative;
          overflow: hidden;
        }

        .sidebar-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, var(--primary-gold), var(--gold-light), var(--primary-gold));
        }

        .card-title {
          font-family: 'Playfair Display', serif;
          font-size: 24px;
          font-weight: 600;
          color: var(--primary-dark);
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .newsletter-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .newsletter-input {
          padding: 16px 20px;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 12px;
          font-size: 14px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          background: white;
          width: 100%;
        }

        .newsletter-input:focus {
          outline: none;
          border-color: var(--primary-gold);
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
        }

        .newsletter-btn {
          background: linear-gradient(45deg, var(--primary-dark), var(--secondary-dark));
          color: white;
          padding: 16px 32px;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .newsletter-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        }

        .trending-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          counter-reset: trending;
        }

        .trending-item {
          padding: 20px 0;
          border-bottom: 1px solid rgba(0,0,0,0.08);
          position: relative;
          padding-left: 40px;
        }

        .trending-item:last-child {
          border-bottom: none;
        }

        .trending-item::before {
          content: counter(trending, decimal-leading-zero);
          counter-increment: trending;
          position: absolute;
          left: 0;
          top: 20px;
          width: 24px;
          height: 24px;
          background: var(--primary-gold);
          color: white;
          font-size: 11px;
          font-weight: 600;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .trending-title {
          font-size: 14px;
          font-weight: 500;
          line-height: 1.4;
          color: var(--primary-dark);
          margin-bottom: 8px;
        }

        .trending-meta {
          font-size: 12px;
          color: #666;
          display: flex;
          gap: 16px;
        }

        /* CONTENT SECTIONS */
        .content-section {
          padding: 120px 0;
          position: relative;
        }

        .section-luxury {
          background: linear-gradient(135deg, var(--luxury-bg) 0%, var(--luxury-secondary) 100%);
        }

        .section-dark {
          background: linear-gradient(135deg, var(--primary-dark) 0%, var(--secondary-dark) 100%);
          color: white;
        }

        .section-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
        }

        .section-header {
          text-align: center;
          margin-bottom: 80px;
        }

        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 700;
          margin-bottom: 24px;
          position: relative;
          display: inline-block;
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: -12px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--primary-gold), transparent);
        }

        .section-subtitle {
          font-size: 20px;
          font-weight: 300;
          max-width: 600px;
          margin: 0 auto;
          opacity: 0.8;
        }

        /* PREMIUM ARTICLE GRID */
        .articles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 48px;
        }

        .premium-article-card {
          position: relative;
          background: white;
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(0,0,0,0.05);
          text-decoration: none;
          color: inherit;
        }

        .premium-article-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 32px 80px rgba(0,0,0,0.12);
          text-decoration: none;
          color: inherit;
        }

        .article-image {
          width: 100%;
          height: 280px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          position: relative;
          overflow: hidden;
        }

        .article-image::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.2);
          transition: background 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .premium-article-card:hover .article-image::before {
          background: rgba(0,0,0,0.4);
        }

        .article-content {
          padding: 40px;
        }

        .article-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .article-category {
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          padding: 8px 16px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-radius: 16px;
          font-weight: 600;
        }

        .article-date {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .article-title {
          font-family: 'Playfair Display', serif;
          font-size: 24px;
          font-weight: 600;
          line-height: 1.3;
          margin-bottom: 16px;
          color: var(--primary-dark);
        }

        .article-excerpt {
          font-size: 16px;
          line-height: 1.6;
          color: #666;
          margin-bottom: 24px;
        }

        .read-more {
          color: var(--primary-gold);
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          position: relative;
        }

        .read-more::after {
          content: '→';
          margin-left: 8px;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .read-more:hover::after {
          transform: translateX(4px);
        }

        /* RESPONSIVE DESIGN */
        @media (max-width: 1200px) {
          .hero-content {
            grid-template-columns: 1fr;
            gap: 60px;
            text-align: center;
          }
          
          .main-header {
            grid-template-columns: 1fr;
            gap: 24px;
            text-align: center;
          }
          
          .main-header::before {
            display: none;
          }
          
          .nav-left, .nav-right {
            justify-content: center;
          }

          .logo {
            margin-bottom: 20px;
          }
        }

        @media (max-width: 768px) {
          .trending-content {
            padding: 0 20px;
            flex-direction: column;
            gap: 20px;
          }
          
          .trending-items {
            gap: 20px;
            justify-content: center;
          }
          
          .main-header {
            padding: 24px 20px;
          }
          
          .hero-content {
            padding: 0 20px;
          }
          
          .section-inner {
            padding: 0 20px;
          }

          .nav-left, .nav-right {
            gap: 20px;
            flex-wrap: wrap;
          }

          .hero-meta {
            justify-content: center;
          }

          .hero-cta {
            justify-content: center;
          }

          .articles-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .logo {
            font-size: 32px;
          }

          .hero-title {
            font-size: 36px;
          }

          .trending-items {
            flex-direction: column;
            align-items: center;
          }

          .nav-left, .nav-right {
            flex-direction: column;
            gap: 16px;
          }
        }
      `}

      <div className="ultra-premium-page">
        <JsonLd data={buildOrganizationSchema()} />
        <BreakingBanner articles={breaking} />
        <Header />

        {/* Ultra-Sophisticated Hero */}
        <div className="hero-section">
          <div className="hero-bg" style={featured[0]?.featuredImage ? {
            backgroundImage: `url(${featured[0].featuredImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.4,
          } : undefined} />
          <div className="hero-content">
            <div className="hero-main">
              <div className="hero-meta">
                <div className="hero-category">Exclusive Feature</div>
                <div className="hero-date">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
              <h1 className="hero-title playfair">
                {featured[0]?.title || "Cameroon's Entertainment Revolution"}
              </h1>
              <p className="hero-excerpt">
                {featured[0]?.excerpt || "From Yaoundé to the diaspora, Central & West African stars are conquering global entertainment. Discover Cameroon's A-listers, regional celebrities, and the cultural movements shaping our continent."}
              </p>
              <div className="hero-cta">
                <Link href={featured[0] ? `/${featured[0].category.slug}/${featured[0].slug}` : '/celebrities'} className="cta-primary">Read Full Story</Link>
                <Link href="/celebrities" className="cta-secondary">Explore More</Link>
              </div>
            </div>
            
            <div className="hero-sidebar">
              <div className="sidebar-card">
                <h3 className="card-title playfair">Newsletter</h3>
                <p style={{color: '#666', marginBottom: '24px', fontSize: '14px'}}>Get exclusive Central &amp; West African entertainment insights with Cameroon at the heart.</p>
                <div className="newsletter-form">
                  <input type="email" className="newsletter-input" placeholder="Enter your email address" />
                  <button className="newsletter-btn">Subscribe Now</button>
                </div>
              </div>
              
              <div className="sidebar-card">
                <h3 className="card-title playfair">Trending Now</h3>
                <div className="trending-list">
                  {mostRead.slice(0, 3).map((article) => (
                    <Link key={article.id} href={`/${article.category.slug}/${article.slug}`} style={{textDecoration: 'none', color: 'inherit'}}>
                      <div className="trending-item">
                        <div className="trending-title">{article.title}</div>
                        <div className="trending-meta">
                          <span>{article.category?.name || 'Entertainment'}</span>
                          <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ''}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {mostRead.length === 0 && (
                    <>
                      <div className="trending-item">
                        <div className="trending-title">Charlotte Dipanda's new album tops African charts</div>
                        <div className="trending-meta">
                          <span>Music</span>
                          <span>2 hours ago</span>
                        </div>
                      </div>
                      <div className="trending-item">
                        <div className="trending-title">André Onana named Premier League's best keeper</div>
                        <div className="trending-meta">
                          <span>Sport</span>
                          <span>4 hours ago</span>
                        </div>
                      </div>
                      <div className="trending-item">
                        <div className="trending-title">Douala Fashion Week breaks all records</div>
                        <div className="trending-meta">
                          <span>Style</span>
                          <span>6 hours ago</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Content Section */}
        <div className="content-section section-luxury">
          <div className="section-inner">
            <div className="section-header">
              <h2 className="section-title playfair">Latest Stories</h2>
              <p className="section-subtitle">Curated entertainment news from across the African continent and diaspora</p>
            </div>
            
            <div className="articles-grid">
              {latest.slice(0, 6).map(article => (
                <Link key={article.id} href={`/${article.category.slug}/${article.slug}`} className="premium-article-card">
                  <div className="article-image" style={article.featuredImage ? {
                    backgroundImage: `url(${article.featuredImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  } : undefined} />
                  <div className="article-content">
                    <div className="article-meta">
                      <span className="article-category">{article.category?.name || 'Entertainment'}</span>
                      <span className="article-date">{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ''}</span>
                    </div>
                    <h3 className="article-title">{article.title}</h3>
                    <p className="article-excerpt">{article.excerpt}</p>
                    <span className="read-more">Read More</span>
                  </div>
                </Link>
              ))}
              {latest.length === 0 && (
                <>
                  <div className="premium-article-card">
                    <div className="article-image"></div>
                    <div className="article-content">
                      <div className="article-meta">
                        <span className="article-category">Celebrities</span>
                        <span className="article-date">2 hours ago</span>
                      </div>
                      <h3 className="article-title">Samuel Eto'o's Foundation Transforms Cameroon</h3>
                      <p className="article-excerpt">The football legend's charitable work is reshaping communities from Yaoundé to the Adamawa region.</p>
                      <span className="read-more">Read More</span>
                    </div>
                  </div>
                  <div className="premium-article-card">
                    <div className="article-image"></div>
                    <div className="article-content">
                      <div className="article-meta">
                        <span className="article-category">Music</span>
                        <span className="article-date">4 hours ago</span>
                      </div>
                      <h3 className="article-title">Charlotte Dipanda Conquers European Charts</h3>
                      <p className="article-excerpt">Cameroon's queen of soul blends bikutsi rhythms with contemporary production on her landmark new album.</p>
                      <span className="read-more">Read More</span>
                    </div>
                  </div>
                  <div className="premium-article-card">
                    <div className="article-image"></div>
                    <div className="article-content">
                      <div className="article-meta">
                        <span className="article-category">Film & TV</span>
                        <span className="article-date">6 hours ago</span>
                      </div>
                      <h3 className="article-title">Douala's Rising Filmmakers Take on the World</h3>
                      <p className="article-excerpt">Meet the Cameroonian directors reshaping Central African cinema for global audiences.</p>
                      <span className="read-more">Read More</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Category Sections */}
        {categoryRows.map(row => row.articles.length > 0 && (
          <div key={row.slug} className="content-section section-dark">
            <div className="section-inner">
              <div className="section-header">
                <h2 className="section-title playfair">{row.name}</h2>
                <Link
                  href={`/${row.slug}`}
                  style={{
                    color: 'var(--primary-gold)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginTop: '24px',
                    display: 'inline-block'
                  }}
                >
                  See All Stories →
                </Link>
              </div>
              <div className="articles-grid">
                {row.articles.map(article => (
                  <Link key={article.id} href={`/${article.category.slug}/${article.slug}`} className="premium-article-card">
                    <div className="article-image" style={article.featuredImage ? {
                      backgroundImage: `url(${article.featuredImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    } : undefined} />
                    <div className="article-content">
                      <div className="article-meta">
                        <span className="article-category">{article.category?.name || 'Entertainment'}</span>
                        <span className="article-date">{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ''}</span>
                      </div>
                      <h3 className="article-title">{article.title}</h3>
                      <p className="article-excerpt">{article.excerpt}</p>
                      <span className="read-more">Read More</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}

        <Footer />
      </div>
    </>
  )
}
