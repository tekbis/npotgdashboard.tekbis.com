import { passwordMatches, hasPassword, signToken, isAuthed, sendJson, readJson } from './_lib/core.mjs';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return sendJson(res, { ok: isAuthed(req), configured: hasPassword() });
  }
  if (req.method !== 'POST') return sendJson(res, { error: 'Method not allowed' }, 405);
  if (!hasPassword()) {
    return sendJson(res, {
      error: 'The dashboard password has not been set yet. In Vercel, open Project Settings → Environment Variables, add ADMIN_PASSWORD, then redeploy.',
    }, 503);
  }
  let pw = '';
  try { pw = (await readJson(req))?.password || ''; } catch {}
  if (!passwordMatches(pw)) {
    await new Promise((r) => setTimeout(r, 900));
    return sendJson(res, { error: 'That password is not correct.' }, 401);
  }
  return sendJson(res, { token: signToken(7) });
}
