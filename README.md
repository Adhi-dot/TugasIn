# TugasIn

**Dari chat jadi checklist.**

TugasIn adalah aplikasi web yang membantu mahasiswa mengubah pengumuman tugas menjadi daftar kerja terstruktur menggunakan Gemini API.

Pengguna menempelkan pengumuman dari grup kelas atau LMS, memeriksa hasil ekstraksi, lalu menyimpannya ke dashboard untuk memantau deadline, status, dan progres pengerjaan.

Proyek ini dikembangkan sebagai MVP hackathon bertema **Otomatisasi kerja/kuliah**.

## Fitur Utama

| Fitur | Fungsi |
| --- | --- |
| Ekstraksi pengumuman | Mengambil judul, mata kuliah, deskripsi, deadline, zona waktu, dan ketentuan |
| Preview dan koreksi | Memeriksa hasil AI bersama teks sumber sebelum disimpan |
| Dashboard | Menampilkan tugas, filter status, ringkasan, dan prioritas deadline |
| Task Management | Tambah manual, edit, hapus dengan konfirmasi, dan perubahan status |
| Checklist AI | Menghasilkan 3–7 langkah pengerjaan yang dapat diedit dan dicentang |
| Penyimpanan lokal | Mempertahankan tugas dan progres setelah refresh |
| Penanganan kegagalan | Mempertahankan draft dan melindungi data rusak dari penimpaan otomatis |

## Alur Penggunaan

1. Buka dashboard.
2. Pilih **Tambah dari pengumuman**.
3. Tempel teks pengumuman dan isi tanggal pesan asal jika diperlukan.
4. Tekan **Ambil tugas**.
5. Bandingkan draft dengan sumber dan koreksi informasi.
6. Simpan tugas ke dashboard.
7. Buka detail untuk mengedit, mengubah status, atau membuat checklist.
8. Centang langkah pengerjaan untuk memperbarui progres.

Tugas juga dapat ditambahkan secara manual tanpa memanggil Gemini.

## Teknologi

| Bagian | Teknologi |
| --- | --- |
| Frontend | React, TypeScript |
| Styling | Tailwind CSS, Lucide React |
| Development dan build | Vite |
| Backend AI | Node.js, handler TypeScript, Gemini API |
| Validasi | Zod dan validasi aturan aplikasi |
| Penyimpanan | Browser localStorage |
| Pengujian | Vitest, tsx |
| Kolaborasi | Git dan GitHub |
| Acuan desain | Stitch |

## Menjalankan Proyek

### Persiapan

Siapkan Git, Node.js, dan npm. Gunakan versi Node.js yang kompatibel dengan dependency pada `package.json`.

### Ambil Repository

```bash
git clone https://github.com/Adhi-dot/TugasIn.git
cd TugasIn
git switch dev
npm install
```

Branch `dev` berisi fitur yang sudah digabung. Perubahan dalam PR yang masih terbuka belum otomatis tersedia pada branch ini.

Jika repository sudah tersedia di laptop, periksa `git status` dan amankan perubahan lokal sebelum memperbarui branch.

### Konfigurasi Gemini

Salin `.env.example` menjadi `.env` pada folder yang sama dengan `package.json`.

```env
GEMINI_API_KEY=isi_api_key_anda
GEMINI_MODEL=gemini-3.8-flash
```

Model dipilih secara eksplisit melalui `GEMINI_MODEL`. Gunakan model yang tersedia untuk akun tim. Model contoh di atas merupakan model yang dilaporkan digunakan saat pengujian tim.

Ketentuan konfigurasi:

- Jangan commit `.env` ke Git.
- Jangan memasukkan API key ke kode frontend.
- Jangan menggunakan awalan `VITE_` untuk API key rahasia.
- Konfigurasi environment hosting secara terpisah saat deployment.
- Mulai ulang server setelah mengubah environment.

Tanpa API key, tampilan dan fitur manual tetap dapat digunakan. Ekstraksi dan pembuatan checklist AI membutuhkan backend dengan konfigurasi Gemini yang valid.

### Jalankan Development Server

```bash
npm run dev
```

Buka alamat **Local** yang muncul di terminal, misalnya:

```text
http://localhost:3000/
```

Gunakan port yang benar-benar ditampilkan. Biarkan terminal berjalan selama aplikasi digunakan. Tekan `Ctrl+C` untuk menghentikan server.

## Build dan Server Produksi

```bash
npm run build
npm run serve
```

Script `serve` menjalankan `src/server/prodServer.ts` melalui `tsx` untuk melayani frontend dari `dist/` serta endpoint AI. Pastikan script ini tersedia pada branch yang dijalankan.

Environment produksi harus menyediakan `GEMINI_API_KEY` dan `GEMINI_MODEL`. Ikuti dokumentasi integrasi untuk mekanisme pemuatan environment.

Hosting folder `dist/` saja tidak menjalankan backend Gemini. Deployment memerlukan runtime server atau adaptasi handler sesuai platform hosting. Pastikan `tsx` tersedia jika menggunakan script `serve`.

