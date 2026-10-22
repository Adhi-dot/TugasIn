# Panduan Integrasi Backend Ekstraksi Gemini — TugasIn

Dokumen ini disusun oleh **Daaris (Member Gemini Extraction, menggantikan Marcel)** pada branch `feat/gemini-extraction` sebagai dokumentasi resmi arsitektur backend, kontrak API, penegakan aturan tenggat waktu sesuai PRD, koordinasi dengan member lain, kesiapan deployment produksi, serta panduan pengujian.

---

## 1. Arsitektur, Lingkungan Server, & Mekanisme Pemuatan `.env`

Backend ekstraksi pengumuman dieksekusi murni di sisi Node.js runtime menggunakan arsitektur server terpadu dan SDK resmi `@google/generative-ai`.

### Keamanan Kunci API (Security-First)
- `GEMINI_API_KEY` **hanya** disimpan di environment server atau file `.env`.
- Kunci API **dilarang keras** dimasukkan ke dalam bundle frontend, kode repositori, atau log server.
- Browser klien hanya memanggil path relatif `/api/extract-task` pada port yang sama (port 3000).

### Penjelasan Pemuatan `.env` (Development vs Script vs Produksi)
Pemuatan variabel lingkungan tidak terjadi secara ajaib; mekanisme diatur secara eksplisit:

1. **Development Server (`npm run dev`)**:
   Dikelola oleh Vite pada `vite.config.ts` menggunakan utilitas resmi `loadEnv(mode, process.cwd(), '')`. Seluruh key dalam `.env` dan `.env.local` secara eksplisit disuntikkan ke `process.env` sebelum plugin middleware server (`viteApiPlugin.ts`) aktif.
2. **Script Standalone / Verifier (`tests/verifyExtractionLive.ts`)**:
   Eksekusi `npx tsx` **tidak** secara otomatis membaca file `.env` tanpa konfigurasi loader. Oleh karena itu, script `verifyExtractionLive.ts` dilengkapi fungsi `loadEnvManually()` internal yang membaca dan mem-parsing `.env.local` atau `.env` secara aman (menghapus kutipan pembungkus dan komentar) ke `process.env` sebelum memanggil `GeminiService`. Alternatifnya, pengguna dapat menjalankan Node.js 20+ dengan flag bawaan `npx tsx --env-file=.env tests/verifyExtractionLive.ts`.
3. **Produksi (`npm run serve`)**:
   Server produksi membaca `process.env.GEMINI_API_KEY` dari environment host (Docker, VPS, Railway, Render, atau Vercel Environment Variables).

---

## 2. Kontrak Endpoint Backend: `POST /api/extract-task`

### Keselarasan Penuh dengan Frontend Input & Preview
Kontrak endpoint backend ini 100% selaras dengan tipe data pada `src/types/extraction.ts`, service `src/services/extractionService.ts`, dan antarmuka preview `TaskPreviewModal.tsx`:

1. **`warnings` Selalu Tersedia (`string[]`)**:
   Untuk mencegah `undefined` error atau pengecekan null yang rentan di sisi UI, field `warnings` dijamin selalu mengembalikan array string (`[]` jika tidak ada peringatan, atau array berisi peringatan informatif).
2. **`criticalFieldEvidence` Dikenali & Ditampilkan Frontend**:
   Frontend `TaskPreviewModal.tsx` secara native membaca `criticalFieldEvidence` dan merendernya sebagai chip kutipan entitas (misal: `<strong className="capitalize">deadline:</strong> "21 Oktober 2026 pukul 23.59 WIB"`). Backend selalu menyediakan objek `Record<string, string>` berisi kutipan verbatim untuk `title`, `deadline`, dan `requirements`.
