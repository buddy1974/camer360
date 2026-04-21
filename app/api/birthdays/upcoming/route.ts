import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { birthdays } from '@/lib/db/schema'

function daysUntil(month: number, day: number): number {
  const now   = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let next    = new Date(today.getFullYear(), month - 1, day)
  if (next < today) next = new Date(today.getFullYear() + 1, month - 1, day)
  return Math.round((next.getTime() - today.getTime()) / 86400000)
}

export async function GET() {
  try {
    const rows = await db.select().from(birthdays).limit(200)
    const withDays = rows
      .map(r => ({ ...r, daysUntil: daysUntil(r.birthMonth, r.birthDay) }))
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 4)
    return NextResponse.json(withDays)
  } catch {
    return NextResponse.json([])
  }
}
