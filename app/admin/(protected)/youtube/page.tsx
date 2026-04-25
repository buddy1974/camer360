import type { Metadata } from 'next'
import { YouTubeSetupClient } from './YouTubeSetupClient'

export const metadata: Metadata = { title: 'YouTube Integration | Camer360 Admin' }
export const dynamic = 'force-dynamic'

export default async function YouTubeAdminPage() {
  // Server-side: check which vars are accessible at runtime
  // NEXT_PUBLIC_ vars are always available (baked into build)
  // Private vars only appear if set via Vercel dashboard (NOT via CLI/REST API)
  const vars = {
    apiKey:       !!process.env['YOUTUBE_API_KEY'],
    clientId:     !!process.env['YOUTUBE_CLIENT_ID'],
    clientSecret: !!process.env['YOUTUBE_CLIENT_SECRET'],
    channelId:    !!process.env['YOUTUBE_CHANNEL_ID'],
    refreshToken: !!process.env['YOUTUBE_REFRESH_TOKEN'],
    // NEXT_PUBLIC_ — always available regardless of Vercel injection issue
    publicClientId: process.env['NEXT_PUBLIC_YOUTUBE_CLIENT_ID'] ?? '',
  }

  return <YouTubeSetupClient serverVars={vars} />
}