3. **Normalisasi `sourceTimezone` ke Zona IANA**:
   - Jika teks pengumuman menyebutkan **"WIB"**, dinormalisasi menjadi zona IANA resmi **`"Asia/Jakarta"`**.
   - Jika menyebutkan **"WITA"**, dinormalisasi menjadi **`"Asia/Makassar"`**.
   - Jika menyebutkan **"WIT"**, dinormalisasi menjadi **`"Asia/Jayapura"`**.
   - **PENTING**: Jika zona waktu **tidak disebutkan** di pengumuman, nilai `sourceTimezone` **wajib tetap `null`**. Sistem dilarang mengarang atau mengubah zona yang tidak disebutkan menjadi fakta sumber.
4. **Pemetaan Kode Error ke HTTP Status**:
   - `400 Bad Request` -> `INVALID_INPUT`
   - `429 Too Many Requests` -> `SERVICE_OVERLOAD_OR_QUOTA` (dipetakan ke `RATE_LIMIT_OR_QUOTA` di frontend)
   - `502 Bad Gateway` -> `INVALID_AI_RESPONSE`
   - `503 Service Unavailable` -> `UNCONFIGURED_SERVER`
   - `504 Gateway Timeout` -> `TIMEOUT`
   - `500 Internal Server Error` -> `NETWORK_ERROR`

---

## 3. Contoh Respons Endpoint yang Benar-Benar Diuji

Berikut adalah contoh payload respons aktual dari endpoint backend yang telah diverifikasi melalui unit test otomatis:

### Contoh 1: Tugas Lengkap dengan Tenggat Waktu & Zona Ternormalisasi
**Input**:
```json
{
  "text": "Untuk mata kuliah UI/UX, buat wireframe aplikasi perpustakaan. Maksimal 3 anggota per kelompok. Kumpulkan PDF pada 21 Oktober 2026 pukul 23.59 WIB melalui LMS.",
  "sourceMessageDate": "2026-10-20",
  "displayTimezone": "Asia/Jakarta"
}
```
**Output (HTTP 200)**:
```json
{
  "resultType": "task",
  "draft": {
    "title": "Tugas Desain Wireframe Aplikasi Perpustakaan",
    "course": "UI/UX",
    "description": "Membuat wireframe aplikasi perpustakaan secara berkelompok dan dikumpulkan melalui LMS.",
    "dueDate": "2026-10-21",
    "dueTime": "23:59",
    "sourceTimezone": "Asia/Jakarta",
    "requirements": [
      "Maksimal 3 anggota per kelompok",
      "Format berkas PDF",
      "Kumpul via LMS"
    ],
    "isAmbiguousDeadline": false
  },
  "warnings": [],
  "criticalFieldEvidence": {
    "title": "buat wireframe aplikasi perpustakaan",
    "deadline": "21 Oktober 2026 pukul 23.59 WIB",
    "requirements": "Maksimal 3 anggota per kelompok. Kumpulkan PDF"
  }
}
```

### Contoh 2: Frasa Relatif "Besok" dengan Acuan Tanggal Pesan Asal
**Input**:
`text: "Tugas Algoritma dikumpulkan besok pukul 17:00."`, `sourceMessageDate: "2026-10-21"`
**Output (HTTP 200)**:
```json
{
  "resultType": "task",
  "draft": {
    "title": "Tugas Algoritma",
    "course": "Algoritma",
    "description": "Kumpulkan tugas algoritma.",
    "dueDate": "2026-10-22",
    "dueTime": "17:00",
    "sourceTimezone": null,
    "requirements": [],
    "isAmbiguousDeadline": false
  },
  "warnings": [],
  "criticalFieldEvidence": {
    "deadline": "2026-10-22 17:00"
  }
}
```

