import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 4000;

const mime = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.mjs':  'application/javascript',
  '.json': 'application/json',
  '.xml':  'application/xml',
  '.txt':  'text/plain',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
  '.ico':  'image/x-icon',
  '.otf':  'font/otf',
  '.ttf':  'font/ttf',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.mp4':  'video/mp4',
  '.webm': 'video/webm',
  '.mov':  'video/quicktime',
};

const cleanRoutes = {
  '/':                                'index.html',
  '/about':                           'about.html',
  '/services':                        'services.html',
  '/contact':                         'contact.html',
  '/blogs':                           'blogs.html',
  '/aluminum-wiring-regina':          'aluminum-wiring-regina.html',
  '/electrical-panel-upgrade-regina': 'electrical-panel-upgrade-regina.html',
  '/lighting-upgrades-regina':        'lighting-upgrades-regina.html',
  '/hot-tub-pool-sauna':              'hot-tub-pool-sauna.html',
  '/permanent-lights-regina':         'permanent-lights-regina.html',
  '/generator-installation-regina':   'generator-installation-regina.html',
  '/ev-charging-regina':              'ev-charging-regina.html',
  '/smart-home-energy-regina':        'smart-home-energy-regina.html',
  '/watts-led-permanent-lighting':    'watts-led-permanent-lighting.html',
};

const server = http.createServer((req, res) => {
  const rawPath = req.url.split('?')[0];
  const urlPath = decodeURIComponent(rawPath);
  // Strip leading slash so path.join doesn't treat it as drive-root on Windows
  const relPath = urlPath.replace(/^\/+/, '');

  if (cleanRoutes[urlPath]) {
    const filePath = path.join(__dirname, cleanRoutes[urlPath]);
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  const filePath = path.join(__dirname, relPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mime[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found: ' + urlPath); return; }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
