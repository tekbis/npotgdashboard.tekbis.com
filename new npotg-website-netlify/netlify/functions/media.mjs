import { store } from '../lib/core.mjs';

export default async (req, context) => {
  const id = context?.params?.id || new URL(req.url).pathname.split('/').pop();
  if (!/^[\w.-]+$/.test(id || '')) return new Response('Not found', { status: 404 });
  const r = await store('npotg-media').getWithMetadata(id, { type: 'arrayBuffer' });
  if (!r) return new Response('Not found', { status: 404 });
  return new Response(r.data, { headers: { 'content-type': r.metadata?.type || 'application/octet-stream', 'cache-control': 'public, max-age=31536000, immutable', 'x-content-type-options': 'nosniff' } });
};

export const config = { path: '/api/media/:id' };
