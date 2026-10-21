# Design Specification (design.md) — TugasIn Frontend & Checklist AI

**Project:** TugasIn  
**Tagline:** Dari chat jadi checklist.  
**Design Direction:** *Academic Clarity & Kinetic Productivity (Light Mode)*  
**Date:** 2026-10-21  
**Target Viewport:** Responsive down to 360px mobile up to 1440px+ desktop.  

---

## 1. Design Philosophy & Aesthetic Foundation

TugasIn dirancang dengan filosofi **Academic Clarity & Purposeful Speed**. Sebagai alat bantu mahasiswa yang menerima tugas kuliah padat dan terburu-buru, antarmuka tidak boleh membebani mata dengan ornamen artifisial, gradasi neon generik, atau tata letak berantakan.

* **Light Mode Default**: Mengutamakan kanvas terang bersih (`#F8FAFC` slate-50) dengan kartu putih murni (`#FFFFFF`) dan batas hairline yang presisi (`#E2E8F0` slate-200).
* **60-30-10 Rule**:
  - **60% Kanvas & Netral**: Latar belakang slate-50 dan area kartu putih.
  - **30% Struktur & Kontras Teks**: Border hairline slate-200, kartu sekunder slate-100, teks deep slate `#0F172A` dan muted `#64748B`.
  - **10% Aksen Brand Semantik**: Indigo Blue `#3B82F6` / `#2563EB` untuk CTA utama, progress fill aktif, dan highlight "Saran AI" terarah.
* **Tipografi Sans-Serif Tunggal**: Menggunakan **Plus Jakarta Sans** secara konsisten di seluruh elemen (heading, body, tombol, status). Hirarki dibentuk melalui bobot (`font-medium`, `font-semibold`, `font-bold`) dan kontras warna, bukan mencampur jenis font.

---

## 2. Design System Tokens (CSS & Tailwind)

### A. Semantic Color Palette

| Token Name | CSS Custom Property | Tailwind Equivalent | Role & Context |
|---|---|---|---|
| Canvas Background | `--color-canvas` | `bg-slate-50` (`#F8FAFC`) | Latar utama aplikasi |
| Surface Card | `--color-surface` | `bg-white` (`#FFFFFF`) | Kontainer kartu detail tugas & checklist |
| Surface Subdued | `--color-surface-subdued` | `bg-slate-100` (`#F1F5F9`) | Background item checklist & skeleton |
| Hairline Border | `--color-hairline` | `border-slate-200` (`#E2E8F0`) | Pemisah struktural 1px halus |
| Hairline Strong | `--color-hairline-strong` | `border-slate-300` (`#CBD5E1`) | Border input fokus & checkbox aktif |
| Ink Primary | `--color-ink` | `text-slate-900` (`#0F172A`) | Judul tugas, teks langkah utama |
| Ink Muted | `--color-ink-muted` | `text-slate-500` (`#64748B`) | Deskripsi, timestamp, keterangan AI |
| Primary Accent | `--color-accent` | `bg-blue-600` (`#2563EB`) | Tombol utama, progress bar active fill |
| Primary Accent Hover | `--color-accent-hover` | `hover:bg-blue-700` (`#1D4ED8`) | Status hover CTA |
| Accent Soft | `--color-accent-soft` | `bg-blue-50` (`#EFF6FF`) | Background badge "Saran AI" & item active |
| Accent Text | `--color-accent-ink` | `text-blue-700` (`#1D4ED8`) | Teks badge "Saran AI" & link |
| Success Accent | `--color-success` | `text-emerald-600` (`#059669`) | Checkbox tercentang, progres 100% |
| Success Soft | `--color-success-soft` | `bg-emerald-50` (`#ECFDF5`) | Background status selesai |
| Danger Accent | `--color-danger` | `text-rose-600` (`#E11D48`) | Tombol hapus & error state |
| Danger Soft | `--color-danger-soft` | `bg-rose-50` (`#FFF1F2`) | Banner error & peringatan regenerate |

---

## 3. Typography Scale & Hierarchy

* **Font Family**: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
* **Hierarchy**:
  - `Display / Modal Header`: `20px` (`text-xl`), `font-bold`, leading `1.3`, slate-900.
  - `Section Title`: `15px` (`text-sm`), `font-semibold`, leading `1.4`, tracking `0.01em`, slate-800.
  - `Body / Checklist Step`: `14px` (`text-sm`), `font-normal` (atau `font-medium`), leading `1.5`, slate-800.
  - `Microcopy / Badge`: `12px` (`text-xs`), `font-semibold`, leading `1.2`, slate-600 / blue-700.
  - `Counter / Telemetry`: `13px` (`text-xs`), `font-semibold`, tabular nums, slate-600.

---

## 4. Visual & Imagery Architecture (Anti-Placeholder Standards)

1. **Header & Context Iconography**:
   - Penggunaan icon sistem seragam via **Lucide React** (`Sparkles`, `CheckCircle2`, `Circle`, `Pencil`, `RotateCcw`, `AlertCircle`, `X`, `ChevronRight`).
