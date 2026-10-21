# Functional Requirements Specification (FR-Spec) — TugasIn Dashboard
**Project:** TugasIn ("Dari chat jadi checklist")  
**Module:** Member Dashboard  
**Source Specification:** `PRD-TugasIn.md` (Bagian 5, 6.1, 7 US-03/US-04, 8, 9, 10)  
**Total FRs:** 1  
**Total Target UI Screens:** 1 (1:1 Ratio Guaranteed)  

---

## 1. Traceability Matrix

| FR ID | Feature Name | Target Screen ID | Route / View | Primary UI Component |
| :--- | :--- | :--- | :--- | :--- |
| FR-01 | Dashboard Pemantauan Tugas & Prioritas Deadline | screen-01-dashboard | `/dashboard` | `DashboardView` (Stats, FilterBar, TaskList, TaskCard) |

---

## 2. Detailed Functional Requirements & Screen Specs

### FR-01: Dashboard Pemantauan Tugas & Prioritas Deadline
- **Target Screen:** `screen-01-dashboard`
- **User Role:** Mahasiswa / Pengguna Pribadi
- **Objective:** Memantau seluruh tugas aktif dan selesai dalam satu antarmuka terpadu, melihat ringkasan progres, memfilter status, dan melihat daftar tugas yang secara deterministik diurutkan berdasarkan prioritas urgensi deadline tanpa kesalahan zona waktu.
- **Scope Responsibilities:**
  1. **Ringkasan (Summary Metrics):** Menghitung secara reaktif jumlah tugas aktif (`not_started` + `in_progress`) dan tugas selesai (`done`).
  2. **Filter Status:** Memfilter tampilan berdasarkan 4 tab: *Semua*, *Belum mulai*, *Dikerjakan*, dan *Selesai*.
  3. **Multi-Tier Sorting Engine:**
     - Tier 1: Tugas aktif yang terlambat (`isOverdue == true`), diurutkan dari deadline paling lampau terlebih dahulu.
     - Tier 2: Tugas aktif dengan deadline terdekat (ascending by timestamp).
     - Tier 3: Tugas aktif tanpa deadline (`dueDate == null`).
     - Tier 4: Tugas selesai (`status == 'done'`).
  4. **Aturan Bisnis Deadline & Checklist:**
     - Tanggal tanpa jam: berlabel *"Batas tanggal DD/MM/YYYY · jam tidak disebutkan"*. Status terlambat baru aktif setelah tanggal tersebut berakhir (23:59:59) menurut zona tampilan pengguna.
     - Tugas selesai (`status == 'done'`) tidak pernah menampilkan badge "Terlambat".
     - Checklist kosong menampilkan rasio `0/0 (0%)` tanpa error division-by-zero.
     - Progres checklist 100% tidak mengubah status tugas secara otomatis.
  5. **Aksi & Integrasi Antar-Fitur:**
     - Tombol aksi *"Tambah dari pengumuman"* (menghubungkan ke flow ekstraksi input).
     - Tombol aksi *"Tambah manual"* (membuka modal/form manual).
     - Interaksi klik kartu tugas untuk memicu navigasi/callback pembukaan detail tugas.
  6. **4-State UI Resilience:**
     - *Loading State:* Shimmering skeleton cards untuk stats dan task list.
     - *Empty State (No Data):* Tampilan ramah ketika belum ada tugas yang tersimpan di sistem dengan CTA untuk menambah tugas.
     - *Empty State (Filter):* Tampilan informatif ketika filter status tidak menghasilkan tugas, dengan tombol reset ke tab "Semua".
     - *Success State:* Tampilan penuh kartu tugas dengan interaksi hover, keyboard focus, dan badge status semantik.
- **UI Blueprint:**
  - **Zone A (Top Header & Global Action Bar):**
    - Logo & Tagline TugasIn ("Dari chat jadi checklist").
    - Tombol Aksi Cepat: "+ Tambah dari pengumuman" (Primary CTA) & "+ Tambah manual" (Secondary Outline).
  - **Zone B (Metrics Telemetry Strip):**
    - Card 1: Tugas Aktif (Total tugas `not_started` + `in_progress`).
    - Card 2: Tugas Selesai (Total tugas `done`).
  - **Zone C (Filter Tabs & Search/Utility Row):**
    - Pill filter tabs: Semua (count), Belum mulai (count), Dikerjakan (count), Selesai (count).
    - Indikator zona waktu tampilan aktif (misal: "WIB · UTC+7").
  - **Zone D (Main Responsive Task Grid / List):**
    - Responsive grid (1 kolom di mobile 360px, 2-3 kolom di desktop).
    - Task Card:
      * Header Card: Badge Mata Kuliah (atau pill netral jika tidak ada) & Badge Status (Belum mulai / Dikerjakan / Selesai).
      * Body Card: Judul tugas (bold, aman dari XSS, max 150 char) & Potongan ringkasan/deskripsi.
      * Footer Card: Indikator Deadline (icon kalender/jam, badge "Terlambat" jika overdue) & Progres Checklist (progress bar + label teks rasio).
- **Stitch MCP Generation Brief:**
  > "A clean, modern, high-contrast light-mode task dashboard for university students named TugasIn ('Dari chat jadi checklist'). Clean white canvas (#FFFFFF) with slate-50 background, hairline borders (#E2E8F0), and crisp Plus Jakarta Sans typography. Top header features the brand with primary action buttons 'Tambah dari pengumuman' and 'Tambah manual'. A 2-card metric summary displays 'Tugas Aktif' and 'Tugas Selesai'. Below is a segment filter bar with tabs 'Semua', 'Belum mulai', 'Dikerjakan', 'Selesai'. The main feed presents cards with course tags, task titles, deadline status badges (overdue in rose, upcoming in slate, 'jam tidak disebutkan' label), and checklist progress indicators. Fully responsive down to 360px without horizontal scroll."
