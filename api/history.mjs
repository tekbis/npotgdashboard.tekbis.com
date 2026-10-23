import { store, isAuthed, sendJson, denied, saveContent, readJson } from './_lib/core.mjs';

export default async function handler(req, res) {
  if (!isAuthed(req)) return denied(res);
  const s = store('npotg-content');
  if (req.method === 'GET') {
    const { blobs } = await s.list({ prefix: 'history/' });
    const keys = blobs.map((b) => b.key).sort().reverse().slice(0, 40);
    const items = await Promise.all(keys.map(async (k) => {
      const h = await s.get(k, { type: 'json' });
      return h ? { id: k.slice(8), at: h.at, note: h.note || '' } : null;
    }));
    return sendJson(res, { items: items.filter(Boolean) });
  }
  if (req.method === 'POST') {
    let id = '';
    try { id = (await readJson(req))?.id || ''; } catch {}
    if (!/^[\w-]+$/.test(id)) return sendJson(res, { error: 'Unknown version.' }, 400);
    const h = await s.get('history/' + id, { type: 'json' });
    if (!h) return sendJson(res, { error: 'That version no longer exists.' }, 404);
    const { updatedAt, ...content } = h.content || {};
    try {
      const doc = await saveContent(content, 'Restored version from ' + h.at);
      return sendJson(res, { ok: true, updatedAt: doc.updatedAt, content: doc });
    } catch (e) {
      return sendJson(res, { error: e.message || 'Restore failed.' }, 500);
    }
  }
  return sendJson(res, { error: 'Method not allowed' }, 405);
}
