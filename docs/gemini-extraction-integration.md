# Panduan Integrasi Backend Ekstraksi Gemini — TugasIn

Dokumen ini disusun oleh **Daaris (Member Gemini Extraction, menggantikan Marcel)** pada branch `feat/gemini-extraction` sebagai dokumentasi resmi arsitektur backend, kontrak API, penegakan aturan tenggat waktu sesuai PRD, koordinasi dengan member lain, serta panduan pengujian.

---

## 1. Arsitektur & Lingkungan Server

Backend ekstraksi pengumuman dieksekusi murni di sisi Node.js runtime menggunakan middleware Vite (`src/server/viteApiPlugin.ts`) dan SDK resmi `@google/generative-ai`.

### Keamanan Kunci API (Security-First)
- `GEMINI_API_KEY` **hanya** disimpan di environment server atau file `.env`.
- Kunci API **dilarang keras** dimasukkan ke dalam bundle frontend, kode repositori, atau log server.
- Browser klien hanya memanggil path relatif `/api/extract-task` pada port yang sama (port 3000).

### Variabel Lingkungan (`.env`)
Salin file `.env.example` menjadi `.env` di root workspace:
```bash
# Wajib: API Key Gemini dari Google AI Studio (ai.google.dev)
GEMINI_API_KEY=AIzaSy...

# Opsional: Nama model Gemini yang digunakan server (bawaan: gemini-2.5-flash)
GEMINI_MODEL=gemini-2.5-flash
```

---

## 2. Kontrak Endpoint Backend: `POST /api/extract-task`

### Request Payload
```json
{
  "text": "Untuk mata kuliah UI/UX, buat wireframe aplikasi perpustakaan. Maksimal 3 anggota per kelompok. Kumpulkan PDF pada 21 Oktober 2026 pukul 23.59 WIB melalui LMS.",
  "sourceMessageDate": "2026-10-20",
  "displayTimezone": "Asia/Jakarta"
}
```

#### Aturan Validasi Request (Server-side Zod)
- `text`: Wajib string non-kosong, non-whitespace, minimal 1 karakter, maksimal 5.000 karakter.
- `sourceMessageDate`: Opsional string tanggal format `YYYY-MM-DD` (atau `null`). Digunakan sebagai acuan perhitungan tanggal relatif ("besok" / "lusa").
- `displayTimezone`: String zona waktu tampilan (default: `"Asia/Jakarta"`).
- *Jika validasi gagal*: Mengembalikan HTTP `400 Bad Request` dan **Gemini tidak dipanggil**.

---

### Response Sukses (HTTP 200 OK)

#### Skenario A: Ditemukan Tepat Satu Tugas (`resultType: "task"`)
```json
{
  "resultType": "task",
  "draft": {
    "title": "Tugas Desain Wireframe Aplikasi Perpustakaan",
    "course": "UI/UX",
    "description": "Membuat wireframe aplikasi perpustakaan secara berkelompok dan dikumpulkan melalui LMS.",
    "dueDate": "2026-10-21",
    "dueTime": "23:59",
    "sourceTimezone": "WIB",
    "requirements": [
      "Maksimal 3 anggota per kelompok",
      "Format berkas PDF",
      "Kumpul via LMS"
    ],
    "isAmbiguousDeadline": false
  },
  "criticalFieldEvidence": {
    "title": "buat wireframe aplikasi perpustakaan",
    "deadline": "21 Oktober 2026 pukul 23.59 WIB",
    "requirements": "Maksimal 3 anggota per kelompok. Kumpulkan PDF"
  }
}
```

#### Skenario B: Bukan Tugas Kuliah (`resultType: "no_task"`)
Contoh: obrolan santai, salam, pengumuman kumpul makan, atau info umum.
```json
{
  "resultType": "no_task",
  "draft": null,
  "message": "Teks yang dimasukkan tidak terdeteksi memuat informasi tugas kuliah. Mohon periksa kembali teks pengumuman Anda atau gunakan Tambah Manual.",
  "warnings": []
}
```

#### Skenario C: Memuat Beberapa Tugas Berbeda (`resultType: "multiple_tasks"`)
Contoh: pengumuman memuat Tugas 1 dan Tugas 2 dengan pengumpulan terpisah, atau tugas dua mata kuliah berbeda.
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
*Catatan:* Sesuai PRD Bagian 4 & 5, sistem **dilarang menggabungkan** beberapa tugas menjadi satu atau menyimpan hasil parsial secara diam-diam.

---

### Response Error Terstruktur

| Kode Error | HTTP Status | Penjelasan |
|---|---|---|
| `INVALID_INPUT` | 400 | Input teks kosong, melebihi 5.000 karakter, atau format tanggal pesan asal tidak valid. |
| `UNCONFIGURED_SERVER` | 503 | Kunci API Gemini belum dikonfigurasi di environment server. |
| `SERVICE_OVERLOAD_OR_QUOTA` | 429 | Kuota Gemini API tercapai atau layanan sedang sibuk (rate limit). |
| `TIMEOUT` | 504 | Pemanggilan model melebihi batas waktu aplikasi 30 detik. |
| `INVALID_AI_RESPONSE` | 502 | Respons JSON dari model rusak, kosong, atau tidak lolos validasi skema. |
| `NETWORK_ERROR` | 500 | Gangguan konektivitas atau jaringan server. |

Contoh Response Error:
```json
{
  "error": {
    "code": "TIMEOUT",
    "message": "Permintaan ekstraksi tugas melebihi batas waktu aplikasi 30 detik."
  }
}
```
*Keamanan Log:* Stack trace, API key, dan teks mentah pengumuman **tidak pernah dibocorkan** ke log server maupun ke klien.

