# Page Design Spec: Detail Tugas & AI Task Checklist

**Screen ID:** `screen-01-task-detail-checklist`  
**Functional Requirements:** `FR-01` (Generation), `FR-02` (Check & Edit), `FR-03` (Progress & Regenerate)  
**Route:** `/tasks/:id`  
**Stitch Screen ID:** `501501918a2a4139aa4ab78f01c929f6`  
**Source HTML:** `./source.html`  
**Screenshot:** `./screenshot.png`  

---

## 1. Page Layout & Component Architecture

### Layout Hierarchy:
* **Kanvas**: `bg-slate-50` (`#F8FAFC`), min-h-screen.
* **Top Navigation Bar**:
  - Logo `TugasIn` (text-xl font-bold text-blue-600) + subteks `"Dari chat jadi checklist"` (text-xs text-slate-500).
  - Breadcrumb: `Dashboard / Pemrograman Web / Tugas Wireframe LMS`.
  - Profil mahasiswa: `Rian Pratama (NIM 13522041)`.
* **Main Container**: `max-w-5xl mx-auto py-8 px-4 sm:px-6`.
  - Link navigasi: `← Kembali ke Daftar Tugas`.
* **Task Context Header Card** (`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-6`):
  - Judul: `Tugas Wireframe Aplikasi Perpustakaan` (text-2xl font-bold text-slate-900).
  - Badges row:
    - Mata kuliah: `Pemrograman Web (IF-301)` (`bg-blue-50 text-blue-700 border-blue-200`).
    - Status: `Sedang Dikerjakan` (`bg-amber-50 text-amber-700 border-amber-200`).
    - Deadline: `📅 21 Okt 2026, 23:59 WIB` (`bg-slate-100 text-slate-700`).
  - Ketentuan Resmi Pengumuman (Wadah terpisah dengan border-l-4 biru):
    - Bullet points: Maksimal 3 anggota kelompok, format PDF LMS, sertakan user flow dan wireframe low-fidelity.
* **Primary AI Task Checklist Card** (`bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm relative mb-6`):
  - **Header Checklist**:
    - Label `Langkah Pengerjaan` (text-xl font-bold text-slate-900).
    - Pill badge `✨ Saran AI` (`bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-semibold`).
    - Telemetri: `2 dari 5 selesai · 40%` (`text-sm font-semibold text-slate-600`).
    - Tombol aksi: `[RotateCcw] Buat ulang` (`border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg`).
  - **Progress Bar**:
    - Height 8px, `bg-slate-200` rounded-full, active fill `bg-blue-600` dengan transisi lebar `transition-all duration-300 ease-out`.
  - **Checklist Step Items**:
    - Checked items: Checkbox custom `bg-emerald-600` bercentang putih, teks strikethrough `text-slate-400`.
    - Inline edit item: Card highlight `bg-blue-50/40 border-blue-300` dengan form textarea fokus + tombol `Simpan` (biru) dan `Batal` (teks).
    - Unchecked items: Checkbox rounded border `slate-300` hover `border-blue-500`, teks `text-slate-800 font-medium`.
  - **Footnote**: Ikon info + *"Langkah ini adalah saran AI untuk mempermudah pengerjaan dan tidak mengubah ketentuan resmi pengumuman."*
* **Regenerate Confirmation Dialog Modal**:
  - Modal overlay `bg-slate-900/40 backdrop-blur-sm fixed inset-0 z-50 flex items-center justify-center p-4`.
  - Card: `max-w-md w-full bg-white rounded-2xl p-6 shadow-2xl border border-slate-100`.
  - Teks konfirmasi: *"Buat ulang langkah pengerjaan? Seluruh langkah dan progres saat ini (2 dari 5 selesai) akan digantikan dengan saran baru dari Gemini. Tindakan ini tidak dapat dibatalkan."*
  - Aksi: Tombol `Batal` (`bg-slate-100`) dan `Ya, Buat Ulang` (`bg-blue-600 hover:bg-blue-700 text-white`).

---

## 2. 4-State UI Matrix Checklist

| State | Kondisi Pemicu | Elemen Visual Utama | Aksi Pengguna |
|---|---|---|---|
| **Empty State** | Tugas belum memiliki checklist | Card bergaris border slate-200/dashed, ikon `Sparkles` blue-50, ajakan *"Belum ada langkah pengerjaan"*, keterangan saran AI | Tombol utama *"Buat langkah pengerjaan"* (memanggil API Gemini) |
| **Loading State** | Request AI sedang berlangsung | Skeleton placeholder 3 baris berkilau lembut, tombol disable + spinner, proteksi ganda | Menunggu respons (disable double-click) |
| **Error State** | API timeout 30s / kuota habis / jaringan | Banner peringatan lembut `bg-rose-50 border-rose-200` dengan ikon `AlertCircle`, pesan error bahasa Indonesia jelas | Tombol *"Coba Lagi"* (manual retry) & tombol *"Batal"* |
| **Success State** | Respons checklist valid diterima | Header dengan badge *"Saran AI"*, progress bar, daftar langkah interaktif, tombol *"Buat ulang"* | Centang selesai, edit langkah inline, atau minta pembuatan ulang |

---

## 3. Micro-Interactions & Interaction Polish

* **Checkbox Toggle**: Animasi scale halus `transform active:scale-95 transition-transform duration-150` saat diklik. Checkbox berubah hijau zamrud (`emerald-600`) seketika, dan teks berubah coret (`line-through text-slate-400`).
* **Hover State Row**: Setiap baris langkah memiliki latar `hover:bg-slate-50/80` dan memunculkan tombol pensil edit ringkas di sebelah kanan.
* **Inline Edit Shortcuts**: Tekan `Enter` (pada input baris tunggal) atau klik `Simpan` untuk menyimpan, tekan `Escape` untuk membatalkan tanpa mengubah teks awal.
* **Modal Overlay Animation**: Transisi fade-in `opacity-0` ke `opacity-100` dengan zoom halus `scale-95` ke `scale-100` pada kartu modal dialog konfirmasi.

---

## 4. Visual Asset Manifest (Anti-Placeholder)

| Asset ID | Tipe | Lokasi File | Deskripsi / Formula |
|---|---|---|---|
| `icon-sparkles-ai` | SVG Component | `LucideReact.Sparkles` | Ikon 14px penanda "Saran AI" dengan warna aksen biru |
| `icon-check-custom` | SVG Component | Inline Bespoke SVG | Ikon checkmark presisi 12px putih di dalam wadah rounded 20px |
| `progress-bar-telemetry` | CSS Parametric | Tailwind `h-2 rounded-full` | Bar pengukur kemajuan dengan formula dinamis `(completed/total)*100%` |
| `modal-warning-icon` | SVG Component | `LucideReact.RotateCcw` / `Sparkles` | Ikon 24px dalam circle `bg-blue-50 text-blue-600` pada dialog regenerate |
