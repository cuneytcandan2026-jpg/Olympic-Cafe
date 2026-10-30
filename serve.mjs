import http from 'http';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const ROOT = path.resolve(process.env.SITE_ROOT || __dirname);
// Loopback only: on shared Wi-Fi anyone on the network could otherwise read
// the project files. For phone testing over the LAN: HOST=0.0.0.0 node serve.mjs
const HOST = process.env.HOST || '127.0.0.1';

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg', '.xml', '.txt']);

// Only used by the test/preview build. Runs the real Worker code with a fake
// mail provider, so validation and failure handling are exercised locally.
const MOCK_CONTACT = process.env.MOCK_CONTACT;
let contactWorker;
if (MOCK_CONTACT) contactWorker = (await import('./workers/contact/worker.js')).default;

async function handleMockContact(req, res) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) headers.set(key, String(value));
  const request = new Request(`http://${req.headers.host}${req.url}`, {
    method: req.method,
    headers,
    body: req.method === 'POST' ? body : undefined,
  });
  // A message containing these words simulates each provider outcome.
  const text = body.toString();
  const fakeFetch = async () => {
    if (text.includes('simulate-network-failure')) throw new Error('network down');
    if (text.includes('simulate-provider-failure')) return new Response('{}', { status: 500 });
    return new Response('{"id":"mock"}', { status: 200 });
  };
  if (text.includes('simulate-endpoint-offline')) {
    req.socket.destroy();
    return;
  }
  const env = {
    ALLOWED_ORIGIN: `http://${req.headers.host}`,
    RESEND_API_KEY: 'mock-key',
    MAIL_TO: 'owner@example.test',
    MAIL_FROM: 'Website <website@example.test>',
    fetchImpl: fakeFetch,
  };
  const response = await contactWorker.fetch(request, env);
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(await response.text());
}

http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(req.url.split('?')[0]);
  } catch {
    res.writeHead(400);
    res.end('400 Bad Request');
    return;
  }

  if (MOCK_CONTACT && urlPath === '/api/contact') {
    handleMockContact(req, res).catch(() => {
      res.writeHead(500);
      res.end();
    });
    return;
  }

  const filePath = path.join(ROOT, urlPath.endsWith('/') ? `${urlPath}index.html` : urlPath);
  // path.join resolves "..", so never serve anything outside the project.
  if (!filePath.startsWith(ROOT + path.sep)) {
    res.writeHead(403);
    res.end('403 Forbidden');
    return;
  }

  function send(status, fp, data) {
    const ext = path.extname(fp).toLowerCase();
    // Mirrors GitHub Pages: gzip for text and a 10 minute cache on everything,
    // so local Lighthouse runs are comparable with production.
    const headers = {
      'Content-Type': mime[ext] || 'application/octet-stream',
      'Cache-Control': 'max-age=600',
    };
    const acceptsGzip = /\bgzip\b/.test(req.headers['accept-encoding'] || '');
    if (COMPRESSIBLE.has(ext) && acceptsGzip) {
      headers['Content-Encoding'] = 'gzip';
      headers.Vary = 'Accept-Encoding';
      data = zlib.gzipSync(data);
    }
    res.writeHead(status, headers);
    res.end(data);
  }

  fs.readFile(filePath, (err, data) => {
    if (!err) {
      send(200, filePath, data);
      return;
    }
    // Real 404s, like production. A fallback to index.html would hide broken links.
    const notFound = path.join(ROOT, '404.html');
    fs.readFile(notFound, (notFoundErr, notFoundData) => {
      if (notFoundErr) {
        res.writeHead(404);
        res.end('404 Not Found');
        return;
      }
      send(404, notFound, notFoundData);
    });
  });
}).listen(PORT, HOST, () => console.log(`Server running at http://localhost:${PORT}/`));
