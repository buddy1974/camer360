#!/usr/bin/env node
// newsroom-migrate.mjs — create the Newsroom API v1 tables (idempotent).
//
//   npm run newsroom:migrate -- --dry-run   # print the SQL, no DB connection
//   npm run newsroom:migrate                # apply to the DB in .env.local
//
// Only CREATE TABLE IF NOT EXISTS statements are executed; existing tables
// (including `articles`) are never altered. Prints table names/status only —
// never credentials.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SQL_FILE = join(ROOT, 'lib', 'db', 'migrations', 'newsroom', '0001_newsroom.sql')
const dryRun = process.argv.includes('--dry-run')

const sqlText = readFileSync(SQL_FILE, 'utf8')
const statements = sqlText
  .split('\n')
  .filter(line => !line.trim().startsWith('--'))
  .join('\n')
  .split(/;\s*(?:\n|$)/)
  .map(s => s.trim())
  .filter(Boolean)

const tableOf = (stmt) => stmt.match(/CREATE TABLE IF NOT EXISTS\s+`?(\w+)`?/i)?.[1]

if (dryRun) {
  console.log(`-- dry run: ${statements.length} statement(s) from ${SQL_FILE}\n`)
  console.log(sqlText)
  process.exit(0)
}

for (const stmt of statements) {
  if (!/^CREATE TABLE IF NOT EXISTS/i.test(stmt)) {
    console.error('Refusing to run a non-CREATE TABLE IF NOT EXISTS statement. Aborting.')
    process.exit(1)
  }
}

const { config } = await import('dotenv')
config({ path: join(ROOT, '.env.local') })
for (const name of ['DB_HOST', 'DB_USER', 'DB_NAME']) {
  if (!process.env[name]) {
    console.error(`${name} is not set in .env.local`)
    process.exit(1)
  }
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
  for (const stmt of statements) {
    const table = tableOf(stmt)
    const [rows] = await conn.query('SHOW TABLES LIKE ?', [table])
    const existed = Array.isArray(rows) && rows.length > 0
    await conn.query(stmt)
    console.log(`${table.padEnd(28)} ${existed ? 'already present (unchanged)' : 'created'}`)
  }
  console.log('\nNewsroom migration complete.')
} catch (err) {
  console.error('Migration failed:', err && err.code ? err.code : 'error', err && err.sqlMessage ? err.sqlMessage : '')
  process.exitCode = 1
} finally {
  await conn.end()
}
