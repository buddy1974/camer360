/**
 * Audit trail (contract §10). Field names only — never bodies, signatures or
 * secrets. An audit failure is logged but never changes the API response.
 */
import type { AuditEntry, NewsroomStore } from './store'

export type AuditResult = AuditEntry['result']

/** Denials are authorization outcomes; everything else that failed is an error. */
export function auditResultFor(errorCode: string | null): AuditResult {
  if (!errorCode) return 'ok'
  return ['ACTOR_UNKNOWN', 'FORBIDDEN', 'WRITES_DISABLED'].includes(errorCode) ? 'denied' : 'error'
}

export async function writeAudit(store: NewsroomStore, entry: AuditEntry): Promise<void> {
  try {
    await store.appendAudit({
      ...entry,
      changedFields: entry.changedFields && entry.changedFields.length ? [...new Set(entry.changedFields)] : null,
    })
  } catch (err) {
    console.error('[newsroom] audit write failed:', (err as { code?: string })?.code ?? 'error')
  }
}
