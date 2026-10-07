#!/usr/bin/env node
// newsroom-grant.mjs — grant, change or revoke a TM (Telegram) newsroom role.
//
//   npm run newsroom:grant -- <telegramId> <viewer|contributor|editor|publisher> [displayName]
//   npm run newsroom:grant -- <telegramId> revoke
//
// Revoke sets active = false (the row is kept for audit history).
// Uses the DB in .env.local. Prints only the grant itself — never credentials.
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ROLES = ['viewer', 'contributor', 'editor', 'publisher']
const [telegramId, action, ...nameParts] = process.argv.slice(2)
const displayName = nameParts.join(' ').trim() || null

function usage(msg) {
  if (msg) console.error(msg)
  console.error('Usage: npm run newsroom:grant -- <telegramId> <viewer|contributor|editor|publisher|revoke> [displayName]')
  process.exit(1)
}

if (!telegramId || !/^\d{1,20}$/.test(telegramId)) usage('telegramId must be a numeric Telegram user id.')
if (!action || (action !== 'revoke' && !ROLES.includes(action))) usage('Unknown role/action.')
if (displayName && displayName.length > 120) usage('displayName must be at most 120 characters.')

const { config } = await import('dotenv')
config({ path: join(ROOT, '.env.local') })
for (const name of ['DB_HOST', 'DB_USER', 'DB_NAME']) {
  if (!process.env[name]) usage(`${name} is not set in .env.local`)
}

const mysql = (await import('mysql2/promise')).default
const conn = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
  connectTimeout: 15000,
})

try {
  if (action === 'revoke') {
    const [res] = await conn.query(
      'UPDATE newsroom_grants SET active = FALSE, updated_at = NOW() WHERE telegram_user_id = ?',
      [telegramId],
    )
    console.log(res.affectedRows ? `Revoked newsroom access for telegram:${telegramId}.` : `No grant found for telegram:${telegramId}.`)
  } else {
    await conn.query(
      `INSERT INTO newsroom_grants (telegram_user_id, role, active, display_name, created_at, updated_at)
       VALUES (?, ?, TRUE, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE role = VALUES(role), active = TRUE,
         display_name = COALESCE(VALUES(display_name), display_name), updated_at = NOW()`,
      [telegramId, action, displayName],
    )
    console.log(`Granted ${action} to telegram:${telegramId}${displayName ? ` (${displayName})` : ''}.`)
  }
} catch (err) {
  console.error('Grant failed:', err && err.code ? err.code : 'error', err && err.sqlMessage ? err.sqlMessage : '')
  process.exitCode = 1
} finally {
  await conn.end()
}
