import EbonyNavigation    from '@/components/ebony-navigation'
import { Footer }         from '@/components/layout/Footer'
import { BreakingBanner } from '@/components/article/BreakingBanner'
import { getBreakingNews } from '@/lib/db/queries'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  let breaking: Awaited<ReturnType<typeof getBreakingNews>> = []
  try { breaking = await getBreakingNews(5) } catch { /* DB unavailable at build time */ }
  return (
    <>
      <EbonyNavigation />
      <BreakingBanner articles={breaking} />
      <main className="min-h-screen w-full bg-background">
        {children}
      </main>
      <Footer />
    </>
  )
}
