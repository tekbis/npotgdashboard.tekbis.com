// Shared helpers for the NPOTG content dashboard (Vercel + local filesystem / Vercel Blob).
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { put, list, del } from '@vercel/blob';

const env = (k) => process.env[k] || '';

const secret = () => (env('SESSION_SECRET') || env('ADMIN_PASSWORD')) + '::npotg-dashboard';

export function signToken(days = 7) {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + days * 864e5 })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  return payload + '.' + sig;
}

export function isAuthed(req) {
  // No password set yet → open access (add ADMIN_PASSWORD later to lock the dashboard)
  if (!env('ADMIN_PASSWORD')) return true;
  const token = String(req.headers.authorization || req.headers.Authorization || '').replace(/^Bearer\s+/i, '');
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const good = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  const a = Buffer.from(good), b = Buffer.from(sig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now(); } catch { return false; }
}

export function passwordMatches(input) {
  const pw = env('ADMIN_PASSWORD');
  if (!pw) return false;
  const h = (s) => crypto.createHash('sha256').update(String(s)).digest();
  return crypto.timingSafeEqual(h(input), h(pw));
}

export const hasPassword = () => !!env('ADMIN_PASSWORD');

export function sendJson(res, data, status = 200, headers = {}) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(data));
}

export function denied(res) {
  return sendJson(res, { error: 'Please sign in again.' }, 401);
}

async function readBody(req) {
  if (req.body !== undefined && req.body !== null && req.body !== '') {
    if (typeof req.body === 'string') return req.body;
    if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
    return JSON.stringify(req.body);
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

export async function readJson(req) {
  const text = await readBody(req);
  if (!text) return null;
  if (typeof req.body === 'object' && req.body !== null && !Buffer.isBuffer(req.body) && typeof req.body !== 'string') {
    return req.body;
  }
  return JSON.parse(text);
}

export async function readText(req) {
  return readBody(req);
}

function useBlob() {
  return !!env('BLOB_READ_WRITE_TOKEN');
}

export function assertWritable() {
  if (env('VERCEL') && !useBlob()) {
    throw new Error('Add BLOB_READ_WRITE_TOKEN: create a Blob store in the Vercel dashboard and connect it to this project.');
  }
}

function dataRoot(name) {
  return path.join(process.cwd(), '.data', name);
}

function fsStore(name) {
  const root = dataRoot(name);
  const fileFor = (key) => path.join(root, ...String(key).split('/'));
  const metaFor = (key) => fileFor(key) + '.meta.json';

  return {
    async get(key, opts = {}) {
      try {
        const buf = await fs.readFile(fileFor(key));
        if (opts.type === 'json') return JSON.parse(buf.toString('utf8'));
        if (opts.type === 'arrayBuffer') return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
        return buf;
      } catch {
        return null;
      }
    },
    async setJSON(key, obj) {
      const f = fileFor(key);
      await fs.mkdir(path.dirname(f), { recursive: true });
      await fs.writeFile(f, JSON.stringify(obj));
    },
    async set(key, data, { metadata } = {}) {
      const f = fileFor(key);
      await fs.mkdir(path.dirname(f), { recursive: true });
      await fs.writeFile(f, Buffer.isBuffer(data) ? data : Buffer.from(data));
      if (metadata) await fs.writeFile(metaFor(key), JSON.stringify(metadata));
    },
    async delete(key) {
      await fs.unlink(fileFor(key)).catch(() => {});
      await fs.unlink(metaFor(key)).catch(() => {});
    },
    async list({ prefix = '' } = {}) {
      const out = [];
      async function walk(dir, rel = '') {
        let entries;
        try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return; }
        for (const e of entries) {
          if (e.name.endsWith('.meta.json')) continue;
          const r = rel ? rel + '/' + e.name : e.name;
          const full = path.join(dir, e.name);
          if (e.isDirectory()) await walk(full, r);
          else if (!prefix || r.startsWith(prefix)) out.push({ key: r });
        }
      }
      await walk(root);
      return { blobs: out };
    },
    async getMetadata(key) {
      try {
        return { metadata: JSON.parse(await fs.readFile(metaFor(key), 'utf8')) };
      } catch {
        return { metadata: {} };
      }
    },
    async getWithMetadata(key, opts = {}) {
      const data = await this.get(key, opts);
      if (data == null) return null;
      const md = await this.getMetadata(key);
      return { data, metadata: md.metadata || {} };
    },
  };
}

function blobStore(name) {
  const token = env('BLOB_READ_WRITE_TOKEN');
  const prefix = name + '/';
  const pathname = (key) => prefix + key;

  async function find(key) {
    const { blobs } = await list({ prefix: pathname(key), token, limit: 100 });
    return blobs.find((b) => b.pathname === pathname(key)) || null;
  }

  return {
    async get(key, opts = {}) {
      const b = await find(key);
      if (!b) return null;
      const r = await fetch(b.url);
      if (!r.ok) return null;
      if (opts.type === 'json') return r.json();
      if (opts.type === 'arrayBuffer') return r.arrayBuffer();
      return Buffer.from(await r.arrayBuffer());
    },
    async setJSON(key, obj) {
      await put(pathname(key), JSON.stringify(obj), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
        token,
      });
    },
    async set(key, data, { metadata } = {}) {
      const body = Buffer.isBuffer(data) ? data : Buffer.from(data);
      await put(pathname(key), body, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: metadata?.type || 'application/octet-stream',
        token,
      });
      if (metadata) {
        await put(pathname(key) + '.meta.json', JSON.stringify(metadata), {
          access: 'public',
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: 'application/json',
          token,
        });
      }
    },
    async delete(key) {
      const b = await find(key);
      if (b) await del(b.url, { token });
      const meta = await find(key + '.meta.json');
      if (meta) await del(meta.url, { token });
    },
    async list({ prefix: p = '' } = {}) {
      const { blobs } = await list({ prefix: pathname(p), token });
      return {
        blobs: blobs
          .filter((b) => !b.pathname.endsWith('.meta.json'))
          .map((b) => ({ key: b.pathname.slice(prefix.length), url: b.url })),
      };
    },
    async getMetadata(key) {
      const b = await find(key + '.meta.json');
      if (!b) return { metadata: {} };
      try {
        const r = await fetch(b.url);
        return { metadata: await r.json() };
      } catch {
        return { metadata: {} };
      }
    },
    async getWithMetadata(key, opts = {}) {
      const data = await this.get(key, opts);
      if (data == null) return null;
      const md = await this.getMetadata(key);
      return { data, metadata: md.metadata || {} };
    },
  };
}

export const store = (name) => (useBlob() ? blobStore(name) : fsStore(name));

export async function saveContent(content, note) {
  assertWritable();
  const s = store('npotg-content');
  const at = new Date().toISOString();
  const doc = { ...content, updatedAt: at };
  await s.setJSON('content', doc);
  const id = at.replace(/[:.]/g, '-');
  await s.setJSON('history/' + id, { at, note: note || '', content: doc });
  const { blobs } = await s.list({ prefix: 'history/' });
  const keys = blobs.map((b) => b.key).sort().reverse();
  await Promise.all(keys.slice(40).map((k) => s.delete(k)));
  return doc;
}
