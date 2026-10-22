// Shared helpers for the NPOTG content dashboard (Netlify Functions + Netlify Blobs).
import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';

const env = (k) => (globalThis.Netlify?.env?.get?.(k) ?? process.env[k] ?? '');

export const store = (name) => {
  const local = globalThis.__NPOTG_BLOBS__; // only set by the local test harness
  return local ? getStore({ name, consistency: 'strong', ...local }) : getStore({ name, consistency: 'strong' });
};

const secret = () => (env('SESSION_SECRET') || env('ADMIN_PASSWORD')) + '::npotg-dashboard';

export function signToken(days = 7) {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + days * 864e5 })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  return payload + '.' + sig;
}

export function isAuthed(req) {
  if (!env('ADMIN_PASSWORD')) return false;
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const good = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  const a = Buffer.from(good), b = Buffer.from(sig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now(); } catch { return false; }
}

export function passwordMatches(input) {
  const pw = env('ADMIN_PASSWORD');
  if (!pw) return false;
  const h = (s) => crypto.createHash('sha256').update(String(s)).digest();
  return crypto.timingSafeEqual(h(input), h(pw));
}

export const hasPassword = () => !!env('ADMIN_PASSWORD');

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });

export const denied = () => json({ error: 'Please sign in again.' }, 401);

export const CONTENT_TAG = 'npotg-content';

export async function purge() {
  if (globalThis.__NPOTG_BLOBS__) return; // local test harness
  try { const { purgeCache } = await import('@netlify/functions'); await purgeCache({ tags: [CONTENT_TAG] }); } catch (e) { console.warn('cache purge skipped', e?.message); }
}

export async function saveContent(content, note) {
  const s = store('npotg-content');
  const at = new Date().toISOString();
  const doc = { ...content, updatedAt: at };
  await s.setJSON('content', doc);
  const id = at.replace(/[:.]/g, '-');
  await s.setJSON('history/' + id, { at, note: note || '', content: doc });
  // keep the 40 most recent versions
  const { blobs } = await s.list({ prefix: 'history/' });
  const keys = blobs.map((b) => b.key).sort().reverse();
  await Promise.all(keys.slice(40).map((k) => s.delete(k)));
  await purge();
  return doc;
}
