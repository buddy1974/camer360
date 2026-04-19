import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { categories } from '@/lib/db/schema'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { runCategoryMigration } from '@/lib/db/migrations/category-migration'

export const dynamic = 'force-dynamic'

// Public GET — idempotent, safe to run multiple times
export async function GET() {
  return runMigrationResponse()
}

export async function POST() {
  const jar   = await cookies()
  const token = jar.get('admin_token')?.value
  if (!token || !verifyToken(token)) {
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
