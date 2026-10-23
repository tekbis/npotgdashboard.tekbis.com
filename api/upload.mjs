import crypto from 'node:crypto';
import { store, isAuthed, sendJson, denied, readJson, assertWritable } from './_lib/core.mjs';

const TYPES = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/avif': 'avif' };

export default async function handler(req, res) {
  if (!isAuthed(req)) return denied(res);
  const m = store('npotg-media');
  if (req.method === 'GET') {
    const { blobs } = await m.list();
    const items = await Promise.all(blobs.map(async (b) => {
      const md = await m.getMetadata(b.key);
      return { id: b.key, url: '/api/media/' + b.key, ...(md?.metadata || {}) };
    }));
    items.sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')));
    return sendJson(res, { items });
  }
  if (req.method === 'DELETE') {
    const id = (req.query?.id || new URL(req.url, 'http://x').searchParams.get('id') || '');
    if (!/^[\w.-]+$/.test(id)) return sendJson(res, { error: 'Unknown image.' }, 400);
    try {
      assertWritable();
      await m.delete(id);
    } catch (e) {
      return sendJson(res, { error: e.message || 'Delete failed.' }, 500);
    }
    return sendJson(res, { ok: true });
  }
  if (req.method !== 'POST') return sendJson(res, { error: 'Method not allowed' }, 405);
  let body;
  try { body = await readJson(req); } catch { return sendJson(res, { error: 'Invalid upload.' }, 400); }
  const ext = TYPES[body.type];
  if (!ext) return sendJson(res, { error: 'Please upload a JPG, PNG, WebP, GIF or AVIF image.' }, 415);
  const buf = Buffer.from(String(body.data || ''), 'base64');
  if (!buf.length) return sendJson(res, { error: 'The image is empty.' }, 400);
  if (buf.length > 4_000_000) return sendJson(res, { error: 'Image is larger than 4 MB. Please use a smaller image.' }, 413);
  const id = Date.now().toString(36) + '-' + crypto.randomBytes(4).toString('hex') + '.' + ext;
  const name = String(body.name || 'image').slice(0, 120);
  try {
    assertWritable();
    await m.set(id, buf, { metadata: { type: body.type, name, size: buf.length, w: body.w || null, h: body.h || null, at: new Date().toISOString() } });
  } catch (e) {
    return sendJson(res, { error: e.message || 'Upload failed.' }, 500);
  }
  return sendJson(res, { ok: true, id, url: '/api/media/' + id });
}

export const config = {
  api: { bodyParser: { sizeLimit: '5mb' } },
};
