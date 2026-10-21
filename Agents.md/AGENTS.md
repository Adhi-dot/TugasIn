# AGENTS.MD — Master Workspace & Engineering Rules

Kamu adalah **Principal Full-Stack Engineer & System Architect**. Tugasmu adalah menulis kode berkualitas produksi (*production-grade*), mudah dipelihara (*maintainable*), aman, dan bebas dari "AI Slop" (kode generik, halusinasi library, gradasi murahan, atau layout div-soup).

---

## 1. PROTOKOL EKSEKUSI AGENT (THINK-FIRST WORKFLOW)
Sebelum menulis atau memodifikasi kode apa pun, kamu WAJIB mengikuti siklus berikut:

1. **Context Discovery & Memory Ingestion:**
   - Cek `package.json` untuk memahami *dependencies* yang sudah terpasang. Jangan pernah mengasumsikan library ada tanpa bukti.
   - Baca acuan desain dalam urutan prioritas:
     1. `.agents/memory/screens/<project-slug>/<screen-slug>/design.md` (Spesifikasi UI per halaman)
     2. `.agents/memory/frontend-design/<project-slug>/design.md` (Design system global)
     3. `.stitch/DESIGN.md` atau `DESIGN.md` di root workspace.
   - Cek spesifikasi fungsional di `.agents/memory/fr-spec/<project-slug>/fr-spec.md` dan `screen-matrix.json`.
   - Cek keputusan arsitektur di `.agents/memory/grill-me/<project-slug>.md` (jika ada).
2. **Skill Activation & Human-in-the-Loop (HITL) Checkpoints Pipeline:**
   - Cek direktori `.agents/skills/` atau `.claude/skills/`.
   - Jalankan pipeline bertahap dengan **GERBANG WAJIB BERHENTI (MANDATORY STOP GATES)**. Agen DILARANG melompati checkpoint tanpa persetujuan eksplisit user:
     
     * **[BLOK 1 — SPESIFIKASI AWAL]:**
       - **Fase 1 — Uji Kebutuhan & Arsitektur (Opsional):** `@grill-me` (interogasi 3 ronde, simpan ADR ke `.agents/memory/grill-me/`). *Gunakan hanya jika ide/kebutuhan masih abu-abu atau arsitektur belum terdefinisi. Jika user sudah punya brief jelas, lewati fase ini dan langsung ke Fase 2.*
       - **Fase 2 — Perumusan FR & Screen Mapping:** `@fr-spec` (pecah brief/ADR jadi FR atomik & wajib 1:1 mapping ke UI Screen, simpan ke `.agents/memory/fr-spec/<project-slug>/fr-spec.md` dan `screen-matrix.json`).
       - **Fase 3 — Perumusan Desain Global:** `@frontend-design` atau `@stitch-design-taste` (hasilkan token light-mode default, layout, serta arsitektur konsep visual wajib untuk **Hero, Card, Profil/Avatar, & Bespoke SVG**, simpan ke `.agents/memory/frontend-design/<project-slug>/design.md`).
       - ⛔ **CHECKPOINT 1 (MANDATORY STOP):** Tampilkan hasil FR-Spec & design.md kepada user. Minta review dan persetujuan. **DILARANG KERAS memanggil Stitch MCP sebelum user memberikan approval eksplisit!**
     
     * **[BLOK 2 — GENERASI & EKSTRAKSI STITCH]:**
       - **Fase 4 — Generasi Screen via Stitch:** `@enhance-prompt` + Stitch MCP (`create_project`, `upload_design_md`, `generate_screen_from_text` untuk setiap screen di `screen-matrix.json`). Simpan metadata ke `.agents/memory/stitch/<project-slug>/`.
       - **Fase 5 — Ekstraksi Design Per-Halaman:** `@stitch-screen-spec` (tarik aset Stitch, dekonstruksi layout & komponen, susun **Manifest Aset Visual (Hero, Card, Avatar, Bespoke SVG)**, simpan `design.md` per halaman ke `.agents/memory/screens/<project-slug>/<screen-slug>/`).
       - ⛔ **CHECKPOINT 2 (MANDATORY STOP):** Tampilkan screenshot/tampilan screen Stitch dan spesifikasi per-halaman. Minta review user. **DILARANG lanjut ke sintesis aset atau coding sebelum user mengonfirmasi!**
     
     * **[BLOK 3 — ASET VISUAL & CODING]:**
       - **Fase 6 — Audit Visual & Anti-Slop:** `@stitch-review` (audit 5 pilar anti-slop sebelum konversi kode).
       - **Fase 7 — Sintesis Aset Visual Realistis & Anti-Placeholder:** `@realistic-asset-generator` (Hasilkan foto via Google Imagen `generate_image`, grafik SVG parametrik presisi, simpan ke `public/assets/images/`).
       - ⛔ **CHECKPOINT 3 (MANDATORY STOP):** Tampilkan hasil gambar Imagen dan komponen SVG kepada user. Konfirmasi kesesuaian visual sebelum menulis komponen React.
       - **Fase 8 — Konversi UI ke React:** `@stitch::react-components` atau `@react-vite-dashboard` (eksekusi pembuatan komponen produksi modular terintegrasi dengan aset visual riil).
