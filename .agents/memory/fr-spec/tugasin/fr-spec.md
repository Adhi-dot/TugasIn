# Functional Requirements Specification (FR-Spec) — TugasIn Dashboard & Checklist AI

**Project:** TugasIn ("Dari chat jadi checklist")  
**Project Slug:** `tugasin`  
**Modules:** Member Dashboard & Member Checklist AI  
**Source Specification:** `PRD-TugasIn.md` (Bagian 5, 6.1, 7, 8, 9, 10)  
**Total Target UI Screens:** 2  
**Document Version:** 1.1  
**Date:** 2026-10-21  

---

## 1. Traceability & UI Screen Mapping Matrix

| FR ID | Feature Name | Target Screen ID | Route / Context | Primary UI Component |
| :--- | :--- | :--- | :--- | :--- |
| **FR-01** | Dashboard Pemantauan Tugas & Prioritas Deadline | `screen-01-dashboard` | `/dashboard` | `DashboardView` (Stats, FilterBar, TaskList, TaskCard) |
| **FR-02** | AI Checklist Generation (3–7 Langkah) | `screen-02-task-detail-checklist` | `/tasks/:id` (Modal / Detail) | `TaskChecklist` (Empty State, Loading Skeleton, Error Banner) |
| **FR-03** | Interactive Checklist Management (Centang & Edit) | `screen-02-task-detail-checklist` | `/tasks/:id` (Modal / Detail) | `ChecklistItem` (Card, Custom Checkbox, Inline Editor) |
| **FR-04** | Progress Tracking & Regeneration Guard | `screen-02-task-detail-checklist` | `/tasks/:id` (Modal / Detail) | `ChecklistProgress`, `RegenerateConfirmDialog` |

---

## 2. Detailed Functional Requirements

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
     - Interaksi klik kartu tugas untuk memicu navigasi/callback pembukaan detail tugas berisikan checklist AI.
  6. **4-State UI Resilience:**
     - *Loading State:* Shimmering skeleton cards untuk stats dan task list.
     - *Empty State (No Data):* Tampilan ramah ketika belum ada tugas yang tersimpan di sistem dengan CTA untuk menambah tugas.
     - *Empty State (Filter):* Tampilan informatif ketika filter status tidak menghasilkan tugas, dengan tombol reset ke tab "Semua".
     - *Success State:* Tampilan penuh kartu tugas dengan interaksi hover, keyboard focus, dan badge status semantik.

### FR-02: AI Checklist Generation (3–7 Langkah)
- **Target Screen:** `screen-02-task-detail-checklist`
- **User Role:** Mahasiswa / Pengguna Pribadi
- **Objective:** Menghasilkan 3–7 saran langkah pengerjaan terstruktur berdasarkan `title`, `description`, dan `requirements` tugas yang valid melalui Gemini API.
- **Scope Responsibilities:**
  1. Pengguna membuka Detail Tugas yang belum memiliki checklist.
  2. Tampil *Empty State* ramah dengan tombol **"Buat langkah pengerjaan"** dan penjelasan singkat bahwa langkah merupakan saran AI.
  3. Pengguna menekan tombol. Sistem menampilkan status *Loading* (skeleton animasi) dan menonaktifkan tombol untuk mencegah request ganda.
  4. Backend memanggil Gemini API dengan prompt terisolasi dan structured JSON schema.
  5. Setelah respons valid diterima, sistem merender 3–7 langkah dengan badge **"Saran AI"** dan menyimpannya ke state bersama.
  6. Error handling: timeout 30 detik / kuota habis / jaringan menampilkan pesan error bahasa Indonesia dan tombol "Coba lagi" tanpa kehilangan konteks tugas.

### FR-03: Interactive Checklist Management (Centang & Edit)
- **Target Screen:** `screen-02-task-detail-checklist`
- **User Role:** Mahasiswa / Pengguna Pribadi
- **Scope Responsibilities:**
  1. **Centang Langkah:** Pengguna mengklik checkbox pada langkah kerja. Status `completed` diperbarui secara reaktif (true/false) dengan feedback visual strikethrough lembut.
  2. **Edit Langkah:** Pengguna menekan tombol aksi "Edit" pada item. Teks berubah menjadi input field yang dapat diedit.
  3. **Simpan / Batal:**
     - Simpan: teks diperbarui setelah validasi non-whitespace (maksimal 200 karakter). ID dan origin `ai` tetap dipertahankan.
     - Batal: teks kembali ke versi sebelumnya tanpa perubahan.
  4. Aksesibilitas keyboard lengkap (Tab, Spasi, Enter, Escape).

### FR-04: Progress Tracking & Regeneration Guard
- **Target Screen:** `screen-02-task-detail-checklist`
- **User Role:** Mahasiswa / Pengguna Pribadi
- **Scope Responsibilities:**
  1. **Progress Indicator:** Menampilkan hitungan pecahan (misal: `2 dari 5 selesai`) dan progress bar persentase (`40%`). Tidak pernah membagi dengan nol ketika checklist kosong.
  2. **Independensi Status:** Progres checklist 100% tidak otomatis mengubah status tugas utama menjadi 'done'.
  3. **Regenerate Guard:** Tombol "Buat ulang langkah" memicu modal dialog konfirmasi terlebih dahulu untuk mencegah penghapusan langkah yang sedang dikerjakan secara tidak sengaja.

---

## 3. Integration Boundaries & Data Contract Alignment

### A. Pembagian Tanggung Jawab Antar-Fitur
- **Member Dashboard:** Tampilan dashboard, kalkulasi ringkasan metrik tugas aktif vs selesai, filter status, pencarian, dan pengurutan multi-tier deterministik.
- **Member Checklist AI:** Pembuatan saran checklist AI Gemini (`POST /api/generate-checklist`), penambahan langkah manual, dan interaksi mencentang/mengedit langkah checklist terpadu di detail tugas.
- **Member Input & Preview:** Form input tempel pengumuman, backend ekstraksi Gemini (`POST /api/extract-task`), serta antarmuka preview dan koreksi draft tugas sebelum disimpan.

### B. Keselarasan Kontrak Model Task (PRD Bagian 9)
1. `sourceText?: string` — Teks pengumuman; string kosong `""` untuk input manual.
2. `sourceMessageDate?: string | null` — Acuan tanggal relatif (YYYY-MM-DD atau null).
3. `dueDate: string | null` — Tanggal penuh valid (YYYY-MM-DD atau null).
4. `dueTime: string | null` — HH:mm atau null, hanya jika dueDate tersedia.
5. `sourceTimezone: string | null` — Zona waktu yang disebutkan/dikonfirmasi (atau null).
6. `displayTimezone: string` — Menggunakan pengenal zona IANA (contoh: `Asia/Jakarta`, `Asia/Makassar`, `Asia/Jayapura`), default mengikuti runtime peramban.
7. `checklist: ChecklistItem[]` — Array langkah pengerjaan kompatibel dengan `ChecklistItemData`.
8. Pemisahan fixture: Fixture `MOCK_TASKS` dan toolbar pengembang hanya dimuat saat development (`import.meta.env.DEV`), pengguna baru selalu disajikan *Empty State* otentik.
