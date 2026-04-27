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
    /* overflow-hidden clips the decorative orbs — must be on the section */
    <section id="newsletter" className="relative bg-onyx-deep text-ivory overflow-hidden">

      {/* Decorative orbs — positioned INSIDE section bounds so overflow-hidden clips them */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-[480px] w-[480px] rounded-full opacity-15 blur-[100px]"
        style={{ background: 'var(--gradient-gold)', transform: 'translate(40%, -50%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 bottom-0 h-[380px] w-[380px] rounded-full opacity-10 blur-[100px]"
        style={{ background: 'var(--gradient-gold)', transform: 'translate(-40%, 40%)' }}
      />

      <div className="page-container relative py-20 lg:py-28">
        <div
          className="grid gap-12 items-center"
          style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}
        >
          {/* Left: copy */}
          <div style={{ maxWidth: '100%' }}>
            <div className="eyebrow text-gold mb-4 flex items-center gap-3">
              <span className="gold-rule" />
              The Camer360 Brief
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] text-ivory">
              Africa&rsquo;s culture,{' '}
              <span className="gradient-gold-text italic">unfiltered</span>{' '}
              &mdash; every Friday.
            </h2>
            <p className="mt-6 text-lg text-ivory/70" style={{ maxWidth: '36rem' }}>
              Join 84,000+ readers who get our editors&rsquo; weekly cut: the stories that shape
              entertainment, business, and identity across Central &amp; West Africa.
            </p>
            <ul className="mt-8 grid sm:grid-cols-2 gap-4" style={{ maxWidth: '36rem' }}>
              {[
                '5 must-read stories, hand-picked',
                'Exclusive interviews & first-looks',
                'Event invites & ticket drops',
                'No spam. Unsubscribe in one click.',
              ].map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-ivory/80">
                  <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gold">
                    <Check className="h-2.5 w-2.5 text-onyx" strokeWidth={4} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: form */}
          <div className="relative" style={{ maxWidth: '480px', width: '100%' }}>
            <div
              className="absolute -inset-4 opacity-25 blur-2xl rounded-3xl"
              style={{ background: 'var(--gradient-gold)' }}
            />
            <form
              onSubmit={handleSubmit}
              className="relative bg-onyx border border-gold/30 p-8 md:p-10 shadow-deep"
            >
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-4 w-4 text-gold" />
                <span className="eyebrow text-gold">Free · Premium Edition</span>
              </div>

              {!done ? (
                <>
                  <label htmlFor="nl-email" className="block font-display text-2xl font-semibold mb-4 text-ivory">
                    Get the next issue first.
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ivory/40" />
                    <input
                      id="nl-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-onyx-deep border border-white/20 pl-11 pr-4 py-4 text-sm text-ivory placeholder:text-ivory/40 outline-none focus:border-gold transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="mt-3 w-full py-4 font-semibold text-[12px] uppercase tracking-[0.22em] text-onyx hover:shadow-glow transition-shadow duration-500"
                    style={{ background: 'var(--gradient-gold)' }}
                  >
                    Subscribe — It&rsquo;s Free
                  </button>
                  <p className="mt-4 text-[11px] text-ivory/40 leading-relaxed">
                    By subscribing you agree to our terms. We respect your inbox.
                  </p>
                </>
              ) : (
                <div className="text-center py-8 animate-fade-in">
                  <div
                    className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                    style={{ background: 'var(--gradient-gold)' }}
                  >
                    <Check className="h-7 w-7 text-onyx" strokeWidth={3} />
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-ivory">Welcome to the inside.</h3>
                  <p className="mt-2 text-ivory/60">Check your inbox to confirm. Friday, we ride.</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
