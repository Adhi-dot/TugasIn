# Global Frontend Design Specification: TugasIn
**Project:** TugasIn  
**Tagline:** Dari chat jadi checklist  
**Target Modules:** Dashboard, Input Pengumuman & Preview Hasil Ekstraksi  
**Aesthetic Direction:** Modern Editorial Academic (Light Mode Default, High Contrast, Anti-Slop)  
**Date:** 2026-10-21  

---

## 1. Design Philosophy & Aesthetic Blueprint

TugasIn dirancang dengan estetika akademik modern yang bersih, fungsional, dan menenangkan pikiran mahasiswa. Menghindari "AI Slop" umum seperti gradasi ungu-ke-pink murahan, shadow buram yang berlebihan, dan elemen dekoratif tanpa guna. Antarmuka mengutamakan keterbacaan data, kontras tinggi (WCAG AA/AAA), struktur visual berbasis hairline border presisi, serta hierarki tipografi yang tajam.

### 60-30-10 Color System
- **60% Canvas / Background:** Neutral Slate White (`#F8FAFC` canvas, `#FFFFFF` surface).
- **30% Structure & Contrast:** Hairline borders (`#E2E8F0` / `border-slate-200`), muted text (`#64748B`), and deep slate typography (`#0F172A`).
- **10% Brand & Semantic Accents:** 
  - Primary Brand & CTA: `#4F46E5` (Indigo 600) / Hover `#4338CA` (Indigo 700) & `#059669` (Emerald 600) untuk aksi simpan & verifikasi.
  - Status "Belum mulai": Neutral Slate `#F1F5F9` dengan teks `#475569`.
  - Status "Dikerjakan": Amber Tint `#FEF3C7` dengan teks `#B45309` & dot `#F59E0B`.
  - Status "Selesai": Emerald Tint `#ECFDF5` dengan teks `#047857` & icon `#10B981`.
  - Indikator "Terlambat": Rose Tint `#FFE4E6` dengan teks `#BE123C` & badge border `#FDA4AF`.

---

## 2. Design System Tokens (`:root`)

```css
:root {
  /* Canvas & Surfaces */
  --color-canvas: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-surface-hover: #F1F5F9;
  --color-surface-subtle: #F8FAFC;

  /* Hairlines & Borders */
  --color-border: #E2E8F0;
  --color-hairline: #E2E8F0;
  --color-border-subtle: #F1F5F9;
  --color-border-strong: #CBD5E1;

  /* Typography / Ink */
  --color-ink: #0F172A;
  --color-ink-primary: #0F172A;
  --color-ink-secondary: #475569;
  --color-ink-muted: #64748B;
  --color-ink-subtle: #94A3B8;
  --color-ink-faint: #94A3B8;

  /* Brand Accents */
  --color-brand-primary: #4F46E5;
  --color-brand-hover: #4338CA;
  --color-brand-light: #EEF2FF;
  --color-primary: #059669;
  --color-primary-hover: #047857;
  --color-primary-light: #ECFDF5;

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

- **Font Family Utama:** `Plus Jakarta Sans`, `Inter`, system-ui, -apple-system, sans-serif.
- **Skala Tipografi:**
  - `H1 Brand / Page Title`: 24px (1.5rem), `font-bold`, `tracking-tight`, text slate-900.
  - `H2 Section Header`: 18px (1.125rem), `font-semibold`, text slate-900.
  - `H3 Card Title`: 16px (1rem), `font-semibold`, text slate-900, `line-height: 1.35`.
  - `Body Regular`: 14px (0.875rem), `font-normal`, text slate-600.
  - `Label / Badge / Caption`: 12px (0.75rem), `font-medium`, `tracking-normal`.

---

## 4. Component Visual Architecture

### A. Dashboard Components
1. **Summary Stats Strip:** Kartu metrik kembar (Tugas Aktif & Tugas Selesai) dengan kontras tinggi.
2. **Segmented Status Filter Tabs:** Tab pill interaktif (Semua, Belum mulai, Dikerjakan, Selesai) dengan counter dinamis.
3. **Task Card:** Kartu vertikal dengan badge mata kuliah, status semantik, judul tebal, deadline dengan sorotan status, dan mini progress-bar checklist.

### B. Input & Preview Components
1. **Announcement Input Form:** Textarea dengan border hairline, live character counter (maks 5.000), date input tanggal asal, selector timezone, dan tombol primer "Ambil tugas".
2. **Task Extraction Preview Modal:** Dual-column workspace. Sisi kiri menampilkan teks pengumuman asli dengan copy button; sisi kanan menyediakan form koreksi terstruktur dengan validasi judul & deadline, badge "Perlu Dilengkapi" untuk data ambigu, serta tombol "Simpan tugas".
3. **Hero Photography & Visuals:** Foto realistis mahasiswa Indonesia via Google Imagen di `public/assets/images/hero-student-study.jpg`.

---

## 5. UI 4-State Matrix & Micro-interactions
1. **Loading State:** Shimmering skeleton cards (`animate-pulse bg-slate-200/70`) yang mempertahankan bentuk proporsional.
2. **Empty State:** Desain ramah saat data kosong dengan CTA jelas ("Tambah dari pengumuman" & "Tambah manual").
3. **Error State:** Alert banner penanganan error dengan aksi "Coba lagi" dan input teks aman tidak terhapus.
4. **Success State:** Feedback banner hijau zamrud dan transisi kartu rapi.
