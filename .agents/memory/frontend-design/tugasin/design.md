# Global Frontend Design Specification: TugasIn
**Project:** TugasIn  
**Tagline:** Dari chat jadi checklist  
**Target Module:** Dashboard  
**Aesthetic Direction:** Modern Editorial Academic (Light Mode Default, High Contrast, Anti-Slop)  
**Date:** 2026-10-21  

---

## 1. Design Philosophy & Aesthetic Blueprint

TugasIn dirancang dengan estetika akademik modern yang bersih, fungsional, dan menenangkan pikiran mahasiswa. Menghindari "AI Slop" umum seperti gradasi ungu-ke-pink murahan, shadow buram yang berlebihan, dan elemen dekoratif tanpa guna. Antarmuka mengutamakan keterbacaan data, kontras tinggi (WCAG AA/AAA), struktur visual berbasis hairline border presisi, serta hierarki tipografi yang tajam.

### 60-30-10 Color System
- **60% Canvas / Background:** Neutral Slate White (`#F8FAFC` canvas, `#FFFFFF` surface).
- **30% Structure & Contrast:** Hairline borders (`#E2E8F0` / `border-slate-200`), muted text (`#64748B`), and deep slate typography (`#0F172A`).
- **10% Brand & Semantic Accents:** 
  - Primary Brand & CTA: `#4F46E5` (Indigo 600) / Hover `#4338CA` (Indigo 700).
  - Status "Belum mulai": Neutral Slate `#F1F5F9` dengan teks `#475569`.
  - Status "Dikerjakan": Amber Tint `#FEF3C7` dengan teks `#B45309` & dot `#F59E0B`.
  - Status "Selesai": Emerald Tint `#ECFDF5` dengan teks `#047857` & icon `#10B981`.
  - Indikator "Terlambat": Rose Tint `#FFE4E6` dengan teks `#BE123C` & badge border `#FDA4AF`.

---

## 2. Design System Tokens

### CSS Custom Properties (`:root`)
```css
:root {
  /* Canvas & Surfaces */
  --color-canvas: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-surface-hover: #F1F5F9;
  --color-surface-subtle: #F8FAFC;

  /* Hairlines & Borders */
  --color-border: #E2E8F0;
  --color-border-subtle: #F1F5F9;
  --color-border-strong: #CBD5E1;

  /* Typography / Ink */
  --color-ink-primary: #0F172A;
  --color-ink-secondary: #475569;
  --color-ink-muted: #64748B;
  --color-ink-faint: #94A3B8;

  /* Brand Accent */
  --color-brand-primary: #4F46E5;
  --color-brand-hover: #4338CA;
  --color-brand-light: #EEF2FF;

  /* Semantic Urgency & Status */
  --color-status-not-started-bg: #F1F5F9;
  --color-status-not-started-text: #475569;

  --color-status-in-progress-bg: #FEF3C7;
  --color-status-in-progress-text: #92400E;

  --color-status-done-bg: #ECFDF5;
  --color-status-done-text: #065F46;

  --color-urgent-overdue-bg: #FFF1F2;
  --color-urgent-overdue-border: #FECDD3;
  --color-urgent-overdue-text: #BE123C;

  /* Geometry & Elevation */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-full: 9999px;
  --shadow-card: 0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05);
  --shadow-card-hover: 0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05);
}
```

---

## 3. Typography Rules

- **Font Family Utama:** `Plus Jakarta Sans`, system-ui, -apple-system, sans-serif.
- **Dilarang Font Acak:** Menggunakan satu font family tunggal untuk seluruh antarmuka. `font-mono` HANYA diizinkan jika menampilkan identifier ID internal, bukan untuk label umum atau tanggal.
- **Skala Tipografi:**
  - `H1 Brand / Page Title`: 24px (1.5rem), `font-bold`, `tracking-tight`, text slate-900.
  - `H2 Section Header`: 18px (1.125rem), `font-semibold`, text slate-900.
  - `H3 Card Title`: 16px (1rem), `font-semibold`, text slate-900, `line-height: 1.35`.
  - `Body Regular`: 14px (0.875rem), `font-normal`, text slate-600.
  - `Label / Badge / Caption`: 12px (0.75rem), `font-medium`, `tracking-normal`.

