import { randomUUID } from 'node:crypto'
import { getNewsroomConfig } from '@/lib/newsroom/config'
import { jsonResponse, successBody } from '@/lib/newsroom/http'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** Unsigned liveness/config probe. Reports flags only — never secrets. */
export async function GET() {
  const cfg = getNewsroomConfig()
  const requestId = randomUUID()
  return jsonResponse(successBody({
    status: 'ok',
    enabled: cfg.enabled,
    writesEnabled: cfg.writesEnabled,
    configured: cfg.secret !== null,
    publication: cfg.publication,
  }, requestId), 200, { 'x-newsroom-request-id': requestId })
}
