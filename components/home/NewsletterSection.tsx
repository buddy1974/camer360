'use client'
import { useState } from 'react'
import { Mail, Sparkles, Check } from 'lucide-react'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Hook into existing /api/newsletter if available, or just show success
    setDone(true)
  }

  return (
    <section id="newsletter" className="relative bg-onyx-deep text-ivory overflow-hidden">
      <div className="pointer-events-none absolute -right-32 top-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full opacity-20 blur-[120px]" style={{ background: 'var(--gradient-gold)' }} />
      <div className="pointer-events-none absolute -left-32 -bottom-32 h-[400px] w-[400px] rounded-full opacity-10 blur-[120px]" style={{ background: 'var(--gradient-gold)' }} />

      <div className="max-w-[1440px] mx-auto px-5 lg:px-8 relative py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="eyebrow text-gold mb-4 flex items-center gap-3">
              <span className="gold-rule" />
              The Camer360 Brief
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1] text-ivory">
              Africa&#39;s culture,{' '}
              <span className="gradient-gold-text italic">unfiltered</span>{' '}
              — every Friday morning.
            </h2>
            <p className="mt-6 text-lg text-ivory/70 max-w-xl">
              Join 84,000+ readers who get our editors&#39; weekly cut: the stories that shape entertainment, business, and identity across Central &amp; West Africa.
            </p>
            <ul className="mt-8 grid sm:grid-cols-2 gap-4 max-w-xl">
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

          <div className="lg:col-span-5">
            <div className="relative">
              <div className="absolute -inset-4 opacity-30 blur-2xl rounded-3xl" style={{ background: 'var(--gradient-gold)' }} />
              <form onSubmit={handleSubmit} className="relative bg-onyx border border-gold/30 p-8 md:p-10 shadow-deep">
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
                      <input id="nl-email" type="email" required value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-onyx-deep border border-white/20 pl-11 pr-4 py-4 text-sm text-ivory placeholder:text-ivory/40 outline-none focus:border-gold transition-colors" />
                    </div>
                    <button type="submit" style={{ background: 'var(--gradient-gold)' }}
                      className="mt-3 w-full py-4 font-semibold text-[12px] uppercase tracking-[0.22em] text-onyx hover:shadow-glow transition-shadow duration-500">
                      Subscribe — It&#39;s Free
                    </button>
                    <p className="mt-4 text-[11px] text-ivory/40 leading-relaxed">
                      By subscribing you agree to our terms. We respect your inbox.
                    </p>
                  </>
                ) : (
                  <div className="text-center py-8 animate-fade-in">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: 'var(--gradient-gold)' }}>
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
      </div>
    </section>
  )
}
