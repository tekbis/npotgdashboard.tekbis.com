import { passwordMatches, hasPassword, signToken, isAuthed, json } from '../lib/core.mjs';

export default async (req) => {
  if (req.method === 'GET') return json({ ok: isAuthed(req), configured: hasPassword() });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!hasPassword()) return json({ error: 'The dashboard password has not been set yet. Add ADMIN_PASSWORD in Netlify → Site configuration → Environment variables, then redeploy.' }, 503);
  let pw = '';
  try { pw = (await req.json()).password || ''; } catch {}
  if (!passwordMatches(pw)) { await new Promise((r) => setTimeout(r, 900)); return json({ error: 'That password is not correct.' }, 401); }
  return json({ token: signToken(7) });
};

export const config = { path: '/api/login' };
