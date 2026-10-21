# Global Frontend Design Specification: TugasIn (Dashboard & Checklist AI)

**Project:** TugasIn  
**Tagline:** Dari chat jadi checklist  
**Modules:** Dashboard & Checklist AI  
**Aesthetic Direction:** Modern Editorial Academic (Light Mode Default, High Contrast, Anti-Slop)  
**Date:** 2026-10-21  
**Target Viewport:** Responsive down to 360px mobile up to 1440px+ desktop.  

---

## 1. Design Philosophy & Aesthetic Blueprint

TugasIn dirancang dengan estetika akademik modern yang bersih, fungsional, dan menenangkan pikiran mahasiswa ("Academic Clarity & Kinetic Productivity"). Menghindari "AI Slop" seperti gradasi murahan atau elemen dekoratif tanpa guna. Antarmuka mengutamakan keterbacaan data, kontras tinggi (WCAG AA/AAA), struktur visual berbasis hairline border presisi, serta hierarki tipografi tajam.

### 60-30-10 Color System
- **60% Canvas / Background:** Neutral Slate White (`#F8FAFC` canvas, `#FFFFFF` surface).
- **30% Structure & Contrast:** Hairline borders (`#E2E8F0` / `border-slate-200`), muted text (`#64748B`), and deep slate typography (`#0F172A`).
- **10% Brand & Semantic Accents:** 
  - Primary Brand & CTA: `#4F46E5` (Indigo 600) / Hover `#4338CA` (Indigo 700).
  - Status "Belum mulai": Neutral Slate `#F1F5F9` dengan teks `#475569`.
  - Status "Dikerjakan": Amber Tint `#FEF3C7` dengan teks `#B45309` & dot `#F59E0B`.
  - Status "Selesai": Emerald Tint `#ECFDF5` dengan teks `#047857` & icon `#10B981`.
  - Indikator "Terlambat": Rose Tint `#FFE4E6` dengan teks `#BE123C` & badge border `#FDA4AF`.
  - Aksen AI (Saran AI): Blue Tint `#EFF6FF` dengan teks `#1D4ED8` & border `#BFDBFE`.

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

  /* AI Accent */
  --color-accent: #2563EB;
  --color-accent-hover: #1D4ED8;
  --color-accent-soft: #EFF6FF;
  --color-accent-ink: #1D4ED8;

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
- **Skala Tipografi:**
  - `H1 Brand / Page Title`: 24px (1.5rem), `font-bold`, `tracking-tight`, text slate-900.
  - `H2 Section Header`: 18px (1.125rem), `font-semibold`, text slate-900.
  - `H3 Card Title`: 16px (1rem), `font-semibold`, text slate-900, `line-height: 1.35`.
  - `Body Regular`: 14px (0.875rem), `font-normal`, text slate-600.
  - `Label / Badge / Caption`: 12px (0.75rem), `font-medium`, `tracking-normal`.

---

## 4. Component Visual Architecture

### A. Dashboard Components
1. **Summary Stats Strip:**
   - Kartu metrik kembar: Tugas Aktif (`not_started` + `in_progress`) dan Tugas Selesai (`done`).
2. **Segmented Status Filter Tabs:**
   - Filter pill: Semua, Belum mulai, Dikerjakan, Selesai (masing-masing dengan counter badge).
3. **Task Card Component:**
   - Header: Course badge & Status badge semantik.
   - Body: Judul tugas tebal & potongan deskripsi.
   - Footer: Indikator deadline (overdue badge, atau tanggal tanpa jam) dan checklist progress ratio.

### B. Checklist AI Components (Detail Tugas)
1. **Header & Badge Saran AI:**
   - Pill terkurasi `bg-blue-50 border-blue-200 text-blue-700` dengan ikon `Sparkles` untuk memisahkan saran AI dari ketentuan resmi dosen.
2. **Interactive Checklist Items:**
   - Custom rounded checkbox dengan ikon check emerald saat tercentang.
   - Strikethrough lembut pada langkah yang selesai.
   - Inline editor untuk mengoreksi teks langkah (maksimal 200 karakter).
3. **Telemetry Progress Bar:**
   - Bar progress horizontal dengan transisi lebar CSS halus dan label pecahan (`X dari Y selesai · Z%`).
4. **Regenerate Confirmation Guard:**
   - Modal konfirmasi protektif sebelum pembuatan ulang checklist agar data dan progres aktif tidak hilang secara sengaja.

### C. 4-State UI Matrix (Dashboard & Checklist)
1. **Loading State:** Shimmering skeleton cards dengan efek pulsa lembut (`animate-pulse`).
2. **Empty State:**
   - Dashboard: Ilustrasi dokumen bersih dengan CTA tambah dari pengumuman / tambah manual.
   - Checklist: Empty card dengan tombol `[Sparkles] Buat langkah pengerjaan`.
3. **Error State:** Banner penanganan error bahasa Indonesia ramah pengguna dengan tombol `Coba Lagi` (retryable).
4. **Success State:** Tampilan antarmuka lengkap dengan interaktivitas responsif.

---

## 5. Micro-interactions & A11y Standards

- **Keyboard Focus:** Semua tombol, kartu, dan checkbox memiliki ring fokus yang terlihat (`focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2`).
- **Target Sentuh Minimum:** Kontrol interaktif minimal 44x44 px pada mode seluler (viewport 360px).
- **Zero Division Guard:** Kalkulasi progres selalu terlindungi dari pembagian nol (`total > 0 ? Math.round((completed / total) * 100) : 0`).
- **Zero Horizontal Scroll:** Seluruh layout responsif dan tidak memunculkan scroll horizontal pada 360 px hingga monitor desktop 4K.
