'use client'
import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useConsent } from '@/components/ads/ConsentContext'
import { ADSENSE_ID } from '@/lib/constants'

export default function AdSenseLoader() {
  const pathname   = usePathname()
  const { hasConsent } = useConsent()

  if (pathname.startsWith('/admin') || !hasConsent) return null

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  )
}
