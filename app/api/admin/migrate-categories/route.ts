import { NextResponse, NextRequest } from 'next/server'
import { db } from '@/lib/db/client'
import { categories } from '@/lib/db/schema'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { runCategoryMigration } from '@/lib/db/migrations/category-migration'
import { requireAdmin } from '@/lib/auth/require-admin'

export const dynamic = 'force-dynamic'

// GET is idempotent but writes to the DB, so it requires an admin session (Stage 0)
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  return runMigrationResponse()
}

export async function POST() {
  const jar   = await cookies()
  const token = jar.get('admin_token')?.value
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return runMigrationResponse()
}

async function runMigrationResponse() {
  try {
    const result = await runCategoryMigration()
    const final  = await db.select().from(categories).orderBy(categories.sortOrder)
    return NextResponse.json({ ...result, finalCategories: final.map(c => c.slug) })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), steps: [] }, { status: 500 })
  }
}
