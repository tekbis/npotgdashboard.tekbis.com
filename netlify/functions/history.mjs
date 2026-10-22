import { store, isAuthed, json, denied, saveContent } from '../lib/core.mjs';

export default async (req) => {
  if (!isAuthed(req)) return denied();
  const s = store('npotg-content');
  if (req.method === 'GET') {
    const { blobs } = await s.list({ prefix: 'history/' });
    const keys = blobs.map((b) => b.key).sort().reverse().slice(0, 40);
    const items = await Promise.all(keys.map(async (k) => { const h = await s.get(k, { type: 'json' }); return h ? { id: k.slice(8), at: h.at, note: h.note || '' } : null; }));
    return json({ items: items.filter(Boolean) });
  }
  if (req.method === 'POST') {
    let id = ''; try { id = (await req.json()).id || ''; } catch {}
    if (!/^[\w-]+$/.test(id)) return json({ error: 'Unknown version.' }, 400);
    const h = await s.get('history/' + id, { type: 'json' });
    if (!h) return json({ error: 'That version no longer exists.' }, 404);
    const { updatedAt, ...content } = h.content || {};
    const doc = await saveContent(content, 'Restored version from ' + h.at);
    return json({ ok: true, updatedAt: doc.updatedAt, content: doc });
  }
  return json({ error: 'Method not allowed' }, 405);
};

export const config = { path: '/api/history' };
