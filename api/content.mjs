import { store, isAuthed, sendJson, denied, saveContent, readText } from './_lib/core.mjs';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const doc = (await store('npotg-content').get('content', { type: 'json' })) || {};
    return sendJson(res, doc, 200, {
      'cache-control': 'public, max-age=0, must-revalidate',
    });
  }
  if (req.method === 'PUT') {
    if (!isAuthed(req)) return denied(res);
    const text = await readText(req);
    if (text.length > 4_500_000) {
      return sendJson(res, { error: 'Content is too large. Use uploaded images instead of pasted ones.' }, 413);
    }
    let body;
    try { body = JSON.parse(text); } catch { return sendJson(res, { error: 'Invalid content.' }, 400); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return sendJson(res, { error: 'Invalid content.' }, 400);
    }
    const note = String(req.headers['x-note'] || '').slice(0, 140);
    try {
      const doc = await saveContent(body, note);
      return sendJson(res, { ok: true, updatedAt: doc.updatedAt });
    } catch (e) {
      return sendJson(res, { error: e.message || 'Publish failed.' }, 500);
    }
  }
  return sendJson(res, { error: 'Method not allowed' }, 405);
}

export const config = {
  api: { bodyParser: false },
};
