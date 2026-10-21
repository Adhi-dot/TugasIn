# Global Design System Specification: TugasIn
**Project:** TugasIn — Otomasi Tugas Mahasiswa (“Dari chat jadi checklist”)  
**Project Slug:** `tugasin`  
**Aesthetic Direction:** *Academic Clarity & Minimalist Precision* (Light Mode Default)  
**Date:** 2026-10-21  
**Status:** PROPOSED FOR CHECKPOINT 1 REVIEW  

---

## 1. Overview & Creative North Star

### The Creative North Star: "Academic Clarity & Seamless Flow"
TugasIn dirancang untuk mahasiswa Indonesia yang kerap dibanjiri pengumuman tugas panjang dan berantakan di grup WhatsApp atau LMS. Desain antarmuka mengedepankan **kejernihan kognitif (*cognitive decluttering*)**:
- **Bebas dari AI-Slop:** Menghilangkan gradasi ungu-pink murahan, bayangan tebal buram (*muddy shadows*), dan tombol dengan panah tanpa fungsi.
- **Light Mode Default:** Kanvas putih bersih (`#FFFFFF`) dipadu latar `slate-50` (`#F8FAFC`), garis border hairline `slate-200` (`#E2E8F0`), dan tipografi tajam deep slate (`#0F172A`).
- **Sentuhan Aksen Emerald Productivity:** Aksen hijau zamrud/emerald (`#059669`) melambangkan penyelesaian tugas, checklist aktif, dan efisiensi akademis.

---

## 2. Design System Tokens

### A. 60-30-10 Color Rule
* **60% Latar & Kanvas (Neutral Base):**
  - `--color-canvas`: `#F8FAFC` (Slate-50) — Latar belakang aplikasi utama.
  - `--color-surface`: `#FFFFFF` (Pure White) — Kartu input, modal preview, dan kontainer utama.
  - `--color-surface-subtle`: `#F1F5F9` (Slate-100) — Container preview teks sumber pengumuman asli.
* **30% Struktur, Border & Tipografi (Structure & Ink):**
  - `--color-hairline`: `#E2E8F0` (Slate-200) — Garis pembatas 1px presisi.
  - `--color-hairline-strong`: `#CBD5E1` (Slate-300) — Border input saat hover/active.
  - `--color-ink`: `#0F172A` (Slate-900) — Judul utama dan teks primer dengan kontras tinggi (WCAG AAA).
  - `--color-ink-muted`: `#64748B` (Slate-500) — Label pendukung, keterangan, dan placeholder.
  - `--color-ink-subtle`: `#94A3B8` (Slate-400) — Timestamp, helper text, dan border non-aktif.
* **10% Aksen Brand & Status Semantik (Primary & Feedback):**
  - `--color-primary`: `#059669` (Emerald-600) — CTA utama (*“Ambil tugas”*, *“Simpan tugas”*).
  - `--color-primary-hover`: `#047857` (Emerald-700) — State hover tombol primer.
  - `--color-primary-light`: `#ECFDF5` (Emerald-50) — Background badge berhasil dan tag checklist.
  - `--color-warning`: `#D97706` (Amber-600) — Penanda deadline ambigu, perlu dilengkapi.
  - `--color-warning-light`: `#FFFBEB` (Amber-50) — Background alert box peringatan.
  - `--color-error`: `#DC2626` (Red-600) — Validasi error input melebihi 5.000 karakter, gagal jaringan.
  - `--color-error-light`: `#FEF2F2` (Red-50) — Background alert error.

### B. CSS Custom Properties (`:root`)
```css
:root {
  /* Surface & Canvas */
  --color-canvas: #f8fafc;
  --color-surface: #ffffff;
  --color-surface-subtle: #f1f5f9;

  /* Structure & Ink */
  --color-hairline: #e2e8f0;
  --color-hairline-strong: #cbd5e1;
  --color-ink: #0f172a;
  --color-ink-muted: #64748b;
  --color-ink-subtle: #94a3b8;

  /* Brand Accents */
  --color-primary: #059669;
  --color-primary-hover: #047857;
  --color-primary-light: #ecfdf5;
  --color-warning: #d97706;
  --color-warning-light: #fffbeb;
  --color-error: #dc2626;
  --color-error-light: #fef2f2;

  /* Elevation Shadows */
  --shadow-subtle: 0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05);
  --shadow-elevated: 0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05);
  --shadow-modal: 0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.08);

  /* Radius */
  --radius-sm: 0.375rem; /* 6px */
  --radius-md: 0.5rem;   /* 8px */
  --radius-lg: 0.75rem;  /* 12px */
  --radius-xl: 1rem;     /* 16px */
  --radius-full: 9999px;
}
```

