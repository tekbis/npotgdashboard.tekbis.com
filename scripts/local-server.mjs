// Local admin/API test server (no Vercel login needed). Loads .env and uses .data/ storage.
import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 3000);

// load .env
try {
  const envText = fs.readFileSync(path.join(root, '.env'), 'utf8');
  for (const line of envText.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    // .env wins so clearing ADMIN_PASSWORD there actually opens the admin
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {}

const login = (await import(pathToFileURL(path.join(root, 'api/login.mjs')).href)).default;
const content = (await import(pathToFileURL(path.join(root, 'api/content.mjs')).href)).default;
const history = (await import(pathToFileURL(path.join(root, 'api/history.mjs')).href)).default;
const upload = (await import(pathToFileURL(path.join(root, 'api/upload.mjs')).href)).default;
const media = (await import(pathToFileURL(path.join(root, 'api/media/[id].mjs')).href)).default;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.toml': 'text/plain',
};

function wrap(req, res) {
  const u = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  req.query = Object.fromEntries(u.searchParams.entries());
  return u;
}

async function serveStatic(req, res, pathname) {
  let p = decodeURIComponent(pathname);
  if (p.endsWith('/')) p += 'index.html';
  if (p === '/admin') p = '/admin/index.html';
  const file = path.join(root, p.replace(/^\//, ''));
  if (!file.startsWith(root)) {
    res.statusCode = 403;
    return res.end('Forbidden');
  }
  try {
    const data = await fsp.readFile(file);
    res.setHeader('content-type', mime[path.extname(file).toLowerCase()] || 'application/octet-stream');
    res.end(data);
  } catch {
    res.statusCode = 404;
    res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const u = wrap(req, res);
    const p = u.pathname;
    if (p === '/api/login') return login(req, res);
    if (p === '/api/content') return content(req, res);
    if (p === '/api/history') return history(req, res);
    if (p === '/api/upload') return upload(req, res);
    const mediaMatch = p.match(/^\/api\/media\/([^/]+)$/);
    if (mediaMatch) {
      req.query = { ...req.query, id: mediaMatch[1] };
      return media(req, res);
    }
    return serveStatic(req, res, p);
  } catch (e) {
    console.error(e);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: e.message || 'Server error' }));
  }
});

server.listen(PORT, () => {
  console.log(`NPOTG local server http://localhost:${PORT}`);
  console.log(`Admin: http://localhost:${PORT}/admin  (password from .env ADMIN_PASSWORD)`);
});
