import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import './helpers'
import {
  canonicalString, computeSignature, sha256Hex, verifySignedRequest, pathWithQueryOf,
  parseSignedHeaders, HEADERS,
} from '@/lib/newsroom/verify'
import { NewsroomError } from '@/lib/newsroom/http'
import { MemoryStore } from '@/lib/newsroom/store-memory'

// Contract §2 test vector.
const VECTOR = {
  secret: 'test-vector-secret-do-not-use',
  method: 'POST',
  pathWithQuery: '/api/newsroom/v1/articles',
  body: '{"title":"Test vector","body":"<p>Hello</p>","categoryId":9}',
  timestamp: 1791331200,
  nonce: '00112233445566778899aabbccddeeff',
  actor: 'telegram:123456789',
  requestId: '11111111-2222-4333-8444-555555555555',
  idempotencyKey: 'tm:op:test-vector:cc',
}

function vectorHeaders(overrides: Partial<Record<string, string>> = {}): Headers {
  const h = new Headers()
  h.set(HEADERS.timestamp, String(VECTOR.timestamp))
  h.set(HEADERS.nonce, VECTOR.nonce)
  h.set(HEADERS.requestId, VECTOR.requestId)
  h.set(HEADERS.actor, VECTOR.actor)
  h.set(HEADERS.idempotencyKey, VECTOR.idempotencyKey)
  h.set(HEADERS.signature, computeSignature(VECTOR.secret, VECTOR))
  for (const [k, v] of Object.entries(overrides)) {
    if (v === undefined) continue
    if (v === '') h.delete(k)
    else h.set(k, v)
  }
  return h
}

const vectorReq = (headers = vectorHeaders(), url = `https://www.camer360.test${VECTOR.pathWithQuery}`) =>
  ({ method: 'POST', url, headers })
const vectorNow = new Date(VECTOR.timestamp * 1000)

async function expectCode(p: Promise<unknown>, code: string) {
  await assert.rejects(p, (e: unknown) => e instanceof NewsroomError && e.code === code)
}

describe('contract §2 signing', () => {
  test('test vector: body sha256', () => {
    assert.equal(sha256Hex(VECTOR.body), 'c8a20806f9bebbbe13ef5a3402e47483aadf414b374c2cc988d01ab7a431b5a9')
  })

  test('test vector: signature', () => {
    assert.equal(computeSignature(VECTOR.secret, VECTOR),
      'v1=8c6cd47ad941b58788e4d6f843c2e5873f2776101b6c7f36c789cf011704d227')
  })

  test('canonical string layout: 9 LF-joined lines, no trailing newline', () => {
    const c = canonicalString(VECTOR)
    assert.equal(c.split('\n').length, 9)
    assert.ok(!c.endsWith('\n'))
    assert.equal(canonicalString({ ...VECTOR, idempotencyKey: null }).split('\n')[8], '')
  })

  const reference = join(process.cwd(), '..', 'newsroom-control-plane', 'lib', 'signing.ts')
  test('matches the TM reference signer when it is checked out alongside', { skip: !existsSync(reference) }, async () => {
    const ref = await import(pathToFileURL(reference).href) as { computeSignature: typeof computeSignature; signedHeaders: (s: string, r: object) => Record<string, string> }
    assert.equal(ref.computeSignature(VECTOR.secret, VECTOR), computeSignature(VECTOR.secret, VECTOR))
    const headers = ref.signedHeaders(VECTOR.secret, { method: 'GET', pathWithQuery: '/api/newsroom/v1/articles?q=biya&limit=5', body: '', actor: 'telegram:42' })
    const req = { method: 'GET', url: 'https://www.camer360.test/api/newsroom/v1/articles?q=biya&limit=5', headers: new Headers(headers) }
    const v = await verifySignedRequest(req, '', new MemoryStore(), VECTOR.secret)
    assert.equal(v.actor, 'telegram:42')
  })
})