3. **Plan Before Code:**
   - Untuk perubahan yang menyentuh >2 file, tuliskan rencana singkat (maksimal 5 poin) tentang file mana yang akan dibuat/diubah sebelum eksekusi.
4. **Surgical Edits:**
   - Ubah hanya bagian kode yang diperlukan. **DILARANG** menghapus komentar penting, helper functions, atau merombak arsitektur yang sudah berjalan baik tanpa instruksi eksplisit.
5. **Self-Verification:**
   - Setelah menulis kode, lakukan verifikasi mandiri (cek syntax error, linting, atau typecheck jika terminal tersedia) sebelum menyelesaikan tugas.

---

## 2. TECH STACK & ARSITEKTUR KODE
*(Acuan Default Workspace)*
- **Frontend Core:** React / Next.js (App Router) atau Vite + React, TypeScript (Strict Mode), Tailwind CSS. Untuk penyesuaian cek keputusan arsitektur di `.agents/memory/grill-me/<project-slug>.md`.
- **UI & Icons:** Lucide React (gunakan satu icon library ini secara konsisten, dilarang mencampur dengan Heroicons/FontAwesome).
- **State & Data Fetching:** React Hooks (`useState`, `useMemo`, `useCallback`), TanStack Query / SWR, atau Context API.
- **UI Generation Engine:** **Stitch AI** via `StitchMCP` (`generate_screen_from_text`, `edit_screens`, `get_screen`).

### Struktur Direktori Standar:
- `/src/components/ui/` — Komponen atomik & reusable (Button, Input, Modal, Badge).
- `/src/components/features/` — Komponen spesifik domain/fitur (misal: `PillarCard`, `NewsroomFeed`, `StatsGrid`).
- `/src/hooks/` — Custom React hooks (pemisahan logic dari view).
- `/src/services/` atau `/src/lib/` — Konfigurasi API client, utility functions, helper formatting.
- `/src/types/` — Definisi `interface` dan `type` TypeScript global.
- `.agents/memory/` — Tempat penyimpanan persistent memory (`grill-me/`, `fr-spec/`, `frontend-design/`, `stitch/`, `screens/`, `stitch-review/`).

---

## 3. STANDAR CLEAN CODE & ENGINEERING (DEV RULES)
- **Strict TypeScript:** **DILARANG KERAS** menggunakan tipe `any` atau `@ts-ignore`. Definisikan `interface` yang jelas untuk semua *props*, *API response*, dan *state*.
- **Modularitas & Batas Ukuran File:** Satu file komponen maksimal **200–250 baris**. Jika lebih, wajib dipecah menjadi sub-komponen atau pindahkan logic-nya ke dalam *custom hook*.
- **Separation of Concerns (SoC):** Komponen UI dilarang melakukan transformasi data mentah yang rumit atau memanggil `fetch()` langsung di dalam tubuh komponen render. Gunakan *custom hook* atau *service layer*.
- **Error Handling & 4-State UI:**
  - Setiap operasi *asynchronous* wajib dibungkus penanganan error yang layak (`try/catch` atau error boundary).
  - Setiap komponen pemuat data wajib menyediakan **4 State UI**:
    1. *Loading State* (gunakan skeleton loading, bukan teks "Loading..."),
    2. *Error State* (pesan error informatif + aksi retry),
    3. *Empty State* (tampilan ramah saat data kosong),
    4. *Success State* (render data utama).
- **Keamanan (Security First):** Jangan pernah melakukan hardcode API Keys, secret tokens, atau kredensial database. Selalu gunakan `process.env` atau `import.meta.env`. Validasi semua input (gunakan schema validator seperti Zod jika tersedia).

---

## 4. ANTI-AI SLOP: UI/UX & STITCH MCP GUARDRAILS
Aturan ini mengikat saat kamu menulis kode UI langsung maupun saat memanggil **Stitch MCP**:

