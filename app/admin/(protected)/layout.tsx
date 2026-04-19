import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { AdminShell } from '@/components/admin/AdminShell'
import { runCategoryMigration } from '@/lib/db/migrations/category-migration'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  console.log('[auth] token present:', !!token)
  console.log('[auth] JWT_SECRET set:', !!process.env.JWT_SECRET)
  if (!token) redirect('/admin/login')
  const payload = await verifyToken(token)
  console.log('[auth] payload valid:', !!payload)
  if (!payload) redirect('/admin/login')

  // Auto-run idempotent category migration (no-op if already done)
  const migResult = await runCategoryMigration()
  if (!migResult.skipped) {
    console.log('[admin] category migration:', migResult.steps)
  }

  return <AdminShell>{children}</AdminShell>
}