### C. Tailwind Config Tokens
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        canvas: '#f8fafc',
        surface: {
          DEFAULT: '#ffffff',
          subtle: '#f1f5f9',
        },
        hairline: {
          DEFAULT: '#e2e8f0',
          strong: '#cbd5e1',
        },
        ink: {
          DEFAULT: '#0f172a',
          muted: '#64748b',
          subtle: '#94a3b8',
        },
        brand: {
          50: '#ecfdf5',
          600: '#059669',
          700: '#047857',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '0.75rem',
        input: '0.5rem',
      },
    },
  },
};
```

---

## 3. Tipografi & Skala Teks

* **Font Family Utama:** `Plus Jakarta Sans` (dengan fallback `Inter` dan sistem sans-serif).
* **Prinsip Tipografi:**
  - Font tunggal (*Single font pairing*) yang konsisten di seluruh antarmuka.
  - Dilarang memakai font monospace selain untuk preview data mentah teknis.
  - Hierarki diwujudkan melalui bobot (`font-medium`, `font-semibold`, `font-bold`) dan ukuran teks.

| Token | Ukuran | Weight | Line Height | Penggunaan |
| :--- | :--- | :--- | :--- | :--- |
| `text-display` | 32px (`2rem`) | Bold (`700`) | 1.2 | Hero headline utama aplikasi |
| `text-h1` | 24px (`1.5rem`) | SemiBold (`600`) | 1.3 | Judul modal preview, header halaman |
| `text-h2` | 18px (`1.125rem`) | SemiBold (`600`) | 1.4 | Judul section form, card header |
| `text-body` | 15px (`0.9375rem`)| Regular (`400`) | 1.5 | Teks isi pengumuman, input textarea |
| `text-label` | 13px (`0.8125rem`)| Medium (`500`) | 1.4 | Label form, counter karakter, tag status |
| `text-caption`| 12px (`0.75rem`) | Regular (`400`) | 1.4 | Keterangan privasi, error validation |

---

## 4. Visual & Imagery Architecture (Anti-Placeholder Framework)

Sesuai aturan AGENTS.md, **DILARANG** menggunakan kotak abu-abu placeholder atau div kosong.

### A. Hero Visual Concept (Screen 01 — Input)
* **Tipe Visual:** Split 2-Column Hero Photography via Google Imagen (`generate_image`).
* **Formula Prompt Imagen:**
  > *"A cheerful modern Indonesian university student sitting at a well-lit minimalist wooden desk in a clean contemporary study room, organizing assignments on a sleek laptop with a clean coffee cup and neat notebook nearby, warm soft natural morning window daylight, crisp depth of field, high-end editorial lifestyle photography, genuine expression, realistic colors."*
* **Aspect Ratio:** `3:2` atau `16:9` framed dengan `rounded-2xl border border-slate-200 shadow-sm`.
* **Fallback Strategy:** Shimmering skeleton loader saat pemuatan awal dengan SVG silhouette illustration.

### B. Bespoke Parametric SVGs
* **Gemini Extraction Pulse Badge:** Animasi halus lingkaran berdenyut hijau zamrud yang menandakan AI sedang menganalisis struktur pengumuman.
* **Evidence Highlight Indicator:** Ikon penanda kutipan (*quote badge*) yang menandakan bukti teks asli dari pengumuman.
* **Verified Extraction Shield:** Segel verifikasi bersih bergaris ganda yang menandakan data telah tervalidasi secara semantik.

---

## 5. Blueprint Komponen Inti

### Komponen 1: Announcement Input Form (`screen-01-input`)
* **Textarea:**
  - Latar putih dengan border hairline `border-slate-200`, transisi halus ke `focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100`.
  - Placeholder: *"Tempel pengumuman tugas dari WhatsApp atau LMS di sini... Contoh: Untuk mata kuliah UI/UX, buat wireframe aplikasi perpustakaan. Kumpulkan PDF pada 21 Oktober 2026 pukul 23.59 WIB."*
* **Status Bar Bawah Input:**
  - Kiri: Keterangan aman *"Teks pengumuman dikirim ke Gemini untuk diproses."* dengan ikon gembok/keamanan privasi mini.
  - Kanan: Indikator live counter `0 / 5.000 karakter`. Berubah warna menjadi merah amber jika `> 4.500` dan merah tegas jika `> 5.000`.
* **Field Konteks Tambahan:**
  - Input Tanggal Pesan Asal: Date input rapi dengan placeholder *"Tanggal pesan (opsional)"*.
  - Selector Zona Waktu: Dropdown ringkas (*"WIB (Asia/Jakarta)"*, *"WITA"*, *"WIT"*, dsb).
* **Tombol Aksi:**
  - Tombol Primer: *“Ambil tugas”* (`bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-3 rounded-lg shadow-sm`). Nonaktif (`bg-slate-200 text-slate-400 cursor-not-allowed`) jika textarea kosong.
  - Tombol Sekunder: *“Tambah manual”* (`border border-slate-200 hover:bg-slate-50 text-slate-700`).

### Komponen 2: Task Extraction Preview Modal / Screen (`screen-02-preview`)
* **Split Layout 2-Kolom:**
  - **Sisi Kiri (Teks Asli Pengumuman):**
    - Container berlatar `bg-slate-50 border border-slate-200 rounded-xl p-5`.
    - Header: *"Teks Pengumuman Asli"* dengan tombol salin teks.
    - Isi teks dirender dengan format font jelas dan aman anti-XSS (`whitespace-pre-wrap text-slate-700`).
  - **Sisi Kanan (Form Koreksi Draft):**
    - Field Judul: Input teks berlabel *"Judul Tugas (Wajib)"*. Jika kosong setelah koreksi, muncul peringatan merah tepat di bawah field.
    - Field Mata Kuliah: Input teks *"Mata Kuliah (Opsional)"*.
    - Field Deadline: Grid 2 kolom berisi *Tanggal* dan *Jam*. Jika tanggal tidak ada di sumber, tampilkan badge oranye *"Perlu dilengkapi"*. Jika jam tidak ada di sumber, jangan diisi 23:59, biarkan kosong dengan keterangan *"Jam tidak disebutkan"*.
    - Field Ketentuan Tugas: Chips tag yang dapat ditambah atau dihapus oleh pengguna.
* **Baris Bawah (Action Bar):**
  - Tombol *“Batal”*: Menutup preview tanpa menyimpan apapun.
  - Tombol *“Simpan tugas”*: Menyimpan tugas tervalidasi ke sistem dan kembali ke dashboard.

---

## 6. UI 4-State Specifications

1. **Loading State:**
   - Skeleton shimmer bergradasi lembut (`bg-slate-100` ke `bg-slate-200/60`).
   - Teks informatif: *“Sedang mengekstrak detail tugas dari pengumuman...”* dengan waktu tunggu toleran hingga 30 detik.
2. **Error State:**
   - Alert banner berlatar `bg-red-50 border border-red-200 text-red-800 rounded-xl p-4`.
   - Pesan ramah yang membedakan kegagalan: kuota/layanan sibuk, batas waktu 30 detik tercapai, atau koneksi terputus.
   - Tombol aksi jelas: *“Coba lagi”* dan *“Gunakan tambah manual”*. Teks input tidak pernah dihapus saat error.
3. **Empty / Special State:**
   - `no_task`: Alert banner oranye lembut *“Tidak ada tugas yang terdeteksi dalam pengumuman ini. Silakan periksa kembali teks yang ditempel atau gunakan Tambah Manual.”*
   - `multiple_tasks`: Alert banner biru informatif *“Teks ini memuat lebih dari satu pengumuman tugas. Mohon tempelkan satu per satu agar pencatatan tugas akurat.”*
4. **Success State:**
   - Membuka preview komparasi 2-kolom dengan transisi fade-in halus (`duration-200 ease-out`).
