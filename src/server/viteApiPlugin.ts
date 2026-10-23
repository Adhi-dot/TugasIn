import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import { handleGenerateChecklist } from './api/generateChecklist';
import { handleExtractTask } from './api/extractTask';

/**
 * Helper untuk membaca stream request body JSON dari client
 */
function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      // Batas aman ukuran payload: 1MB
      if (raw.length > 1024 * 1024) {
        reject(new Error('Ukuran payload request melebihi batas 1MB.'));
      }
    });

    req.on('end', () => {
      if (!raw || raw.trim().length === 0) {
        return resolve({});
      }
      try {
        const parsed = JSON.parse(raw);
        resolve(parsed);
      } catch {
        reject(new Error('Format JSON pada request body tidak valid.'));
      }
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Vite Dev Server API Plugin untuk TugasIn
 * Mendaftarkan middleware backend resmi untuk menangani rute:
 * 1. POST /api/generate-checklist (Pembuatan checklist 3-7 langkah via Gemini)
 * 2. POST /api/extract-task (Ekstraksi pengumuman ke draft tugas)
 *
 * Keunggulan arsitektural:
 * - Kode backend dan SDK Gemini (@google/generative-ai) murni dieksekusi di Node.js runtime.
 * - GEMINI_API_KEY tidak pernah diekspos ke bundle browser client.
 * - Frontend cukup memanggil path relatif "/api/generate-checklist" pada port yang sama (port 3000).
 */
export function viteApiPlugin(): Plugin {
  return {
    name: 'tugasin-backend-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const urlPath = req.url ? req.url.split('?')[0] : '';

        // Rute 1: POST /api/generate-checklist
        if (urlPath === '/api/generate-checklist') {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Hanya metode POST yang diizinkan.' } }));
            return;
          }

          try {
            const body = await readJsonBody(req);
            const apiResult = await handleGenerateChecklist(body);

            res.statusCode = apiResult.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(apiResult.body));
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Terjadi kesalahan internal pada server.';
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: { code: 'INVALID_INPUT', message } }));
          }
          return;
        }

        // Rute 2: POST /api/extract-task
        if (urlPath === '/api/extract-task') {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Hanya metode POST yang diizinkan.' } }));
            return;
          }

          try {
            const body = await readJsonBody(req);
            const apiResult = await handleExtractTask(body);

            res.statusCode = apiResult.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(apiResult.body));
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Terjadi kesalahan internal pada server.';
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: { code: 'INVALID_INPUT', message } }));
          }
          return;
        }

        // Teruskan request selain /api ke middleware Vite berikutnya
        next();
      });
    },
  };
}