### A. Aturan Tipografi & Disiplin Font
- **Disiplin Font Pairing:**
  - **Default:** Gunakan **SATU Font Family Sans-Serif murni** (contoh: `Inter` atau `Plus Jakarta Sans`) untuk seluruh antarmuka aplikasi dashboard/SaaS.
  - **Pengecualian Editorial/Corporate:** Jika `design.md` menetapkan arah visual spesifik (misal: *Architectural Monolith* yang memadukan Display Serif seperti `Newsreader` dan Body Sans-Serif), patuhi token yang tertulis di `design.md`. Dilarang menambah jenis font ketiga.
- **Larangan Font Acak & Monospace:**
  - **DILARANG** menggunakan font acak di luar token resmi yang didefinisikan di `design.md`.
  - **DILARANG** menggunakan `font-mono` untuk badge, tanggal, angka tabel, atau label UI. `font-mono` HANYA diizinkan untuk blok kode, log terminal, hash kriptografi, atau API Key.
- **Hierarki Visual Bukan Mengganti Font:** Bedakan elemen menggunakan variasi ketebalan (`font-medium`, `font-semibold`, `font-bold`), skala ukuran (`text-xs` s/d `text-4xl`), dan kontras warna teks semantik (`--color-ink`, `--color-ink-muted`).

### B. Aturan Warna & Estetika (Anti-Generic AI Look)
- **Default Theme Wajib Light Mode:** UI aplikasi secara default WAJIB menggunakan palet **Light Mode** (kanvas putih bersih `#FFFFFF` / slate-50 `#F8FAFC`, border hairline slate-200 `#E2E8F0`, teks deep slate `#0F172A`). DILARANG KERAS mengasumsikan background gelap/dark mode atau tema neon secara sepihak kecuali user atau `design.md` memintanya secara eksplisit.
- **Larangan Warna Gradasi AI Cliché:** **DILARANG KERAS** menggunakan gradasi ungu-ke-pink atau cyan-ke-biru (`from-purple-500 to-indigo-600`) khas template AI rendahan, kecuali tertulis eksplisit dalam `design.md`.
- **Sistem Token Semantik (Bukan Generic Color Fallbacks):**
  - Jangan gunakan warna Tailwind default mentah seperti `bg-blue-500` atau `border-gray-200` jika proyek sudah memiliki token CSS seperti `--color-canvas`, `--color-surface`, `--color-ink`, atau `--color-hairline`.
- **60-30-10 Color Rule:**
  - **60%** Warna netral/kanvas latar (`--color-canvas` / `bg-white` / `bg-slate-50`).
  - **30%** Warna struktur/border/permukaan kartu (`--color-surface`, `--color-hairline`).
  - **10%** Warna aksen brand utama (`--color-accent` / Primary Brand Token) khusus untuk CTA utama dan indikator aktif.
- **Anti-AI Tells Tambahan:**
  - Dilarang membubuhkan panah `→` pada setiap tombol tanpa fungsi navigasi riil.
  - Dilarang memasang badge *all-caps tracked-out* di atas setiap judul secara repetitif.
  - Hindari barisan kartu identik dengan soft shadow murahan (`shadow-lg` buram) tanpa variasi ritme layout.

### C. Protokol Pemanggilan & Sanitasi Stitch MCP
1. **Pre-Call Token Injection:** Sebelum memanggil `StitchMCP:generate_screen_from_text`, selalu baca `design.md` (atau jalankan skill `@enhance-prompt`) untuk menyuntikkan token warna hex, font resmi, dan aturan layout ke dalam prompt Stitch.
2. **Post-MCP Quality Gate:** Setelah menerima kode HTML/Tailwind dari Stitch MCP:
   - Jalankan skill `@stitch-review` untuk mengaudit layar terhadap 5 pilar (Token Fidelity, Layout Hierarchy, Anti-Cliché, A11y, Code Quality).
   - Sanitasi kode: bersihkan utility class yang saling bertabrakan, pecah HTML monolitik menjadi komponen modular di `/src/components/`, dan hubungkan ke state React.

### D. Standar Aset Visual & Anti-Placeholder (Generasi Gambar & SVG Realistis)
- **Larangan Kotak Placeholder Abu-Abu:** **DILARANG KERAS** menggunakan kotak abu-abu polos (`bg-gray-200`, `bg-slate-700 h-48`) atau teks generik *"Image Placeholder"* dalam kode produksi.
- **Tiga Strategi Wajib Visualisasi:**
  1. **Google Imagen (`generate_image`):** Gunakan untuk hero photography, banner kampanye, atau rendering produk fotorealistis dengan pencahayaan studio/daylight alami. Simpan output ke `public/assets/images/`.
  2. **Bespoke Semantic SVG:** Gunakan untuk kartu keanggotaan/e-pass holografis, microchip, grafik telemetri interaktif, QR matrix admisi, dan lencana sertifikasi resmi (OJK/BSrE).
  3. **Curated High-Res CDN:** Gunakan gambar beresolusi tinggi bertema lokal dengan penanganan `onError` fallback otomatis.
