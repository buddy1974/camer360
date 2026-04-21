import {
  SITE_NAME, SITE_URL, SITE_LOGO,
  SITE_FB, SITE_TWITTER,
} from '@/lib/constants'
import type { ArticleWithRelations } from '@/lib/types'
import type { CelebrityProfile }     from '@/lib/celebrities'
import { absoluteUrl } from '@/lib/utils'

export function buildNewsArticleSchema(article: ArticleWithRelations): object {
  const url   = absoluteUrl(`/${article.category.slug}/${article.slug}`)
  const image = article.featuredImage || `${SITE_URL}/icons/og-default.jpg`

  const author = article.author
    ? {
        '@type': 'Person',
        'name':  article.author.name,
        'url':   `${SITE_URL}/authors/${article.author.slug}`,
      }
    : {
        '@type': 'Organization',
        'name':  SITE_NAME,
        'url':   SITE_URL,
      }

  return {
    '@context':       'https://schema.org',
    '@type':          'NewsArticle',
    'headline':       article.title,
    'description':    article.excerpt || '',
    'url':            url,
    'datePublished':  article.publishedAt,
    'dateModified':   article.updatedAt || article.publishedAt,
    'articleSection': article.category.name,
    'keywords':       `${article.category.name}, Cameroon, Africa, entertainment`,
    'inLanguage':     'en',
    'image': [image],
    'author':  author,
    'publisher': {
      '@type': 'Organization',
      'name':  SITE_NAME,
      'url':   SITE_URL,
      'logo': {
        '@type':  'ImageObject',
        'url':    SITE_LOGO,
        'width':  214,
        'height': 50,
      },
      'sameAs': [SITE_FB, `https://twitter.com/${SITE_TWITTER.replace('@', '')}`],
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id':   url,
    },
  }
}

export function buildPersonSchema(celeb: CelebrityProfile): object {
  return {
    '@context':   'https://schema.org',
    '@type':      'Person',
    'name':       celeb.name,
    'url':        `${SITE_URL}/celebrities/${celeb.slug}`,
    'description': celeb.bio,
    'nationality': celeb.nationality,
    'knowsAbout':  celeb.tags,
    'sameAs':      [],
  }
}

export function buildOrganizationSchema(): object {
  return {
    '@context':    'https://schema.org',
    '@type':       'Organization',
    'name':        SITE_NAME,
    'url':         SITE_URL,
    'logo':        SITE_LOGO,
    'sameAs':      [SITE_FB, `https://twitter.com/${SITE_TWITTER.replace('@', '')}`],
    'foundingDate': '2025',
    'areaServed':  ['Cameroon', 'West Africa', 'Central Africa', 'Africa'],
    'knowsLanguage': ['en', 'fr'],
    'description': "West & Central Africa's premier entertainment magazine covering celebrities, music, film, sport stars, influencers, entrepreneurs and events.",
  }
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    'itemListElement': items.map((item, i) => ({
      '@type':    'ListItem',
      'position': i + 1,
      'name':     item.name,
      'item':     item.url,
    })),
  }
}

export function buildWebSiteSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type':    'WebSite',
    'name':     SITE_NAME,
    'url':      SITE_URL,
    'potentialAction': {
      '@type':       'SearchAction',
      'target':      `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}
