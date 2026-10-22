import http, { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { handleExtractTask } from './api/extractTask';
import { handleGenerateChecklist } from './api/generateChecklist';

/**
 * Server Produksi Node.js Mandiri untuk TugasIn
 *
 * Mengapa file ini diperlukan? (PRD & Laporan Kesiapan Produksi):
 * Vite API Plugin ('viteApiPlugin.ts') HANYA berjalan selama 'npm run dev' di development server.
 * Saat aplikasi di-build ('npm run build'), Vite menghasilkan aset statis di folder 'dist/'.
 * Jika hanya aset 'dist/' yang di-hosting di CDN statis (seperti GitHub Pages atau S3 murni),
 * rute backend '/api/extract-task' dan '/api/generate-checklist' TIDAK AKAN AKTIF (404).
 *
 * Solusi Produksi:
 * File ini menyediakan server HTTP Node.js produksi mandiri (tanpa dependensi eksternal tambahan)
 * yang melayani kedua kebutuhan sekaligus:
 * 1. Melayani seluruh file frontend statis dari folder 'dist/' (HTML, CSS, JS, Gambar)
 * 2. Menjalankan endpoint backend Gemini API:
 *    - POST /api/extract-task
 *    - POST /api/generate-checklist
 *
 * Cara Menjalankan di Server / Docker / PaaS:
 * 1. npm run build
 * 2. npx tsx src/server/prodServer.ts (atau node server.js setelah tsc)
 */

const PORT = parseInt(process.env.PORT || '3000', 10);
const DIST_DIR = path.resolve(process.cwd(), 'dist');

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
};

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        reject(new Error('Payload request melebihi batas 1MB.'));
      }
    });

    req.on('end', () => {
      if (!raw || raw.trim().length === 0) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Format JSON request body tidak valid.'));
      }
    });

    req.on('error', (err) => reject(err));
  });
}

function sendJsonResponse(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  const urlPath = req.url ? req.url.split('?')[0] : '/';

  // 1. Rute Backend API: POST /api/extract-task
  if (urlPath === '/api/extract-task') {
    if (req.method !== 'POST') {
      return sendJsonResponse(res, 405, {
        error: { code: 'METHOD_NOT_ALLOWED', message: 'Hanya metode POST yang diizinkan.' },
      });
    }

    try {
      const body = await readJsonBody(req);
      const apiResult = await handleExtractTask(body);
      return sendJsonResponse(res, apiResult.status, apiResult.body);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi gangguan internal server.';
      return sendJsonResponse(res, 400, { error: { code: 'INVALID_INPUT', message } });
    }
  }

  // 2. Rute Backend API: POST /api/generate-checklist
  if (urlPath === '/api/generate-checklist') {
    if (req.method !== 'POST') {
      return sendJsonResponse(res, 405, {
        error: { code: 'METHOD_NOT_ALLOWED', message: 'Hanya metode POST yang diizinkan.' },
      });
    }

    try {
      const body = await readJsonBody(req);
      const apiResult = await handleGenerateChecklist(body);
      return sendJsonResponse(res, apiResult.status, apiResult.body);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi gangguan internal server.';
      return sendJsonResponse(res, 400, { error: { code: 'INVALID_INPUT', message } });
    }
  }

  // 3. Static File Serving (dist/) untuk Single Page Application (SPA)
  if (req.method === 'GET' || req.method === 'HEAD') {
    let filePath = path.join(DIST_DIR, urlPath === '/' ? 'index.html' : urlPath);

    // Cek apakah file ada, jika tidak ada, fallback ke index.html (SPA client routing)
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);
      const stream = fs.createReadStream(filePath);
      return stream.pipe(res);
    }
  }

  res.statusCode = 404;
  res.end('Not Found');
});

// Jalankan server jika dieksekusi langsung
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`[TugasIn Production Server] Berjalan pada http://localhost:${PORT}`);
    console.log(`  - Frontend dist: ${DIST_DIR}`);
    console.log('  - API Endpoints: POST /api/extract-task & POST /api/generate-checklist');
  });
}

export { server };