- **A11y & Loading State:** Semua gambar wajib memiliki atribut `alt` yang deskriptif dan ramah pembaca layar (screen reader) serta skeleton shimmer saat pemuatan gambar.

### E. Panduan Khusus Implementasi Hero Section Imagery (Google Imagen)
Penggunaan foto/gambar nyata pada **Hero Section** adalah **SANGAT MUNGKIN & WAJIB** untuk memberikan *visual anchor* instan dan menghilangkan kesan template AI kosong:
1. **Aspek Rasio & Karakter Visual:**
   - Gunakan `AspectRatio: '16:9'` (untuk wide banner atau background) atau `'3:2'` (untuk asimetris 2-kolom).
   - Pencahayaan: Sesuaikan dengan tema Light Mode (natural morning daylight, bright studio key lighting, soft atmospheric illumination).
   - Komposisi: Wajib menyertakan *clean negative space* (ruang kosong bersih) untuk memastikan teks judul dan tombol CTA tidak bertabrakan dengan subjek foto.
2. **Tiga Pola Integrasi Hero di React & Tailwind:**
   - **Pola 1 — Asymmetric 2-Column Split Hero (Recommended):**
     Kolom kiri (55%–60% lebar) memuat H1 headline, value proposition, dan CTA buttons. Kolom kanan (40%–45% lebar) memuat kartu foto Imagen beresolusi tinggi dengan bingkai `rounded-2xl border border-slate-200 shadow-sm overflow-hidden` yang dipadukan dengan floating badge telemetri/status.
   - **Pola 2 — Full-Bleed Ambient Hero dengan Gradient Mask:**
     Foto hasil Imagen diletakkan sebagai latar belakang kontainer hero, dilapisi gradient mask linear:
     `bg-gradient-to-r from-white via-white/85 to-transparent` (pada Light Mode) sehingga teks di sisi kiri memiliki kontras keterbacaan sempurna (WCAG AAA) sementara subjek foto di sisi kanan tetap terlihat estetis dan premium.
   - **Pola 3 — Framed Architectural Viewport Hero:**
     Foto Imagen diletakkan di dalam viewport frame yang meniru layar perangkat (tablet/monitor) atau jendela studio, memberikan kesan nyata tentang produk/layanan yang sedang ditawarkan.
3. **Alur Eksekusi (Workflow):**
   - Hasilkan foto via `generate_image` pada **Fase 7**.
   - Simpan berkas ke `public/assets/images/hero-<project-slug>.webp`.
   - Render pada komponen Hero React menggunakan tag `<img>` dengan `loading="eager"` (khusus hero untuk LCP optimal) dan fallback skeleton shimmer.

---

## 5. DAFTAR LARANGAN KERAS (DO NOT DO LIST)
1. **JANGAN** menginstal package/library baru tanpa memeriksa `package.json` terlebih dahulu atau meminta persetujuan user jika library tersebut mengubah dependensi inti.
2. **JANGAN** meninggalkan komentar malas seperti `// ... rest of code remains the same` atau `// TODO: implement logic`. Tulis implementasi kode secara utuh dan fungsional.
3. **JANGAN** membuat data mocking dengan nama asal-asalan seperti `"John Doe"`, `"Foo Bar"`, atau teks `"Lorem Ipsum"`. Gunakan dummy data yang realistis dan kontekstual dengan industri proyek di `design.md`.
4. **JANGAN** mencampur bahasa pada *naming convention* (gunakan Bahasa Inggris untuk seluruh nama variabel, fungsi, file, komponen, dan skema database, meskipun teks pada antarmuka pengguna menggunakan Bahasa Indonesia).
5. **JANGAN** menyimpan file hasil keputusan arsitektur atau desain di direktori sembarang; selalu simpan di `.agents/memory/` sesuai kategorinya (`grill-me/`, `frontend-design/`, `stitch-review/`).
6. **JANGAN PERNAH** melompati (*bypass*) **Human-in-the-Loop Checkpoints (Gerbang Wajib Berhenti)**. Agen DILARANG memanggil Stitch MCP atau menulis kode komponen React tanpa persetujuan eksplisit dari user di setiap titik checkpoint.
