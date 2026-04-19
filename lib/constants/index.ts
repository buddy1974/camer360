export const SITE_NAME    = 'Camer360'
export const SITE_URL     = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.camer360.com'
export const SITE_TAGLINE = '360° of African Life'
export const SITE_DESCRIPTION = 'West & Central Africa\'s premier celebrity and entertainment magazine. Celebrities, music, fashion, gossip, and lifestyle.'
export const SITE_TWITTER  = '@Camer360'
export const SITE_FB       = 'https://www.facebook.com/camer360'
export const SITE_LOGO     = `${SITE_URL}/icons/logo.png`
export const ADSENSE_ID    = 'ca-pub-0554291063972402'

export const CATEGORIES = [
  { slug: 'celebrities',   name: 'Celebrities',   color: '#E91E8C' },
  { slug: 'music',         name: 'Music',         color: '#FF9800' },
  { slug: 'film-tv',       name: 'Film & TV',     color: '#2196F3' },
  { slug: 'sport-stars',   name: 'Sport Stars',   color: '#3F51B5' },
  { slug: 'influencers',   name: 'Influencers',   color: '#9C27B0' },
  { slug: 'entrepreneurs', name: 'Entrepreneurs', color: '#4CAF50' },
  { slug: 'events',        name: 'Events',        color: '#D4AF37' },
] as const

export const NAV_CATEGORIES = [
  { slug: 'celebrities',   name: 'Celebrities'   },
  { slug: 'music',         name: 'Music'         },
  { slug: 'film-tv',       name: 'Film & TV'     },
  { slug: 'sport-stars',   name: 'Sport Stars'   },
  { slug: 'influencers',   name: 'Influencers'   },
  { slug: 'entrepreneurs', name: 'Entrepreneurs' },
  { slug: 'events',        name: 'Events'        },
] as const

export const ARTICLES_PER_PAGE   = 20
export const BREAKING_NEWS_COUNT = 5
export const FEATURED_COUNT      = 3
export const RELATED_COUNT       = 4

export const READING_SPEED_WPM = 200
