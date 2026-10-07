import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3002;
const ROOT = __dirname;
// Loopback only: on shared Wi-Fi anyone on the network could otherwise read
// the project files. For phone testing over the LAN: HOST=0.0.0.0 node serve.mjs
const HOST = process.env.HOST || '127.0.0.1';

const mime = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
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
  '.txt': 'text/plain',
};

http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(req.url.split('?')[0]);
  } catch {
    res.writeHead(400);
    res.end('400 Bad Request');
    return;
  }
  let filePath = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);
  // path.join resolves "..", so never serve anything outside the project.
  if (!filePath.startsWith(ROOT + path.sep)) {
    res.writeHead(403);
    res.end('403 Forbidden');
    return;
  }
  const ext = path.extname(filePath).toLowerCase();

  function serveFile(fp) {
    fs.readFile(fp, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('404 Not Found');
        return;
      }
      const contentType = mime[path.extname(fp).toLowerCase()] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  }

  fs.access(filePath, fs.constants.F_OK, err => {
    if (!err && ext) {
      serveFile(filePath);
    } else {
      serveFile(path.join(ROOT, 'index.html'));
    }
  });
}).listen(PORT, HOST, () => console.log(`Server running at http://localhost:${PORT}/`));
