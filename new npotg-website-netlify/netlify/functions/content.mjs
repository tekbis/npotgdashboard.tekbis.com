import { store, isAuthed, json, denied, saveContent, CONTENT_TAG } from '../lib/core.mjs';

export default async (req) => {
  if (req.method === 'GET') {
    const doc = (await store('npotg-content').get('content', { type: 'json' })) || {};
    return json(doc, 200, {
      'cache-control': 'public, max-age=0, must-revalidate',
      'netlify-cdn-cache-control': 'public, durable, s-maxage=31536000, stale-while-revalidate=60',
      'netlify-cache-tag': CONTENT_TAG,
    });
  }
  if (req.method === 'PUT') {
    if (!isAuthed(req)) return denied();
    const text = await req.text();
    if (text.length > 4_500_000) return json({ error: 'Content is too large. Use uploaded images instead of pasted ones.' }, 413);
    let body; try { body = JSON.parse(text); } catch { return json({ error: 'Invalid content.' }, 400); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Invalid content.' }, 400);
    const note = String(req.headers.get('x-note') || '').slice(0, 140);
    const doc = await saveContent(body, note);
    return json({ ok: true, updatedAt: doc.updatedAt });
  }
  return json({ error: 'Method not allowed' }, 405);
};

export const config = { path: '/api/content' };
