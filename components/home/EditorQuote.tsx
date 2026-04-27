export function EditorQuote() {
  return (
    <section className="bg-secondary/60 border-y border-border">
      <div className="page-container py-20 lg:py-28 text-center">
        <div className="eyebrow text-gold mb-6 flex items-center justify-center gap-3">
          <span className="gold-rule" /> Editor&#39;s Note <span className="gold-rule" />
        </div>
        <blockquote className="font-display text-3xl md:text-5xl lg:text-6xl font-medium leading-[1.1] max-w-5xl mx-auto">
          <span className="text-gold">&ldquo;</span>
          The story of African culture in 2026 isn&#39;t being told in distant capitals — it&#39;s being written in our streets, our studios, our boardrooms. We&#39;re just here to catch the light.
          <span className="text-gold">&rdquo;</span>
        </blockquote>
        <div className="mt-8 inline-flex items-center gap-3 text-[12px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-px w-10 bg-foreground/30 inline-block" />
          Naima Foncha · Editor-in-Chief
          <span className="h-px w-10 bg-foreground/30 inline-block" />
        </div>
      </div>
    </section>
  )
}