---

## 4. Component Visual Architecture

### A. Summary Stats Strip (Ringkasan Tugas)
- Dua kartu metrik berdampingan dengan border hairline `border-slate-200`:
  1. **Tugas Aktif:** Angka besar kontras (`text-2xl font-bold text-slate-900`), label teks *"Tugas aktif perlu diselesaikan"*, icon penanda netral/indigo.
  2. **Tugas Selesai:** Angka besar kontras (`text-2xl font-bold text-emerald-600`), label teks *"Tugas berhasil dituntaskan"*, icon checklist emerald.

### B. Segmented Status Filter Tabs
- Container abu-abu halus (`bg-slate-100 p-1 rounded-lg`) dengan tombol pill interaktif:
  - Tab aktif: `bg-white text-slate-900 shadow-sm font-semibold`.
  - Tab inaktif: `text-slate-600 hover:text-slate-900 hover:bg-slate-50`.
  - Badge counter pada setiap tab menampilkan jumlah tugas di status tersebut.

### C. Task Card Component (Kartu Tugas)
- Struktur layout kartu vertikal yang padat informasi namun lapang (*breathable*):
  - **Top Row:** Badge Mata Kuliah (kiri, latar slate-100 halus) + Badge Status (kanan, warna semantik: Belum mulai / Dikerjakan / Selesai).
  - **Title Row:** Judul tugas tebal, dapat dipotong rapi jika terlalu panjang (`line-clamp-2`), teks aman dari injeksi karakter.
  - **Middle Row:** Potongan deskripsi/ringkasan tugas singkat (opsional, jika ada).
  - **Bottom Row (Dual Telemetry):**
    - Sisi Kiri: Informasi Deadline dengan icon kalender/jam. Jika terlambat, dibungkus badge merah lembut *"Terlambat"*. Jika tanggal tanpa jam, tertulis *"Batas tanggal DD/MM/YYYY · jam tidak disebutkan"*. Jika tanpa tenggat, tertulis *"Belum ada deadline"*.
    - Sisi Kanan: Progres Checklist dengan mini progress-bar terkalibrasi dan label teks rasio `X/Y langkah (Z%)`.

### D. UI 4-State Matrix
1. **Loading State:** Shimmering skeleton cards dengan efek pulsa lembut (`animate-pulse bg-slate-200/70`) yang mempertahankan bentuk proporsional kartu tugas.
2. **Empty State — Belum Ada Tugas:**
   - Ilustrasi minimalis / icon dokumen tugas bersih.
   - Judul: *"Belum ada tugas yang dicatat"*.
   - Deskripsi: *"Tempel pengumuman tugas dari chat kelas atau tambahkan tugas baru secara manual."*
   - Tombol Aksi: *"Tambah dari pengumuman"* & *"Tambah manual"*.
3. **Empty State — Filter Kosong:**
   - Judul: *"Tidak ada tugas dengan status ini"*.
   - Deskripsi: *"Coba pilih status filter lain atau kembali ke tab Semua."*
   - Tombol Aksi: *"Tampilkan semua tugas"*.
4. **Error State:**
   - Banner penanganan error yang jelas dengan tombol aksi *"Muat Ulang"*.

---

## 5. Micro-interactions & A11y Standards

- **Keyboard Focus:** Semua tombol dan kartu interaktif memiliki ring fokus yang terlihat (`focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2`).
- **Target Sentuh Minimum:** Tombol dan kontrol interaktif minimal berukuran 44x44 px pada mode seluler (viewport 360px).
- **Zero Horizontal Scroll:** Seluruh layout responsif dan tidak memunculkan scroll horizontal pada lebar 360 px hingga monitor desktop 4K.
