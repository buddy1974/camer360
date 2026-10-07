/**
 * Role matrix (contract §4). Publication-owned: TM-side authorization never
 * replaces these checks.
 */
import { NewsroomError } from './http'
import type { ArticleStatus, Grant, NewsroomStore } from './store'
import { SCHEDULER_ACTOR } from './verify'

export type NewsroomRole = 'viewer' | 'contributor' | 'editor' | 'publisher'
export const ROLE_RANK: Record<NewsroomRole, number> = { viewer: 1, contributor: 2, editor: 3, publisher: 4 }

export type Actor =
  | { kind: 'telegram'; id: string; telegramId: string; role: NewsroomRole; displayName: string | null; owner: boolean }
  | { kind: 'system'; id: typeof SCHEDULER_ACTOR }

export function hasRole(role: NewsroomRole, min: NewsroomRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[min]
}

/** Resolve the signed actor header to an active grant (owner bootstrap ids are publishers). */
export async function resolveActor(
  actorHeader: string,
  store: Pick<NewsroomStore, 'getGrant'>,
  ownerIds: ReadonlySet<string>,
): Promise<Actor> {
  if (actorHeader === SCHEDULER_ACTOR) return { kind: 'system', id: SCHEDULER_ACTOR }
  const m = /^telegram:(\d{1,20})$/.exec(actorHeader)
  if (!m) throw new NewsroomError('ACTOR_UNKNOWN', 'Unknown actor')
  const telegramId = m[1]
  if (ownerIds.has(telegramId)) {
    return { kind: 'telegram', id: actorHeader, telegramId, role: 'publisher', displayName: null, owner: true }
  }
  const grant: Grant | null = await store.getGrant(telegramId)
  if (!grant || !grant.active) throw new NewsroomError('ACTOR_UNKNOWN', 'No active newsroom grant for this actor')
  return { kind: 'telegram', id: actorHeader, telegramId, role: grant.role, displayName: grant.displayName, owner: false }
}

export type RouteRole = NewsroomRole | 'scheduler'

/** Endpoint-level gate. `scheduler` = system:scheduler or publisher. */
export function assertRouteRole(actor: Actor, required: RouteRole): void {
  if (actor.kind === 'system') {
    if (required === 'scheduler') return
    throw new NewsroomError('FORBIDDEN', 'system:scheduler may only run the scheduler')
  }
  const min: NewsroomRole = required === 'scheduler' ? 'publisher' : required
  if (!hasRole(actor.role, min)) throw new NewsroomError('FORBIDDEN', `Requires role ${min}`)
}

const EDITABLE_BY_OWNER: readonly ArticleStatus[] = ['draft', 'unpublished']

/** May this actor update the article? (contributor: only own draft/unpublished) */
export function canUpdateArticle(actor: Actor, status: ArticleStatus, originTelegramId: string | null): boolean {
  if (actor.kind !== 'telegram') return false
  if (hasRole(actor.role, 'editor')) return true
  if (actor.role === 'contributor') {
    return EDITABLE_BY_OWNER.includes(status) && originTelegramId !== null && originTelegramId === actor.telegramId
  }
  return false
}

/** Media upload: unattached → contributor; attached → editor, or contributor on own draft/unpublished. */
export function canUploadMedia(
  actor: Actor,
  article: { status: ArticleStatus; originTelegramId: string | null } | null,
): boolean {
  if (actor.kind !== 'telegram') return false
  if (!hasRole(actor.role, 'contributor')) return false
  if (!article) return true
  return canUpdateArticle(actor, article.status, article.originTelegramId)
}

export function canPublish(actor: Actor): boolean {
  return actor.kind === 'telegram' && hasRole(actor.role, 'publisher')
}
