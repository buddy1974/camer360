'use client'
import { useEffect } from 'react'
import { ADSENSE_ID } from '@/lib/constants'

interface AdUnitProps {
  slot: string
  format?: 'auto' | 'rectangle' | 'horizontal'
  className?: string
  style?: React.CSSProperties
}

export default function AdUnit({ slot, format = 'auto', className = '', style }: AdUnitProps) {
  useEffect(() => {
    try {
      const adsbygoogle = (window as any).adsbygoogle
      if (adsbygoogle) {
        adsbygoogle.push({})
      }
    } catch (e) {
      console.error('AdSense error:', e)
    }
  }, [])

  return (
    <div className={className} style={{ overflow: 'hidden', ...style }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
