import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const jar = await cookies()
  const token = jar.get('admin_token')?.value
  const payload = token ? await verifyToken(token) : null
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const envCheck = {
    DB_HOST:      !!process.env.DB_HOST,
    DB_PORT:      !!process.env.DB_PORT,
    DB_USER:      !!process.env.DB_USER,
    DB_PASSWORD:  !!process.env.DB_PASSWORD,
    DB_NAME:      !!process.env.DB_NAME,
    JWT_SECRET:   !!process.env.JWT_SECRET,
    ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
    NEON_DATABASE_URL: !!process.env.NEON_DATABASE_URL,
    AUTOMATION_API_KEY: !!process.env.AUTOMATION_API_KEY,
  }

  const missing = Object.entries(envCheck).filter(([, v]) => !v).map(([k]) => k)

  let dbStatus = 'untested'
  let dbError  = ''
  let categoryCount = 0

  try {
    const { db } = await import('@/lib/db/client')
    const { categories } = await import('@/lib/db/schema')
    const { sql } = await import('drizzle-orm')

    const [{ count }] = await db.select({ count: sql<number>`COUNT(*)` }).from(categories)
    categoryCount = Number(count)
    dbStatus = 'connected'
  } catch (e: unknown) {
    dbStatus = 'error'
    dbError  = e instanceof Error ? e.message : String(e)
  }

  return NextResponse.json({
    ok:       missing.length === 0 && dbStatus === 'connected',
    env:      envCheck,
    missing,
    db:       { status: dbStatus, error: dbError, categoryCount },
    host:     process.env.DB_HOST ?? 'NOT SET',
    database: process.env.DB_NAME ?? 'NOT SET',
  })
}
