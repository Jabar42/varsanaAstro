import { createHmac, timingSafeEqual } from 'node:crypto';

export type BoldEnvironment = 'production' | 'test';

/** Undefined is production. No inference from ENVIRONMENT, keys, or prefixes. */
export function getBoldEnvironment(env: { BOLD_ENVIRONMENT?: unknown }): BoldEnvironment {
  const mode = env.BOLD_ENVIRONMENT;
  if (mode === undefined || mode === 'production') return 'production';
  if (mode === 'test') return 'test';
  throw new Error('Invalid BOLD_ENVIRONMENT');
}

/** Test's empty key applies ONLY to webhook HMAC, never checkout integrity. */
export function getBoldWebhookSecret(env: {
  BOLD_ENVIRONMENT?: unknown;
  BOLD_SECRET_KEY?: unknown;
}): string {
  if (getBoldEnvironment(env) === 'test') return '';
  if (typeof env.BOLD_SECRET_KEY !== 'string' || !env.BOLD_SECRET_KEY.trim()) {
    throw new Error('BOLD_SECRET_KEY is required in production');
  }
  return env.BOLD_SECRET_KEY;
}

/** Bold signs Base64(raw UTF-8 body), not parsed/re-serialized JSON. */
export function verifyBoldSignature(rawBody: string, signature: string, secret: string): boolean {
  if (!/^[a-fA-F0-9]{64}$/.test(signature)) return false;
  const expected = createHmac('sha256', secret)
    .update(Buffer.from(rawBody, 'utf8').toString('base64'))
    .digest();
  return timingSafeEqual(expected, Buffer.from(signature, 'hex'));
}

export function boldJSON(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export interface BoldSale {
  id: string;
  type: 'SALE_APPROVED' | 'SALE_REJECTED';
  data: {
    payment_id: string;
    metadata: { reference: string };
    amount: { total: number; currency: string };
  };
}

/** Validate only the fields on which payment authority depends. */
export function isBoldSale(value: Record<string, unknown>): value is Record<string, unknown> & BoldSale {
  if (!isNonEmptyString(value.id) || !isNonEmptyString(value.subject)) return false;
  if (value.type !== 'SALE_APPROVED' && value.type !== 'SALE_REJECTED') return false;
  const data = value.data;
  if (!isRecord(data) || !isNonEmptyString(data.payment_id) || value.subject !== data.payment_id) return false;
  if (!isRecord(data.metadata) || !isNonEmptyString(data.metadata.reference)) return false;
  if (!isRecord(data.amount)) return false;
  return typeof data.amount.total === 'number' && Number.isFinite(data.amount.total)
    && data.amount.total >= 0 && typeof data.amount.currency === 'string'
    && /^[A-Z]{3}$/.test(data.amount.currency);
}
