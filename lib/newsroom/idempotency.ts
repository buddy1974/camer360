/**
 * Idempotency (contract §8). The key is reserved before the write runs so two
 * concurrent deliveries of the same request cannot both write. Only successful
 * (2xx) responses are stored and replayed; a failed attempt releases the key so
 * the client may retry it.
 */
import { NewsroomError } from './http'
import type { NewsroomStore } from './store'
import { sha256Hex } from './verify'

export const IDEMPOTENCY_RETENTION_DAYS = 8 // contract: ≥ 7 days
/** An in-flight reservation older than this is considered abandoned (crashed request). */
export const IN_FLIGHT_STALE_SECONDS = 120

export function requestHash(method: string, path: string, rawBody: string): string {
  return sha256Hex(method.toUpperCase() + path + rawBody)
}

export type IdempotencyStart =
  | { kind: 'proceed' }
  | { kind: 'replay'; status: number; bodyJson: string }

export async function beginIdempotent(
  store: NewsroomStore,
  args: { key: string; actor: string; method: string; path: string; rawBody: string; now: Date },
): Promise<IdempotencyStart> {
  const hash = requestHash(args.method, args.path, args.rawBody)
  const rec = { key: args.key, actor: args.actor, method: args.method.toUpperCase(), path: args.path, requestHash: hash, createdAt: args.now }

  let existing = await store.reserveIdempotency(rec)
  if (!existing) return { kind: 'proceed' }

  if (existing.requestHash !== hash) {
    throw new NewsroomError('IDEMPOTENCY_MISMATCH', 'Idempotency key was already used for a different request')
  }
  if (existing.statusCode === 0) {
    const ageS = (args.now.getTime() - new Date(existing.createdAt).getTime()) / 1000
    if (ageS < IN_FLIGHT_STALE_SECONDS) {
      throw new NewsroomError('IDEMPOTENCY_MISMATCH', 'A request with this idempotency key is still in progress')
    }
    await store.releaseIdempotency(args.key, args.actor)
    existing = await store.reserveIdempotency(rec)
    if (!existing) return { kind: 'proceed' }
    throw new NewsroomError('IDEMPOTENCY_MISMATCH', 'A request with this idempotency key is still in progress')
  }
  return { kind: 'replay', status: existing.statusCode, bodyJson: existing.responseJson ?? 'null' }
}

export async function finishIdempotent(
  store: NewsroomStore, key: string, actor: string, status: number, bodyJson: string,
): Promise<void> {
  if (status >= 200 && status < 300) await store.completeIdempotency(key, actor, status, bodyJson)
  else await store.releaseIdempotency(key, actor)
}