### Contoh 3: Frasa Relatif "Besok" TANPA Acuan Tanggal Pesan Asal (Ditandai Ambigu)
**Input**:
`text: "Tugas Algoritma dikumpulkan besok pukul 17:00."`, `sourceMessageDate: null`
**Output (HTTP 200)**:
```json
{
  "resultType": "task",
  "draft": {
    "title": "Tugas Algoritma",
    "course": "Algoritma",
    "description": "Kumpulkan tugas algoritma.",
    "dueDate": null,
    "dueTime": null,
    "sourceTimezone": null,
    "requirements": [],
    "isAmbiguousDeadline": true,
    "ambiguityReason": "Istilah \"besok\"/\"lusa\" memerlukan acuan tanggal pesan asal agar tanggal pasti dapat dihitung.",
    "ambiguityType": "relative_no_source_date"
  },
  "warnings": [
    "Istilah \"besok\"/\"lusa\" memerlukan acuan tanggal pesan asal agar tanggal pasti dapat dihitung."
  ],
  "criticalFieldEvidence": {}
}
```

### Contoh 4: Pengumuman dengan Tahun Angkatan & Terbitan Paper (Pembedaan Non-Deadline)
**Input**:
`text: "Untuk mahasiswa angkatan 2024, kerjakan review paper jurnal terbitan 2021. Kumpulkan paling lambat 25 Oktober 2026 pukul 23.59 WIB."`
**Output (HTTP 200)**:
```json
{
  "resultType": "task",
  "draft": {
    "title": "Tugas Review Paper Jurnal",
    "course": "Metodologi Penelitian",
    "description": "Review paper terbitan 2021 untuk mahasiswa angkatan 2024.",
    "dueDate": "2026-10-25",
    "dueTime": "23:59",
    "sourceTimezone": "Asia/Jakarta",
    "requirements": [
      "Review paper terbitan 2021"
    ],
    "isAmbiguousDeadline": false
  },
  "warnings": [],
  "criticalFieldEvidence": {
    "title": "tugas review paper jurnal",
    "deadline": "Kumpulkan tugas paling lambat 25 Oktober 2026 pukul 23.59 WIB",
    "requirements": "review paper jurnal terbitan 2021"
  }
}
```
*Hasil Verifikasi:* Angka `2024` (angkatan) dan `2021` (terbitan) **tidak** disalahartikan sebagai deadline. Hanya `2026-10-25` yang dijadikan `dueDate`.

### Contoh 5: Bukan Tugas Kuliah (`resultType: "no_task"`)
```json
{
  "resultType": "no_task",
  "draft": null,
  "message": "Teks yang dimasukkan tidak terdeteksi memuat informasi tugas kuliah. Mohon periksa kembali teks pengumuman Anda atau gunakan Tambah Manual.",
  "warnings": []
}
```

### Contoh 6: Beberapa Tugas Terpisah (`resultType: "multiple_tasks"`)
```json
{
  "resultType": "multiple_tasks",
  "draft": null,
  "message": "Pengumuman terdeteksi memuat lebih dari satu tugas. Harap pisahkan teks agar diproses satu tugas per satu waktu.",
  "warnings": [
    "Teks memuat lebih dari satu instruksi tugas yang terpisah."
  ]
}
```

---

## 4. Batasan Skema Structured Output & Verifikasi Faktual

Sesuai PRD Bagian 9:
> *"Gunakan structured output dengan skema untuk membatasi bentuk respons Gemini, lalu validasi tipe, panjang, enum, dan tanggal di backend. Bentuk JSON yang valid tidak menjamin isi faktual benar."*

1. **Peran Skema Gemini**: Skema JSON (`EXTRACTION_RESPONSE_SCHEMA`) hanya berfungsi membatasi format data keluaran model agar berupa JSON terstruktur valid (mencegah format string acak atau markdown yang merusak parser).
2. **Peran Logika Backend**: Kebenaran faktual, audit ambiguitas deadline, validasi kalender (menolak 31 Februari), kalkulasi tanggal relatif, dan pencegahan auto-fill 23.59 sepenuhnya ditegakkan secara deterministik oleh backend TypeScript di `src/server/api/extractTask.ts` dan `src/utils/deadlines.ts`.

---

## 5. Kompatibilitas Client Gemini Bersama (`GeminiService`)

