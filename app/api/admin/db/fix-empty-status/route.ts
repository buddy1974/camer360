import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { revalidateTag } from 'next/cache'

export async function POST() {
  const jar = await cookies()
  const token = jar.get('admin_token')?.value
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fix articles with empty-string status (invalid enum value from seed script)
  // Set them to 'published' with published_at = NOW() so they appear on frontend
  const result = await db.execute(sql`
    UPDATE articles
    SET status = 'published',
        published_at = COALESCE(published_at, NOW())
    WHERE status = '' OR status IS NULL
  `)

  // Bust all article caches immediately
  revalidateTag('articles', {})

  const affected = (result as unknown as { affectedRows: number }).affectedRows ?? 0
  return NextResponse.json({
    ok: true,
    fixed: affected,
    message: `${affected} articles updated to published status. Cache cleared.`,
  })
}
