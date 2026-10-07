/**
 * Response envelope and error type for the Newsroom API v1 (contract §3).
 */
export type ErrorCode =
  | 'BAD_REQUEST'
  | 'SIGNATURE_INVALID' | 'TIMESTAMP_EXPIRED' | 'NONCE_REPLAY'
  | 'ACTOR_UNKNOWN' | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VERSION_CONFLICT' | 'IDEMPOTENCY_MISMATCH' | 'INVALID_STATE'
  | 'VALIDATION'
  | 'API_DISABLED' | 'API_NOT_CONFIGURED' | 'WRITES_DISABLED'
  | 'INTERNAL'

export const STATUS_FOR: Record<ErrorCode, number> = {
  BAD_REQUEST: 400,
  SIGNATURE_INVALID: 401, TIMESTAMP_EXPIRED: 401, NONCE_REPLAY: 401,
  ACTOR_UNKNOWN: 403, FORBIDDEN: 403,
  NOT_FOUND: 404,
  VERSION_CONFLICT: 409, IDEMPOTENCY_MISMATCH: 409, INVALID_STATE: 409,
  VALIDATION: 422,
  API_DISABLED: 503, API_NOT_CONFIGURED: 503, WRITES_DISABLED: 503,
  INTERNAL: 500,
}

export class NewsroomError extends Error {
  readonly status: number
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message)
    this.name = 'NewsroomError'
    this.status = STATUS_FOR[code]
  }
}

export const validation = (message: string, fields?: Record<string, string>) =>
  new NewsroomError('VALIDATION', message, fields)

export interface ErrorBody {
  ok: false
  error: { code: ErrorCode; message: string; fields?: Record<string, string> }
  requestId: string
}

export interface SuccessBody<T = unknown> {
  ok: true
  data: T
  requestId: string
}

export function successBody<T>(data: T, requestId: string): SuccessBody<T> {
  return { ok: true, data, requestId }
}

export function errorBody(err: NewsroomError, requestId: string): ErrorBody {
  const error: ErrorBody['error'] = { code: err.code, message: err.message }
  if (err.fields && Object.keys(err.fields).length) error.fields = err.fields
  return { ok: false, error, requestId }
}

const NO_STORE = { 'cache-control': 'no-store' }

export function jsonResponse(body: unknown, status: number, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...NO_STORE, ...extraHeaders },
  })
}

export function errorResponse(err: NewsroomError, requestId: string): Response {
  return jsonResponse(errorBody(err, requestId), err.status, { 'x-newsroom-request-id': requestId })
}
