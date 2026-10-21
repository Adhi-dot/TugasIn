# Functional Requirements Specification (FR-Spec) — TugasIn Checklist AI

**Project:** TugasIn (Dari chat jadi checklist)  
**Project Slug:** `tugasin`  
**Feature Scope:** AI Task Checklist Generation, Editing, Progress Tracking, & Regeneration Guard  
**Document Version:** 1.0  
**Date:** 2026-10-21  

---

## 1. Executive Summary & Scope Certification

Fitur **Checklist AI** adalah komponen inti produktivitas pada TugasIn yang mengubah tugas kuliah/kerja yang tersimpan menjadi 3–7 langkah pengerjaan konkret berbahasa Indonesia. Langkah-langkah ini dihasilkan melalui Gemini API secara aman, terstruktur, dan disajikan pada panel Detail Tugas dengan pemisahan tegas antara "Ketentuan dari pengumuman" dan "Saran AI". Pengguna memiliki kendali penuh untuk mengedit, mencentang, memantau persentase progres, dan membuat ulang checklist dengan proteksi konfirmasi data.

---

## 2. Functional Requirements Table

| FR ID | Judul Kebutuhan | Aktor | Tipe UI / Komponen | Prioritas |
|---|---|---|---|---|
| **FR-01** | AI Checklist Generation (3–7 Langkah) | Mahasiswa / Pengguna | Empty State Button, Skeleton Loading, & Error Banner | P0 (Wajib) |
| **FR-02** | Interactive Checklist Management (Centang & Edit) | Mahasiswa / Pengguna | Checklist Item Card, Custom Checkbox, Inline/Drawer Editor | P0 (Wajib) |
| **FR-03** | Progress Tracking & Regeneration Protection | Mahasiswa / Pengguna | Fractional & Percentage Progress Bar, Confirmation Modal | P0 (Wajib) |

---

## 3. Detailed Functional Requirements

### FR-01: AI Checklist Generation
* **Tujuan**: Menghasilkan 3–7 saran langkah pengerjaan terstruktur berdasarkan `title`, `description`, dan `requirements` tugas yang valid.
* **Actor / Role**: Mahasiswa / Pengguna aktif.
* **Alur Interaksi**:
  1. Pengguna membuka Detail Tugas yang belum memiliki checklist.
  2. Tampil *Empty State* ramah dengan tombol **"Buat langkah pengerjaan"** dan penjelasan singkat bahwa langkah merupakan saran AI.
  3. Pengguna menekan tombol. Sistem menampilkan status *Loading* (skeleton animasi) dan menonaktifkan tombol untuk mencegah request ganda.
  4. Backend memanggil Gemini API dengan prompt terisolasi dan structured JSON schema.
  5. Setelah respons valid diterima, sistem merender 3–7 langkah dengan badge **"Saran AI"** dan menyimpannya ke state bersama.
* **Edge Cases & Error Handling**:
  - Request gagal (timeout 30 detik / kuota habis / jaringan): Tampilkan pesan error bahasa Indonesia dan tombol "Coba lagi". Data tugas tidak boleh hilang.
  - Request usang (*stale request*): Jika pengguna berpindah tugas atau detail tugas diubah saat request berjalan, respons lama dibuang.

### FR-02: Interactive Checklist Management (Centang & Edit)
* **Tujuan**: Memungkinkan pengguna mencentang langkah selesai serta mengoreksi teks langkah sesuai kebutuhan riil.
* **Actor / Role**: Mahasiswa / Pengguna.
* **Alur Interaksi**:
  1. **Centang Langkah**: Pengguna mengklik checkbox pada langkah kerja. Status `completed` diperbarui secara reaktif (true/false) dengan feedback visual strikethrough lembut.
  2. **Edit Langkah**: Pengguna menekan tombol aksi "Edit" pada item. Teks berubah menjadi input field yang dapat diedit.
  3. **Simpan / Batal**:
     - Pengguna menekan tombol "Simpan" (atau Enter): teks diperbarui setelah validasi non-whitespace (maksimal 200 karakter). ID dan origin `ai` tetap dipertahankan.
     - Pengguna menekan "Batal" (atau Escape): teks kembali ke versi sebelumnya tanpa perubahan.
* **Edge Cases**:
  - Teks hasil edit kosong atau hanya spasi: Tampilkan peringatan, tolak penyimpanan.
  - Navigasi keyboard: Checkbox dan tombol edit/simpan/batal dapat dioperasikan penuh dengan tombol Tab, Spasi, dan Enter.

### FR-03: Progress Tracking & Regeneration Protection
* **Tujuan**: Menampilkan indikator kemajuan penyelesaian tugas dan mencegah kehilangan data saat checklist dibuat ulang.
* **Actor / Role**: Mahasiswa / Pengguna.
* **Alur Interaksi**:
  1. **Progress Indicator**: Menampilkan hitungan pecahan (misal: `2 dari 5 selesai`) dan progress bar persentase (`40%`). Jika belum ada checklist, progress bar tidak membagi dengan nol.
  2. **Independensi Status Tugas**: Meskipun progres mencapai `100%`, status tugas utama tidak otomatis menjadi "Selesai" karena tugas mungkin belum dikumpulkan ke LMS/dosen.
  3. **Regenerate Guard**:
     - Jika checklist sudah ada, tombol berubah menjadi **"Buat ulang langkah"**.
     - Mengklik tombol memunculkan modal dialog konfirmasi: *"Pembuatan ulang akan mengganti seluruh langkah dan progres saat ini. Lanjutkan?"*.
     - Jika user membatalkan: dialog tertutup tanpa memanggil API.
     - Jika dikonfirmasi: checklist lama tetap ditampilkan dalam mode disabled/loading sampai hasil baru benar-benar valid, lalu diganti secara atomik.

---

## 4. UI Screen Mapping Matrix

| Screen ID | Screen Title | Route / Context | Primary Focus Component | Stitch Generation Intent |
|---|---|---|---|---|
| `screen-01-task-detail-checklist` | Detail Tugas & Checklist AI | `/tasks/:id` (Modal / Page Detail) | `TaskDetailChecklistContainer` | Light-mode academic productivity UI featuring task metadata header, explicit source requirements, and a dedicated AI Checklist card with progress bar, interactive checkboxes, inline editing, and 4-state transitions. |

---

## 5. Acceptance Criteria Checklist

- [ ] Validasi input server: judul wajib, maks 150 char, requirements array.
- [ ] Output Gemini divalidasi ketat: 3–7 langkah berbahasa Indonesia, tidak mengarang jawaban tugas atau tenggat baru.
- [ ] 4 State UI lengkap: Empty, Loading, Error (retryable), Success.
- [ ] Label "Saran AI" tampil terpisah dari "Ketentuan dari pengumuman".
- [ ] Edit langkah mempertahankan ID dan `origin: 'ai'`.
- [ ] Progress counter tidak terjadi pembagian dengan nol saat checklist kosong.
- [ ] Progres 100% tidak otomatis mengubah status tugas.
- [ ] Konfirmasi dialog wajib muncul sebelum pembuatan ulang (regenerate).
- [ ] Aksesibilitas: Keyboard navigable dan high-contrast WCAG AA.