describe('verifySignedRequest', () => {
  test('accepts the test vector request', async () => {
    const v = await verifySignedRequest(vectorReq(), VECTOR.body, new MemoryStore(), VECTOR.secret, vectorNow)
    assert.equal(v.actor, VECTOR.actor)
    assert.equal(v.idempotencyKey, VECTOR.idempotencyKey)
  })

  test('wrong secret → SIGNATURE_INVALID', async () => {
    await expectCode(verifySignedRequest(vectorReq(), VECTOR.body, new MemoryStore(), 'other-secret', vectorNow), 'SIGNATURE_INVALID')
  })

  test('tampered body / path / actor → SIGNATURE_INVALID', async () => {
    await expectCode(verifySignedRequest(vectorReq(), VECTOR.body.replace('9', '10'), new MemoryStore(), VECTOR.secret, vectorNow), 'SIGNATURE_INVALID')
    await expectCode(verifySignedRequest(vectorReq(vectorHeaders(), 'https://x.test/api/newsroom/v1/articles?x=1'), VECTOR.body, new MemoryStore(), VECTOR.secret, vectorNow), 'SIGNATURE_INVALID')
    await expectCode(verifySignedRequest(vectorReq(vectorHeaders({ [HEADERS.actor]: 'telegram:1' })), VECTOR.body, new MemoryStore(), VECTOR.secret, vectorNow), 'SIGNATURE_INVALID')
  })

  test('timestamp outside ±300 s → TIMESTAMP_EXPIRED; edge of window accepted', async () => {
    await expectCode(verifySignedRequest(vectorReq(), VECTOR.body, new MemoryStore(), VECTOR.secret, new Date((VECTOR.timestamp + 301) * 1000)), 'TIMESTAMP_EXPIRED')
    await expectCode(verifySignedRequest(vectorReq(), VECTOR.body, new MemoryStore(), VECTOR.secret, new Date((VECTOR.timestamp - 301) * 1000)), 'TIMESTAMP_EXPIRED')
    await verifySignedRequest(vectorReq(), VECTOR.body, new MemoryStore(), VECTOR.secret, new Date((VECTOR.timestamp + 300) * 1000))
  })

  test('nonce replay → NONCE_REPLAY', async () => {
    const store = new MemoryStore()
    await verifySignedRequest(vectorReq(), VECTOR.body, store, VECTOR.secret, vectorNow)
    await expectCode(verifySignedRequest(vectorReq(), VECTOR.body, store, VECTOR.secret, vectorNow), 'NONCE_REPLAY')
  })

  test('invalid signature never consumes a nonce (no store access)', async () => {
    const store = new MemoryStore()
    await expectCode(verifySignedRequest(vectorReq(), VECTOR.body, store, 'other', vectorNow), 'SIGNATURE_INVALID')
    assert.equal(store.calls, 0)
  })

  test('malformed / missing headers → SIGNATURE_INVALID', () => {
    const cases: Array<Record<string, string>> = [
      { [HEADERS.timestamp]: '' },
      { [HEADERS.timestamp]: '12.5' },
      { [HEADERS.nonce]: 'ABCDEF00112233445566778899aabbcc' },
      { [HEADERS.nonce]: '001122' },
      { [HEADERS.requestId]: 'not-a-uuid' },
      { [HEADERS.actor]: 'telegram:abc' },
      { [HEADERS.actor]: 'admin' },
      { [HEADERS.signature]: 'v2=' + 'a'.repeat(64) },
      { [HEADERS.signature]: '' },
      { [HEADERS.idempotencyKey]: '' }, // required on POST
      { [HEADERS.idempotencyKey]: 'x'.repeat(201) },
    ]
    for (const c of cases) {
      assert.throws(() => parseSignedHeaders(vectorHeaders(c), 'POST'),
        (e: unknown) => e instanceof NewsroomError && e.code === 'SIGNATURE_INVALID', JSON.stringify(c))
    }
    // idempotency key is optional on GET
    parseSignedHeaders(vectorHeaders({ [HEADERS.idempotencyKey]: '' }), 'GET')
  })

  test('pathWithQuery is the raw path + query as received', () => {
    assert.equal(pathWithQueryOf('https://a.test/api/newsroom/v1/articles'), '/api/newsroom/v1/articles')
    assert.equal(pathWithQueryOf('https://a.test/api/newsroom/v1/articles?q=biya%20x&limit=5'), '/api/newsroom/v1/articles?q=biya%20x&limit=5')
    assert.equal(pathWithQueryOf('https://a.test/api/newsroom/v1/articles?'), '/api/newsroom/v1/articles')
    assert.equal(pathWithQueryOf('https://a.test/x?a=1#frag'), '/x?a=1')
  })
})
