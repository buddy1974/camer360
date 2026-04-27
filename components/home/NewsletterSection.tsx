'use client'
import { useState } from 'react'
import { Mail, Sparkles, Check } from 'lucide-react'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [done, setDone]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setDone(true)
  }

  return (
    <section id="newsletter" className="relative bg-onyx-deep text-ivory overflow-hidden">
      {/* Decorative orbs — clipped by overflow-hidden */}
      <div aria-hidden className="pointer-events-none absolute right-0 top-1/2 h-[480px] w-[480px] rounded-full opacity-15 blur-[100px]"
        style={{ background: 'var(--gradient-gold)', transform: 'translate(40%, -50%)' }} />
      <div aria-hidden className="pointer-events-none absolute left-0 bottom-0 h-[380px] w-[380px] rounded-full opacity-10 blur-[100px]"
        style={{ background: 'var(--gradient-gold)', transform: 'translate(-40%, 40%)' }} />

      <div className="page-container relative py-20 lg:py-28">
        {/* ── 2-column grid: LEFT text (1.2fr) + RIGHT subscribe card (0.8fr) ── */}
        <div className="camer-brief">

          {/* ── LEFT: copy ── */}
          <div className="camer-brief-left">
            <div className="eyebrow text-gold flex items-center gap-3">
              <span className="gold-rule" />
              The Camer360 Brief
            </div>

            <h2 className="font-display font-semibold leading-[1.05] text-ivory"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
              Africa&rsquo;s culture,{' '}
              <span style={{ color: 'hsl(var(--gold))', fontStyle: 'italic' }}>unfiltered</span>
              {' '}&mdash; every Friday morning.
            </h2>

            <p className="text-lg text-ivory/70" style={{ maxWidth: '34rem' }}>
              Join 84,000+ readers who get our editors&rsquo; weekly cut: the stories that shape
              entertainment, business, and identity across Central &amp; West Africa.
            </p>

            {/* 2-column bullet list */}
            <ul className="features">
              {[
                '5 must-read stories, hand-picked',
                'Exclusive interviews & first-looks',
                'Event invites & ticket drops',
                'No spam. Unsubscribe in one click.',
              ].map((b) => (
                <li key={b} className="feature-item">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold">
                    <Check className="h-2.5 w-2.5 text-onyx" strokeWidth={4} />
                  </span>
                  <span className="text-sm text-ivory/80">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── RIGHT: subscribe card ── */}
          <div className="camer-brief-right">
            <div className="subscribe-card">
              {/* Gold glow behind card */}
              <div className="absolute -inset-3 opacity-20 blur-2xl rounded-2xl pointer-events-none"
                style={{ background: 'var(--gradient-gold)' }} />

              <form onSubmit={handleSubmit} className="relative flex flex-col" style={{ gap: '14px' }}>
                {/* Label */}
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-gold shrink-0" />
                  <span className="eyebrow text-gold" style={{ fontSize: '10px' }}>Free · Premium Edition</span>
                </div>

                {!done ? (
                  <>
                    {/* Title */}
                    <label htmlFor="nl-email" className="block font-display text-2xl font-semibold text-ivory" style={{ lineHeight: 1.2 }}>
                      Get the next issue first.
                    </label>

                    {/* Input */}
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ivory/40" />
                      <input
                        id="nl-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-onyx-deep border border-white/20 pl-11 pr-4 py-3.5 text-sm text-ivory placeholder:text-ivory/40 outline-none focus:border-gold transition-colors"
                      />
                    </div>

                    {/* CTA button */}
                    <button
                      type="submit"
                      className="subscribe-button w-full"
                    >
                      Subscribe — It&rsquo;s Free
                    </button>

                    {/* Disclaimer */}
                    <p className="text-[11px] text-ivory/35 leading-relaxed">
                      By subscribing you agree to our terms. We respect your inbox.
                    </p>
                  </>
                ) : (
                  <div className="text-center py-6 animate-fade-in">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full"
                      style={{ background: 'var(--gradient-gold)' }}>
                      <Check className="h-7 w-7 text-onyx" strokeWidth={3} />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-ivory">Welcome to the inside.</h3>
                    <p className="mt-2 text-sm text-ivory/60">Check your inbox to confirm. Friday, we ride.</p>
                  </div>
                )}
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