---

## 3. Penegakan Aturan Tenggat Waktu (PRD Bagian 8)

Backend secara deterministik menerapkan aturan perlindungan data tenggat waktu:

1. **Dilarang Auto-Fill 23.59**: Jika jam pengumpulan tidak disebutkan di teks, `dueTime` tetap `null`.
2. **Dilarang Asumsi Tahun Berjalan**: Jika tanggal disebutkan tanpa tahun (misal: "28 Oktober" tanpa 2026), `dueDate` disetel `null`, `isAmbiguousDeadline = true`, `ambiguityType = "no_year"`, dan diberi peringatan.
3. **Frasa Relatif "Besok" / "Lusa"**:
   - Jika `sourceMessageDate` diketahui (misal `"2026-10-21"`): backend menghitung tanggal pasti secara aman (`"2026-10-22"`), `isAmbiguousDeadline = false`.
   - Jika `sourceMessageDate` tidak diketahui: `dueDate = null`, `isAmbiguousDeadline = true`, `ambiguityType = "relative_no_source_date"`.
4. **Frasa Relatif Ambigu ("Jumat depan", "Senin depan")**:
   - Memiliki interpretasi tanggal ganda. Selalu ditandai ambigu: `dueDate = null`, `isAmbiguousDeadline = true`, `ambiguityType = "ambiguous_relative_phrase"`.
5. **Tenggat Bertentangan**:
   - Pengumuman dengan perubahan/revisi tenggat yang saling bersaing (misal batas LMS vs info di grup chat) ditandai ambigu: `dueDate = null`, `ambiguityType = "conflicting_deadlines"`.
6. **Tanggal Tidak Valid Kalender**:
   - Tanggal mustahil seperti "31 Februari 2026" ditolak dan ditandai ambigu.
7. **Waktu Tanpa Tanggal**:
   - Waktu pengumpulan (misal: "pukul 14.00") tanpa tanggal tidak boleh dianggap sebagai deadline lengkap. `dueDate = null`, `dueTime = null`, dan diberi peringatan informatif.
8. **Tugas Tanpa Deadline**:
   - Tetap menghasilkan draf tugas valid dengan `dueDate = null` dan `dueTime = null`. Pengguna dapat melengkapinya secara manual pada modal preview sebelum menyimpan.

---

## 4. Perlindungan Terhadap Prompt Injection

Pengumuman diperlakukan murni sebagai **Data Mentah Tidak Tepercaya**:
- Input dibungkus menggunakan pembatas khusus:
  ```
  <UNTRUSTED_ANNOUNCEMENT_DATA>
  ...teks pengumuman...
  </UNTRUSTED_ANNOUNCEMENT_DATA>
  ```
- System instruction melarang model mengeksekusi instruksi apa pun yang terkandung di dalam teks pengumuman.
- Model diinstruksikan untuk selalu mengembalikan JSON sesuai `EXTRACTION_RESPONSE_SCHEMA` dengan temperature `0.1` guna menjaga konsistensi fakta.

---

## 5. Koordinasi Tim Antar-Fitur

### Koordinasi dengan Member Input & Preview (`feat/input-preview`)
- Endpoint: `POST /api/extract-task`
- Tipe request & response: `ExtractionRequest` dan `ExtractionResponse` pada `src/types/extraction.ts`.
- Service pemanggil: `extractTaskFromAnnouncement` pada `src/services/extractionService.ts`.
- Modal Preview: `TaskPreviewModal.tsx` secara otomatis menerima `draft`, `warnings`, dan `criticalFieldEvidence`.

### Koordinasi dengan Member Checklist AI (`feat/checklist`)
- Modul Client Bersama: `src/server/gemini/geminiClient.ts`.
- Kelas `GeminiService` mengimplementasikan kedua antarmuka secara terpadu:
  - `IGeminiClient` -> `generateChecklist(input)`
  - `IGeminiExtractionClient` -> `extractTask(input)`
- Menggunakan singleton instance bersama `defaultGeminiService` yang membaca `GEMINI_API_KEY` dan `GEMINI_MODEL`.
- Tidak ada breaking change terhadap implementasi Checklist yang sudah berjalan.

---

## 6. Verifikasi & Pengujian

### A. Pengujian Unit & Integrasi Otomatis (Mocked)
Menjalankan pengujian tanpa memerlukan kuota API:
```bash
npm test
```
*Hasil:* 60 pengujian lulus (termasuk 21 pengujian komprehensif di `tests/extraction.test.ts` untuk seluruh skenario PRD: validasi input, tenggat lengkap, tanpa tenggat, waktu tanpa tanggal, kalkulasi besok, ambigu tanpa acuan, Jumat depan, tanggal tanpa tahun, tenggat bertentangan, tanggal tidak valid, non-tugas, beberapa tugas, prompt injection, dan error handling).

### B. Pengujian Seluruh Komponen Proyek
```bash
npm run test:all
```
*Hasil:*
- 60 Vitest tests lulus bersih.
- 14 Dashboard Audit & Timezone tests lulus bersih.
- Live verifier mengecek kesiapan environment.

### C. Verifikasi Panggilan Langsung ke Gemini API (Live Integration)
```bash
npx tsx tests/verifyExtractionLive.ts
```
- Jika `GEMINI_API_KEY` belum disetel: Script secara transparan menampilkan status `[BELUM TERVERIFIKASI LANGSUNG]` dan panduan pengisian kunci.
- Jika `GEMINI_API_KEY` aktif: Script memanggil Gemini API secara langsung dengan contoh pengumuman resmi PRD Bagian 13 dan mencetak bukti nyata hasil ekstraksi beserta durasi respons.