2. **AI Distinctive Visual Cue (Saran AI Badge)**:
   - Badge pill terkurasi: latar `bg-blue-50`, border `border-blue-200`, teks `text-blue-700`, dilengkapi ikon `Sparkles` mini (12px).
   - Penegasan visual bahwa langkah adalah *saran pemecahan tugas*, bukan instruksi mutlak dari dosen.
3. **Bespoke Parametric SVG / Data Graphics**:
   - **Progress Telemetry Bar**: Bar horizontal tinggi 8px, rounded-full, latar slate-200, dengan progress fill gradasi lembut blue-500 ke blue-600, dan transisi lebar CSS halus (`transition-all duration-300 ease-out`).
   - **Empty State Illustration**: Vector SVG terstruktur (outline gaya teknis dokumen + bintang inspirasi AI) tanpa clip-art murah.

---

## 5. Component Blueprint & 4-State UI Matrix (Checklist AI)

### A. State 1: Empty State (Belum ada checklist)
* **Wadah**: Kartu putih dengan border dashed slate-300 atau border solid slate-200 di dalam Detail Tugas.
* **Konten**:
  - Ikon `Sparkles` dalam wadah rounded-full `bg-blue-50`.
  - Teks: *"Belum ada langkah pengerjaan"*.
  - Subteks: *"Minta Gemini memecah tugas ini menjadi 3–7 langkah terstruktur untuk memudahkan pengerjaan."*
  - CTA Button: `[Sparkles] Buat langkah pengerjaan` (Solid Blue, full width di mobile, inline di desktop).

### B. State 2: Loading State (Generasi sedang berlangsung)
* **Feedback**: Tombol dalam keadaan disable + spinner halus, atau skeleton placeholder (3 baris skeleton berkedip halus dengan tinggi 44px dan border slate-200).
* **Proteksi**: Klik ganda dicegah, scroll tetap responsif, tugas tidak boleh ditutup tanpa peringatan.

### C. State 3: Error State (API gagal / timeout / kuota)
* **Wadah**: Banner peringatan lembut `bg-rose-50 border border-rose-200 rounded-xl p-4`.
* **Konten**:
  - Ikon `AlertCircle` rose-600.
  - Pesan jelas berbahasa Indonesia (contoh: *"Gagal membuat langkah pengerjaan: koneksi ke layanan AI terputus. Silakan coba lagi."*).
  - Tombol aksi: `[RotateCcw] Coba Lagi` (outline rose-600) dan tombol fallback `Batal`.
  - Data tugas asli tetap 100% utuh di layar.

### D. State 4: Success State (Checklist aktif)
* **Header Checklist**:
  - Kiri: Label **"Langkah Pengerjaan"** + Badge **"Saran AI"**.
  - Kanan: Telemetry progres (contoh: `2 dari 5 selesai · 40%`) + Tombol sekunder `[RotateCcw] Buat ulang`.
* **Progress Bar**: Bar tipis di bawah header checklist memperlihatkan persentase selesai.
* **Checklist Items List**:
  - Setiap item berupa row berjarak 8px dengan hover effect lembut (`hover:bg-slate-50`).
  - Checkbox custom 20px x 20px, rounded-md, warna border slate-300; saat checked: background emerald-600 dengan ikon check putih, teks langkah memiliki efek strikethrough warna slate-400.
  - Aksi Edit: Ikon pensil muncul saat row di-hover (atau selalu tampak pada mobile).
  - Mode Edit Inline: Teks langkah berganti menjadi textarea/input ringkas dengan tombol `Simpan` dan `Batal` (didukung keyboard shortcut Enter dan Esc).

### E. Modal Dialog Konfirmasi Pembuatan Ulang (Regenerate Dialog)
* **Backdrop**: Black/40 dengan blur ringan (`backdrop-blur-sm`).
* **Modal Card**: Max width 420px, p-6, rounded-2xl, background white, shadow-xl.
* **Isi**: Judul *"Buat ulang langkah pengerjaan?"*, penjelasan *"Checklist yang ada saat ini dan progres centangnya akan digantikan dengan saran baru dari Gemini. Tindakan ini tidak dapat dibatalkan."*
* **Aksi**: Tombol sekunder *"Batal"* (slate-100) dan tombol utama *"Ya, Buat Ulang"* (blue-600).

---

## 6. Accessibility & Interaction Polish

* **Keyboard Navigation**: Checkbox dapat di-fokus via Tab dan di-toggle via Space. Tombol edit/simpan/batal dapat diakses via keyboard.
* **Focus States**: Visible focus ring `focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`.
* **Screen Reader**: Checkbox memiliki `aria-label="Tandai [nama langkah] selesai"` dan state `aria-checked`.
* **Zero Division Guard**: Persentase progres ditangani dengan rumus `total > 0 ? Math.round((completed / total) * 100) : 0`.