## Aturan Tugas dan Deadline

### Validasi

- Judul wajib setelah trim, maksimal 150 karakter.
- Mata kuliah opsional, maksimal 100 karakter.
- Teks pengumuman maksimal 5.000 karakter.
- Satu proses ekstraksi ditujukan untuk satu tugas.
- Tugas tanpa deadline tetap dapat disimpan.
- Jam tidak boleh disimpan tanpa tanggal.

### Perilaku AI

- Informasi yang tidak disebutkan tidak dibuat sebagai fakta.
- Field yang tidak tersedia menggunakan `null` atau array kosong sesuai kontrak.
- Hasil AI diperiksa pengguna sebelum disimpan.
- Ketentuan asli dipisahkan dari checklist **Saran AI**.
- Pengumuman diperlakukan sebagai data, bukan instruksi untuk mengubah perilaku sistem.
- Structured output membatasi bentuk respons, tetapi tidak menjamin kebenaran faktual.

### Deadline

- Tanggal, jam, zona sumber, dan zona tampilan merupakan field terpisah.
- Tidak ada asumsi otomatis jam 23.59 atau tahun berjalan.
- “Besok” dan “lusa” hanya dikonversi jika tanggal pesan asal diketahui.
- Tanggal tanpa tahun, tanggal tidak valid, frasa seperti “Jumat depan”, dan tenggat bertentangan ditandai ambigu.
- Tanggal lengkap tanpa jam tetap boleh disimpan dengan keterangan bahwa jam tidak disebutkan.
- WIB, WITA, dan WIT dinormalisasi menjadi `Asia/Jakarta`, `Asia/Makassar`, dan `Asia/Jayapura`.
- Zona sumber tetap kosong jika tidak disebutkan atau dikonfirmasi pengguna.

### Status dan Urutan Dashboard

Status tugas:

| Nilai | Tampilan |
| --- | --- |
| `not_started` | Belum mulai |
| `in_progress` | Dikerjakan |
| `done` | Selesai |

Urutan dashboard:

1. Tugas aktif yang terlambat.
2. Tugas aktif dengan deadline terdekat.
3. Tugas aktif tanpa deadline.
4. Tugas selesai.

Dalam kelompok terlambat, tenggat paling lama ditampilkan terlebih dahulu. Tugas selesai tidak berlabel terlambat.

Checklist 100% tidak otomatis mengubah status tugas menjadi selesai; keputusan tetap pada pengguna.

## Penyimpanan dan Pemulihan

Semua fitur menggunakan state bersama melalui `useTaskManager` dan key localStorage:

```text
tugasin_tasks
```

Modul `taskStorage` menangani validasi, pembacaan, dan penulisan data.

- Tugas dan progres tersedia pada browser serta perangkat yang sama.
- Menghapus data browser dapat menghilangkan tugas.
- Data rusak tidak dihapus atau ditimpa otomatis.
- Reset penyimpanan memerlukan konfirmasi pengguna.
- Penulisan diblokir jika berisiko menimpa data rusak sebelum reset disetujui.
- Kegagalan penyimpanan tidak boleh ditampilkan sebagai keberhasilan.
- Form atau draft dipertahankan agar pengguna dapat mencoba lagi.

Teks pengumuman dikirim ke Gemini saat ekstraksi. Penyimpanan lokal tidak berarti seluruh pemrosesan berlangsung di perangkat.

## Endpoint Backend

| Endpoint | Input utama | Output |
| --- | --- | --- |
| `POST /api/extract-task` | `text`, `sourceMessageDate` opsional, `displayTimezone` | `resultType`, `draft`, `warnings`, `criticalFieldEvidence` |
| `POST /api/generate-checklist` | `title`, `description`, `requirements` | Daftar 3–7 langkah |

Hasil ekstraksi dibedakan menjadi:

- `task`: satu tugas ditemukan.
- `no_task`: tidak ada tugas yang dapat diekstrak.
- `multiple_tasks`: pengguna diminta memisahkan beberapa tugas.

Backend menangani input tidak valid, konfigurasi belum tersedia, kuota, layanan sibuk, timeout, dan respons AI yang tidak valid.

Batas tunggu aplikasi adalah **30 detik**. Retry dilakukan pengguna melalui **Coba Lagi**, tanpa retry otomatis dari aplikasi.

API key, stack trace, dan teks mentah pengumuman tidak boleh dibocorkan melalui pesan pengguna atau log server.

Dokumentasi lebih lengkap:

- `docs/gemini-extraction-integration.md`
- `docs/checklist-integration.md`

## Pengujian

### Pemeriksaan Otomatis

```bash
npm test
npm run typecheck
npm run build
npx tsx src/test/verifyDashboard.ts
```

### Verifikasi Gemini Langsung

Setelah environment dikonfigurasi:

```bash
npx tsx tests/verifyExtractionLive.ts
```

Script ini memanggil handler backend dalam proses Node.js, kemudian mengirim request HTTPS ke Gemini. Script tersebut tidak menguji socket HTTP lokal atau interaksi browser.