Kelas `GeminiService` di `src/server/gemini/geminiClient.ts` dirancang sebagai singleton terpadu yang melayani dua fitur AI:
- `IGeminiClient` -> `generateChecklist(input)` (digunakan fitur Checklist)
- `IGeminiExtractionClient` -> `extractTask(input)` (digunakan fitur Ekstraksi Pengumuman)

Keduanya berbagi:
- Singleton instance `defaultGeminiService`
- Konfigurasi `GEMINI_API_KEY` dan `GEMINI_MODEL`
- Pengatur batas timeout 30 detik (`AbortController`)
- Penanganan error terstruktur

Pengujian menyeluruh pada kedua endpoint (`tests/checklist.test.ts` dan `tests/extraction.test.ts`) dijalankan secara rutin dan keduanya **100% lulus (64 tests)**.

---

## 6. Kesiapan Deployment Produksi (Production Server vs Vite Dev)

### Mengapa Vite Plugin Belum Cukup untuk Hosting Produksi?
Plugin Vite (`viteApiPlugin.ts`) menggunakan hook `configureServer(server)` yang **hanya dieksekusi selama development server** (`npm run dev`).
Saat menjalankan `npm run build`:
- Vite hanya mengompilasi kode frontend ke direktori statis `dist/`.
- Jika `dist/` dideploy ke CDN statis murni (seperti GitHub Pages atau AWS S3 murni), request `/api/extract-task` dan `/api/generate-checklist` akan mengembalikan **HTTP 404 Not Found**.

### Solusi Produksi: Node.js Production Server Mandiri
Telah disediakan server produksi mandiri pada file [`src/server/prodServer.ts`](file:///c:/Users/Daaris%20Yuda%20Saputra/OneDrive/Documents/TugasIn/src/server/prodServer.ts):
- Menggunakan modul HTTP standar Node.js (tanpa dependensi framework tambahan).
- Melayani seluruh file statis Single Page Application (SPA) dari folder `dist/`.
- Mendaftarkan rute backend Node.js resmi:
  - `POST /api/extract-task` -> `handleExtractTask`
  - `POST /api/generate-checklist` -> `handleGenerateChecklist`
- Menjalankan port configurable via `process.env.PORT` (default: 3000).

#### Cara Menjalankan di Server Produksi / Docker / PaaS:
```bash
# 1. Build aset frontend
npm run build

# 2. Jalankan server produksi
npm run serve
```
*(Aplikasi siap diakses pada `http://localhost:3000` dengan antarmuka frontend dan endpoint API Gemini aktif bersama).*

#### Alternatif Serverless (Vercel / Netlify):
Jika tim memilih hosting serverless di Vercel, handler `handleExtractTask` dan `handleGenerateChecklist` dapat langsung di-export di dalam direktori `api/extract-task.ts` dan `api/generate-checklist.ts`.

---

## 7. Status Pengujian & Verifikasi Akhir

| Pengujian / Tahap | Status | Bukti / Catatan |
|---|---|---|
| **Typecheck (`tsc --noEmit`)** | ✅ **Lulus (0 error)** | Seluruh kode TypeScript memenuhi Strict Mode tanpa `any`. |
| **Unit & Integration Suite (`vitest run`)** | ✅ **Lulus (64 tests)** | Mencakup 25 test ekstraksi backend, 7 test checklist, 7 test frontend service, dan 25 test deadline/task/dashboard. |
| **Dashboard Audit Suite (`src/test/verifyDashboard.ts`)** | ✅ **Lulus (14 tests)** | Audit kepatuhan IANA timezone, 4-tier sorting, dan overdue calculation. |
| **Production Build (`vite build`)** | ✅ **Lulus** | Bundle frontend terbangun bersih dalam 4.32 detik. |
| **Panggilan Langsung Gemini API (Live Call)** | ⚠️ **Belum Terverifikasi Langsung** | Menunggu penyediaan `GEMINI_API_KEY` aktif di `.env`. Script pemverifikasi siap diuji via `npx tsx tests/verifyExtractionLive.ts`. |
