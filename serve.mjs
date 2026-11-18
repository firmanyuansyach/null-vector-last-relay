import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('./game', import.meta.url)));
const port = Number(process.argv[2] || 8081);
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml' };

createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname); }
  catch { response.writeHead(400).end('bad request'); return; }
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = resolve(join(root, normalize(pathname)));
  if (file !== root && !file.startsWith(root + sep)) { response.writeHead(403).end('forbidden'); return; }
  let size;
  try { const info = statSync(file); if (!info.isFile()) throw new Error(); size = info.size; }
  catch { response.writeHead(404).end('not found'); return; }
  response.writeHead(200, { 'content-type': mime[extname(file).toLowerCase()] || 'application/octet-stream', 'content-length': size, 'cache-control':'no-store' });
  createReadStream(file).pipe(response);
}).listen(port, '127.0.0.1', () => console.log(`NULL VECTOR is on http://localhost:${port}`));
