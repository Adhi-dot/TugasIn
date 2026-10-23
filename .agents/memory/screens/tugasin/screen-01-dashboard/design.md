# Page Design Spec: TugasIn - Dashboard Mahasiswa
**Screen ID:** `screen-01-dashboard`  
**Functional Requirement:** `FR-01`  
**Route:** `/dashboard`  
**Stitch Screen ID:** `ed0b21f06236421e99a71f363489888f`  
**Stitch Project ID:** `9848129379857225474`  
**Source HTML:** `./source.html`  
**Screenshot:** `https://lh3.googleusercontent.com/aida/AEtjO1UDRSMkO8QyB7QHQ03RhQAApM0P5BvwAXKTFbNN3KUdPkcIvbJdwWyKUqLFMpdYpZCmhCbJ4qrlcxd5OUFnpTJZCXlHqQ4O_z96tLQVlwUAjKGExdnNMCBPCCE1f_j-e3D56gnQ7_i736JppU-q0KtMhuELprw-8CTNjubewCBdgI587IlcgIIbxyBHQUVJVXwIyYHWRNyw3zWC7gcTFry7YUn4SDgeAAz-ryyJxOIVPoXOa3SI6BsLApg`

---

## 1. Page Purpose & FR Alignment
- **Associated FR:** `FR-01: Dashboard Pemantauan Tugas & Prioritas Deadline`
- **Key Business Goals:** Memberikan visualisasi komprehensif bagi mahasiswa untuk memantau ringkasan beban tugas aktif vs selesai, menyaring tugas berdasarkan status penyelesaian, menyoroti deadline terlambat dan mendekati secara deterministik, serta menyediakan akses cepat ke aksi ekstraksi pengumuman dan pencatatan manual.

---

## 2. Visual Hierarchy & Layout Blueprint
- **Layout Type:** Responsive App Shell (Sticky Top Bar + Content Canvas). Pada desktop dilengkapi breadcrumbs/status navigasi, dan pada mobile (<640px) menciut mulus ke 1 kolom tanpa scroll horizontal.
- **Grid / Flex Structure:**
  - `Header Bar`: Logo TugasIn + tagline, tombol aksi "+ Tambah dari pengumuman" & "+ Tambah manual", serta avatar/notifikasi.
  - `Summary Metrics Strip`: 2 kartu metrik berdampingan (Tugas Aktif & Tugas Selesai) dengan kontras tinggi.
  - `Filter & Toolbar Row`: Segmented tabs (*Semua*, *Belum mulai*, *Dikerjakan*, *Selesai*) dilengkapi counter badge, search input opsional, dan badge zona waktu (`WIB · UTC+7`).
  - `Main Task Grid`: Grid 1 kolom pada mobile (360px), 2 kolom pada tablet, dan 3 kolom pada desktop.
  - `Task Card`:
    * Header: Pill Mata Kuliah (kiri) + Status badge semantik (kanan).
    * Title: Judul tugas tebal (max 150 char, line-clamp-2).
    * Deadline Section: Badge merah lembut jika *Terlambat*, label *"Batas tanggal DD/MM/YYYY · jam tidak disebutkan"* jika tanpa jam, atau *"Belum ada deadline"*.
    * Checklist Progress: Bar kemajuan + rasio `X/Y langkah (Z%)`.

---

## 3. Component Breakdown (For React Implementation)
1. `<DashboardHeader />`: Menampilkan logo TugasIn, tagline, dan tombol aksi interaktif `onExtractClick` dan `onManualClick`.
2. `<SummaryStats />`: Menampilkan 2 kartu metrik dengan perhitungan reaktif:
   - `activeCount`: `tasks.filter(t => t.status === 'not_started' || t.status === 'in_progress').length`
   - `doneCount`: `tasks.filter(t => t.status === 'done').length`
3. `<StatusFilter />`: Pill tab filter interaktif dengan counter dinamis untuk masing-masing status.
4. `<TaskCard />`: Komponen kartu individual yang menangani format deadline, indikator terlambat, label jam tidak disebutkan, badge mata kuliah, dan progress bar checklist.
5. `<EmptyState />`: Penanganan saat belum ada tugas atau hasil filter kosong.
6. `<DashboardSkeleton />`: Tampilan loading shimmer saat sinkronisasi data berlangsung.

---

## 4. UI 4-State Specifications
- **Loading State:** Card skeleton dengan animasi pulsa lembut (`animate-pulse`) mencakup 2 kartu stats skeleton dan 4 kartu task skeleton.
- **Empty State (Data Kosong):** Tampilan dengan icon dokumen bersih, teks *"Belum ada tugas yang dicatat"*, dan tombol pemicu tambah tugas.
- **Empty State (Filter Kosong):** Teks *"Tidak ada tugas dengan status ini"* dan tombol *"Tampilkan semua tugas"*.
- **Success State:** Render penuh kartu tugas yang diurutkan menurut prioritas deadline.

---

## 5. Token Usage & Tailwind Mapping
- **Canvas / Background:** `bg-[#F8FAFC]` (`bg-canvas`)
- **Card Surface:** `bg-white border border-slate-200 shadow-sm rounded-xl`
- **Typography:** `font-sans` (`Plus Jakarta Sans`), Slate-900 untuk judul, Slate-600 untuk body text.
- **Brand Accent:** Indigo-600 (`#4F46E5`) untuk CTA primer dan logo badge.
- **Status Semantic Colors:**
  - `not_started`: Slate badge (`bg-slate-100 text-slate-700`)
  - `in_progress`: Amber badge (`bg-amber-50 text-amber-800 border-amber-200`)
  - `done`: Emerald badge (`bg-emerald-50 text-emerald-800 border-emerald-200`)
  - `overdue`: Rose badge (`bg-rose-50 text-rose-700 border-rose-200`)

---

## 6. Visual Asset & Imagery Manifest
- **Brand Avatar / Icons:** Menggunakan Lucide React icons (`CheckSquare`, `Plus`, `Sparkles`, `Clock`, `Calendar`, `AlertCircle`, `CheckCircle2`, `FolderOpen`, `Search`) untuk konsistensi tanpa dependensi eksternal.
- **Anti-Placeholder:** Tidak ada div kosong atau kotak abu-abu. Semua kartu memuat data realistis dan status yang dapat diinteraksikan.
