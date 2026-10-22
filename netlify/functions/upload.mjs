import crypto from 'node:crypto';
import { store, isAuthed, json, denied } from '../lib/core.mjs';

const TYPES = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/avif': 'avif' };

export default async (req) => {
  if (!isAuthed(req)) return denied();
  const m = store('npotg-media');
  if (req.method === 'GET') {
    const { blobs } = await m.list();
    const items = await Promise.all(blobs.map(async (b) => { const md = await m.getMetadata(b.key); return { id: b.key, url: '/api/media/' + b.key, ...(md?.metadata || {}) }; }));
    items.sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')));
    return json({ items });
  }
  if (req.method === 'DELETE') {
    const id = new URL(req.url).searchParams.get('id') || '';
    if (!/^[\w.-]+$/.test(id)) return json({ error: 'Unknown image.' }, 400);
    await m.delete(id);
    return json({ ok: true });
  }
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  let body; try { body = await req.json(); } catch { return json({ error: 'Invalid upload.' }, 400); }
  const ext = TYPES[body.type];
  if (!ext) return json({ error: 'Please upload a JPG, PNG, WebP, GIF or AVIF image.' }, 415);
  const buf = Buffer.from(String(body.data || ''), 'base64');
  if (!buf.length) return json({ error: 'The image is empty.' }, 400);
  if (buf.length > 4_000_000) return json({ error: 'Image is larger than 4 MB. Please use a smaller image.' }, 413);
  const id = Date.now().toString(36) + '-' + crypto.randomBytes(4).toString('hex') + '.' + ext;
  const name = String(body.name || 'image').slice(0, 120);
  await m.set(id, buf, { metadata: { type: body.type, name, size: buf.length, w: body.w || null, h: body.h || null, at: new Date().toISOString() } });
  return json({ ok: true, id, url: '/api/media/' + id });
};

export const config = { path: '/api/upload' };