### Pemeriksaan Browser

Sebelum penggabungan akhir atau rilis, periksa:

1. Tambah manual menghasilkan tepat satu tugas.
2. Edit tersimpan; pembatalan tidak mengubah data.
3. Perubahan status memperbarui kartu, filter, dan ringkasan.
4. Hapus meminta konfirmasi.
5. Checklist dan progres bertahan setelah refresh.
6. Ekstraksi Gemini nyata dapat dikoreksi dan disimpan.
7. Checklist Gemini nyata dapat dibuat dan dicentang.
8. Deadline lengkap, tanpa jam, serta ambigu ditangani dengan benar.
9. Kegagalan penyimpanan mempertahankan draft.
10. Data rusak tidak ditimpa tanpa persetujuan.

Gunakan data uji ketika mensimulasikan kerusakan atau kegagalan penyimpanan.

### Status Verifikasi

Berdasarkan laporan tim hingga commit `0d472df` pada branch `feat/task-management`, tanggal 22 Oktober 2026:

- 89 unit/integration tests dilaporkan lulus sebelum perbaikan terakhir.
- 14 audit dashboard dilaporkan lulus.
- Typecheck dan build dilaporkan berhasil.
- Pengujian browser fitur manual serta penyimpanan dilaporkan lulus.
- Panggilan Gemini langsung untuk ekstraksi dan checklist dilaporkan berhasil.
- Jalur HTTP development dilaporkan diuji terpisah.
- Alur browser lengkap dengan Gemini nyata sampai refresh masih menunggu konfirmasi akhir.
- Deployment hosting belum dikonfirmasi.

Status tersebut berasal dari laporan pengembangan, bukan audit independen. Jalankan pemeriksaan ulang pada commit yang hendak dirilis.

## Workflow GitHub

### Branch

| Branch | Kegunaan |
| --- | --- |
| `main` | Versi rilis yang sudah disepakati |
| `dev` | Integrasi dan pengujian bersama |
| `feat/*` | Pengembangan fitur anggota |

Branch fitur dibuat dari `dev`, sehingga langsung membawa isi proyek pada saat dibuat.

### Pembagian Tugas

| Peran | Branch | Tanggung jawab |
| --- | --- | --- |
| Setup Project | `feat/setup-project` | Fondasi dan konfigurasi |
| Input & Preview | `feat/input-preview` | Input pengumuman, validasi, preview, koreksi |
| Gemini Extraction | `feat/gemini-extraction` | Client AI, ekstraksi, kontrak endpoint |
| Dashboard | `feat/dashboard` | Daftar, filter, prioritas, ringkasan |
| Checklist | `feat/checklist` | Langkah pengerjaan dan progres |
| Task Management | `feat/task-management` | CRUD, status, state dan storage bersama |

### Alur Kontribusi

1. Baca `AGENTS.md` dan `PRD-TugasIn.md`.
2. Periksa branch serta perubahan lokal.
3. Fetch repository tim.
4. Gunakan branch fitur yang sesuai.
5. Integrasikan `dev` terbaru bila diperlukan.
6. Pertahankan fitur anggota lain ketika menyelesaikan konflik.
7. Jalankan tes, typecheck, dan build yang relevan.
8. Commit dan push tanpa force push.
9. Buat PR dengan **base `dev`** dan **compare branch fitur**.
10. Leader melakukan review sebelum merge.

Nama remote dapat berupa `origin` atau `upstream`. Periksa `git remote -v` dan gunakan remote yang mengarah ke repository tim.

Push berikutnya pada branch yang sama akan memperbarui PR yang masih terbuka. Jangan menghapus branch yang masih dikerjakan atau belum selesai diintegrasikan.

Penggabungan `dev` ke `main` dilakukan setelah pengujian gabungan dan kesiapan rilis disepakati.

## Batasan MVP

- Penggunaan individu tanpa login.
- Data belum tersinkron lintas perangkat.
- Tidak ada database tugas di server.
- Input berupa teks, tanpa OCR, unggah PDF, atau transkripsi audio.
- Tidak terhubung langsung dengan WhatsApp atau LMS.
- Indikator deadline bukan notifikasi latar belakang.
- Ketersediaan AI bergantung pada koneksi, akses model, dan kuota API.

## Rencana Pengembangan

Prioritas terdekat:

- Menyelesaikan pengujian browser dengan Gemini nyata.
- Memverifikasi versi gabungan di `dev`.
- Menyiapkan deployment frontend dan backend.
- Menyiapkan demo dan presentasi.

Pengembangan lanjutan dapat mencakup pencarian tugas, ekspor kalender `.ics`, cadangan data, dan sinkronisasi lintas perangkat.

## Referensi

- Repository: https://github.com/Adhi-dot/TugasIn
- Spesifikasi: `PRD-TugasIn.md`
- Pedoman kontribusi: `AGENTS.md`

Nama anggota, URL deployment, tautan pitch deck, dan proyek Stitch dapat ditambahkan setelah disepakati tim.
