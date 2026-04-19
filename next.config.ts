import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
  async redirects() {
    return [
      // Legacy site redirects
      { source: '/privacy-policy', destination: '/privacy',    permanent: true },
      { source: '/sports',         destination: '/sport-stars', permanent: true },
      { source: '/sports/:path*',  destination: '/sport-stars/:path*', permanent: true },

      // Old category → new category (SEO 301s)
      { source: '/fashion-beauty',          destination: '/style',         permanent: true },
      { source: '/fashion-beauty/:path*',   destination: '/style/:path*',  permanent: true },
      { source: '/money-moves',             destination: '/entrepreneurs',         permanent: true },
      { source: '/money-moves/:path*',      destination: '/entrepreneurs/:path*',  permanent: true },
      { source: '/gossip',                  destination: '/celebrities',    permanent: true },
      { source: '/gossip/:path*',           destination: '/celebrities/:path*', permanent: true },
      { source: '/influencers',             destination: '/celebrities',    permanent: true },
      { source: '/influencers/:path*',      destination: '/celebrities/:path*', permanent: true },
      { source: '/viral',                   destination: '/celebrities',    permanent: true },
      { source: '/viral/:path*',            destination: '/celebrities/:path*', permanent: true },
      { source: '/exposed',                 destination: '/celebrities',    permanent: true },
      { source: '/exposed/:path*',          destination: '/celebrities/:path*', permanent: true },
      { source: '/real-talk',               destination: '/style',          permanent: true },
      { source: '/real-talk/:path*',        destination: '/style/:path*',   permanent: true },
      { source: '/diaspora',                destination: '/usa',            permanent: true },
      { source: '/diaspora/:path*',         destination: '/usa/:path*',     permanent: true },
    ]
  },
}

export default nextConfig
