'use client'
import Link from 'next/link'
import { ArrowUpRight, Clock, Eye } from 'lucide-react'
import type { ArticleWithRelations } from '@/lib/types'
import { formatRelative, readingTime, formatHitCount, truncate } from '@/lib/utils'
import { CountryTag } from '@/components/article/CountryTag'

interface Props {
  article: ArticleWithRelations
  variant?: 'default' | 'hero' | 'featured' | 'compact' | 'horizontal' | 'list' | 'editorial'
  priority?: boolean
  index?: number
}

function cleanSrc(url: string | null | undefined): string {
  if (!url) return ''
  return url.split('#')[0].trim()
}

function heatLabel(hits: number): { emoji: string; label: string } | null {
  if (hits >= 5000) return { emoji: '🔥', label: 'Trending' }
  if (hits >= 1000) return { emoji: '💅', label: 'Poppin'   }
  if (hits >= 250)  return { emoji: '👀', label: 'Rising'   }
  return null
}

export function ArticleCard({ article, variant = 'default', priority = false, index }: Props) {
  const href = `/${article.category.slug}/${article.slug}`
  const mins = readingTime(article.body)
  const src  = cleanSrc(article.featuredImage)

  /* ── EDITORIAL (premium card with overlay content) ── */
  if (variant === 'editorial') {
    return (
      <Link
        href={href}
        className="card-editorial group block"
        style={{ animationDelay: index ? `${index * 60}ms` : undefined }}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-onyx">
          {src ? (
            <img src={src} alt={article.title} loading="lazy"
              className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-onyx flex items-center justify-center">
              <span style={{ color: 'rgba(212,175,55,0.15)', fontSize: '3rem', fontWeight: 900 }}>
                {article.category.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-card-overlay" />
          {/* Category chip */}
          <div className="absolute left-4 top-4 inline-flex items-center bg-ivory/95 backdrop-blur-sm px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-onyx">
            {article.category.name}
          </div>
          {/* Read time */}
          <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-onyx/70 backdrop-blur-sm px-3 py-1.5 text-[10px] font-medium text-ivory">
            <Clock className="h-3 w-3" /> {mins} min
          </div>
          {/* Bottom content */}
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 text-ivory">
            <h3 className="font-display text-xl md:text-2xl leading-tight font-semibold line-clamp-3">
              {article.title}
            </h3>
            {article.excerpt && (
              <p className="mt-2 text-sm text-ivory/70 line-clamp-2">{article.excerpt}</p>
            )}
            <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-ivory/60">
              <span>{article.author?.name || 'News Team'}</span>
              <span className="inline-flex items-center gap-1.5 text-gold opacity-0 -translate-x-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0">
                Read <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  /* ── HERO ── */
  if (variant === 'hero') {
    const heroHeat = heatLabel(article.hits)
    return (
      <Link href={href} style={{ display: 'block', textDecoration: 'none' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '21 / 9',
            minHeight: '320px',
            borderRadius: '16px',
            overflow: 'hidden',
            background: '#111'
          }}
        >
          {/* IMAGE LAYER */}
          <img
            src={src || ''}
            alt={article.title}
            loading={priority ? 'eager' : 'lazy'}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: src ? 'block' : 'none'
            }}
            onError={e => { e.currentTarget.style.display = 'none' }}
          />

          {/* FALLBACK BACKGROUND — visible when no image */}
          {!src && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, #1a1a1a, #0d0d0d)'
            }} />
          )}

          {/* GRADIENT OVERLAY */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.88), rgba(0,0,0,0.35), transparent)'
            }}
          />

          {/* CONTENT LAYER */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '32px 40px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            {/* BADGES */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {article.isBreaking && (
                <span style={{
                  background: '#F5A623',
                  color: '#000',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}>
                  ⚡ Breaking
                </span>
              )}
              {heroHeat && (
                <span style={{
                  background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(212,175,55,0.4)',
                  color: '#D4AF37', padding: '4px 10px', borderRadius: '4px',
                  fontSize: '11px', fontWeight: 900,
                }}>
                  {heroHeat.emoji} {heroHeat.label}
                </span>
              )}
              <span style={{
                background: '#D4AF37',
                color: '#1A1A1A',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 8px',
                borderRadius: '4px'
              }}>
                {article.category.name.toUpperCase()}
              </span>
              <CountryTag country={article.country} />
            </div>

            {/* TITLE */}
            <h2 style={{
              fontSize: 'clamp(1.4rem, 3vw, 2.5rem)',
              fontWeight: 900,
              lineHeight: 1.15,
              color: '#fff',
              margin: 0,
              maxWidth: '860px',
              letterSpacing: '-0.02em'
            }}>
              {article.title}
            </h2>

            {/* EXCERPT */}
            {article.excerpt && (
              <p style={{
                fontSize: '14px',
                color: '#bbb',
                margin: 0,
                maxWidth: '640px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {truncate(article.excerpt, 160)}
              </p>
            )}

            {/* META */}
            <div style={{
              fontSize: '12px',
              color: '#888',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '2px'
            }}>
              <span>{formatRelative(article.publishedAt!)}</span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={11} />{mins}m read
              </span>
              {article.hits > 100 && (
                <>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F5A623' }}>
                    <Eye size={11} />{formatHitCount(article.hits)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  /* ── FEATURED ── */
  if (variant === 'featured') {
    return (
      <Link href={href} className="relative block rounded-xl overflow-hidden group card img-zoom h-full" style={{ background: '#101010' }}>
        {src && <img src={src} alt={article.title} width={640} height={360} className="absolute inset-0 w-full h-full object-cover" loading="lazy" onError={e => { e.currentTarget.style.display = 'none' }} />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span className="cat-pill mb-2 block w-fit">{article.category.name}</span>
          <h3 className="text-white font-black text-[0.95rem] leading-snug group-hover:text-[#F5A623] transition-colors line-clamp-3">
            {article.title}
          </h3>
          <div className="flex items-center gap-3 mt-2 text-[0.62rem] text-[#999]">
            <span>{formatRelative(article.publishedAt!)}</span>
            {article.hits > 100 && <span className="text-[#F5A623]">{formatHitCount(article.hits)}</span>}
          </div>
        </div>
      </Link>
    )
  }

  /* ── COMPACT ── */
  if (variant === 'compact') {
    return (
      <Link href={href} className="flex items-start gap-3 group py-2">
        {src && (
          <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-[#181818] img-zoom">
            <img src={src} alt={article.title} width={640} height={360} className="w-full h-full object-cover" loading="lazy" onError={e => { e.currentTarget.parentElement!.style.display = 'none' }} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-[0.77rem] font-semibold text-[#DDD] group-hover:text-[#F5A623] transition-colors leading-snug line-clamp-2">
            {article.title}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-[0.62rem] text-[#888]">
            <span>{formatRelative(article.publishedAt!)}</span>
            {article.hits > 100 && <span className="text-[#F5A623]">{formatHitCount(article.hits)}</span>}
          </div>
        </div>
      </Link>
    )
  }

  /* ── HORIZONTAL ── */
  if (variant === 'horizontal') {
    return (
      <Link href={href} className="flex gap-3 group card py-3 border-b border-[#1E1E1E] last:border-0">
        {src && (
          <div className="w-24 h-[66px] flex-shrink-0 rounded-lg overflow-hidden bg-[#181818] img-zoom">
            <img src={src} alt={article.title} width={640} height={360} className="w-full h-full object-cover" loading="lazy" onError={e => { e.currentTarget.parentElement!.style.display = 'none' }} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className="cat-pill mb-1">{article.category.name}</span>
          <h3 className="text-[0.82rem] font-bold text-[#EEE] group-hover:text-[#F5A623] transition-colors leading-snug line-clamp-2 mt-1">
            {article.title}
          </h3>
          <span className="text-[0.62rem] text-[#888] mt-1 block">{formatRelative(article.publishedAt!)}</span>
        </div>
      </Link>
    )
  }

  /* ── LIST (numbered) ── */
  if (variant === 'list') {
    return (
      <Link href={href} className="flex items-start gap-3 group py-3 border-b border-[#1A1A1A] last:border-0">
        <span className="text-[2.2rem] font-black leading-none flex-shrink-0 mt-0.5 select-none" style={{ color: '#1E1E1E', minWidth: '2rem' }}>
          {(index ?? 0) + 1}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="text-[0.8rem] font-semibold text-[#DDD] group-hover:text-[#F5A623] transition-colors leading-snug line-clamp-2">
            {article.title}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-[0.62rem]">
            <span className="text-[#888]">{formatRelative(article.publishedAt!)}</span>
            {article.hits > 100 && <span className="text-[#F5A623] font-semibold flex items-center gap-0.5"><Eye size={9} />{formatHitCount(article.hits)}</span>}
          </div>
        </div>
        {src && (
          <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-[#181818] img-zoom">
            <img src={src} alt={article.title} width={640} height={360} className="w-full h-full object-cover" loading="lazy" onError={e => { e.currentTarget.parentElement!.style.display = 'none' }} />
          </div>
        )}
      </Link>
    )
  }

  /* ── DEFAULT CARD ── */
  const heat = heatLabel(article.hits)
  return (
    <Link href={href} className="group" style={{ display: 'block', textDecoration: 'none', height: '100%' }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#111',
        border: '1px solid #1E1E1E'
      }}>

        {/* IMAGE */}
        <div style={{
          position: 'relative',
          aspectRatio: '16/9',
          background: '#181818',
          flexShrink: 0,
          overflow: 'hidden'
        }}>
          {/* Fallback always present — img overlays it; reveals on error */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, #120608 0%, #0A0A14 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ color: 'rgba(212,175,55,0.12)', fontSize: '3.5rem', fontWeight: 900, lineHeight: 1, userSelect: 'none' }}>
              {article.category.name.charAt(0)}
            </span>
          </div>
          {src && (
            <img
              src={src}
              alt={article.title}
              width={640}
              height={360}
              loading="lazy"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.currentTarget.style.display = 'none' }}
            />
          )}
          <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
            <span className="cat-pill">{article.category.name}</span>
          </div>
          <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '4px', alignItems: 'center' }}>
            {heat && (
              <span style={{
                background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
                border: '1px solid rgba(212,175,55,0.3)',
                color: '#D4AF37', padding: '3px 7px', borderRadius: '4px',
                fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.06em',
              }}>
                {heat.emoji} {heat.label}
              </span>
            )}
            {article.isBreaking && (
              <span className="cat-pill" style={{ background: '#F5A623', color: '#000' }}>⚡</span>
            )}
            <CountryTag country={article.country} />
          </div>
        </div>

        {/* CONTENT */}
        <div style={{
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          flex: 1
        }}>
          <h3
            className="group-hover:text-[#F5A623] transition-colors"
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: '#EEE',
              lineHeight: 1.35,
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              flex: 1
            }}
          >
            {article.title}
          </h3>
          <div style={{
            fontSize: '11px',
            color: '#888',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '4px',
            paddingTop: '8px',
            borderTop: '1px solid #1A1A1A'
          }}>
            <span>{formatRelative(article.publishedAt!)}</span>
            <span>·</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Clock size={9} />{mins}m
            </span>
            {article.hits > 100 && (
              <>
                <span>·</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#F5A623', fontWeight: 600 }}>
                  <Eye size={9} />{formatHitCount(article.hits)}
                </span>
              </>
            )}
          </div>
        </div>

      </div>
    </Link>
  )
}
