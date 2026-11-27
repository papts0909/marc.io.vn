// Static server tối giản (không phụ thuộc) dùng cho dev và test.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(process.argv[2] || 'src');
const port = Number(process.argv[3] || process.env.PORT || 5173);
// Đường dẫn con giống production (vd. /marc.io.vn/ dưới github.io)
const base = ('/' + (process.argv[4] || '').replace(/^\/+|\/+$/g, '') + '/').replace('//', '/');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };

http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (base !== '/') {
      if (p === base.slice(0, -1) || p === '/') { res.writeHead(302, { Location: base }).end(); return; }
      if (!p.startsWith(base)) { res.writeHead(404).end('Not found'); return; }
      p = p.slice(base.length - 1);
    }
    let file = normalize(join(root, p));
    if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
    const s = await stat(file).catch(() => null);
    if (s && s.isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
  }
}).listen(port, () => console.log(`Serving ${root} at http://localhost:${port}${base}`));
