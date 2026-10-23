import { store } from '../_lib/core.mjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end('Method not allowed');
  }
  const id = req.query?.id || '';
  if (!/^[\w.-]+$/.test(id)) {
    res.statusCode = 404;
    return res.end('Not found');
  }
  const r = await store('npotg-media').getWithMetadata(id, { type: 'arrayBuffer' });
  if (!r) {
    res.statusCode = 404;
    return res.end('Not found');
  }
  const buf = Buffer.from(r.data);
  res.statusCode = 200;
  res.setHeader('content-type', r.metadata?.type || 'application/octet-stream');
  res.setHeader('cache-control', 'public, max-age=31536000, immutable');
  res.setHeader('x-content-type-options', 'nosniff');
  res.end(buf);
}
