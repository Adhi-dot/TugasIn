# Functional Requirements Specification (FR-Spec) — TugasIn

**Project:** TugasIn — Platform Otomasi Tugas Mahasiswa (“Dari chat jadi checklist”)  
**Project Slug:** `tugasin`  
**Fitur / Modul:** Dashboard Pemantauan, Input Pengumuman, Preview Ekstraksi, & Checklist AI  
**Total Target UI Screens:** 4 (1:1 Ratio Guaranteed)  
**Dokumen Acuan:** `PRD-TugasIn.md` (Bagian 5, 6, 7 US-01 s/d US-04, 8, 9, 10) dan `AGENTS.md`  

---

## 1. Traceability & UI Screen Mapping Matrix

| FR ID | Feature Name | Target Screen ID | Route / Context | Primary UI Component |
| :--- | :--- | :--- | :--- | :--- |
| **FR-01** | Dashboard Pemantauan Tugas & Prioritas Deadline | `screen-01-dashboard` | `/` atau `/dashboard` | `DashboardView` (Stats, FilterBar, TaskList, TaskCard) |
| **FR-02** | Input Pengumuman Tugas & Orkestrasi Ekstraksi | `screen-01-input` | Modal / `/input` | `AnnouncementInputForm` & `AnnouncementInputAndPreview` |
| **FR-03** | Preview Draft Tugas, Komparasi Teks Sumber & Koreksi | `screen-02-preview` | Modal / `/preview` | `TaskPreviewModal` |
| **FR-04** | Detail Tugas & AI Task Checklist Management | `screen-02-task-detail-checklist` | Modal / `/tasks/:id` | `TaskChecklist`, `ChecklistItem`, `ChecklistProgress` |

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

### FR-02: Input Pengumuman Tugas & Orkestrasi Ekstraksi
- **Target Screen:** `screen-01-input`
- **User Role:** Mahasiswa / Pengguna Akhir
- **Objective:** Memungkinkan mahasiswa menempel teks pengumuman tugas (dari WhatsApp/Telegram/LMS) dalam Bahasa Indonesia hingga 5.000 karakter, menentukan tanggal pesan asal opsional (untuk konteks waktu relatif), menyelaraskan zona waktu tampilan, dan mengirimkan permintaan ekstraksi AI dengan status umpan balik yang aman dan transparan.
- **Workflow:**
  1. Pengguna membuka tampilan input pengumuman tugas.
  2. Sistem menampilkan keterangan: *“Teks pengumuman dikirim ke Gemini untuk diproses.”* (tanpa dialog popup tambahan).
  3. Pengguna menempelkan teks tugas ke dalam textarea berlabel jelas (maksimal 5.000 karakter).
  4. Pengguna secara opsional dapat mengisi *Tanggal Pesan Asal* (`sourceMessageDate`).
  5. Pengguna dapat memeriksa zona waktu tampilan (`displayTimezone`, default peramban pengguna).
  6. Pengguna mengklik *“Ambil tugas”* untuk memicu permintaan `POST /api/extract-task` dengan batas 30 detik.
  7. Penanganan respons: `task` membuka preview modal, `no_task` menampilkan feedback banner, `multiple_tasks` menampilkan saran pemisahan, error menampilkan tombol retry dan tambah manual.

### FR-03: Preview Draft Tugas, Komparasi Teks Sumber & Koreksi
- **Target Screen:** `screen-02-preview`
- **User Role:** Mahasiswa / Pengguna Akhir
- **Objective:** Menyajikan ruang kerja komparasi 2 kolom yang intuitif untuk memverifikasi teks asli pengumuman berdampingan dengan field data terstruktur (judul, mata kuliah, deskripsi, tanggal, jam, zona waktu, ketentuan).
- **Workflow:**
  1. Pengguna membandingkan teks asli di sisi kiri dengan draft di sisi kanan.
  2. Field yang kurang lengkap atau ambigu diberi badge visual *"Perlu Dilengkapi"*.
  3. Pengguna dapat menyunting data secara fleksibel.
  4. Pengguna menekan *“Simpan tugas”* untuk meneruskan data ke state bersama/localStorage, atau *“Batal”* tanpa menyimpan.
  5. Jika penyimpanan lokal gagal, modal tetap terbuka dan draft tetap dipertahankan di memori.

### FR-04: Detail Tugas & AI Task Checklist Management
- **Target Screen:** `screen-02-task-detail-checklist`
- **User Role:** Mahasiswa / Pengguna Akhir
- **Objective:** Menghasilkan dan mengelola 3–7 langkah konkret pengerjaan tugas berbahasa Indonesia via Gemini API (`POST /api/generate-checklist`), dengan pemisahan tegas dari ketentuan dosen, interaktivitas centang & edit, telemetri progres, dan dialog konfirmasi pembuatan ulang.
- **Workflow:**
  1. Pengguna membuka detail tugas dari dashboard.
  2. Empty state menyediakan tombol *"Buat langkah pengerjaan"*.
  3. Loading state menampilkan skeleton shimmer dengan disable button untuk mencegah double-call.
  4. Checklist menyajikan 3–7 langkah berlabel *"Saran AI"*, checkbox kustom, strikethrough, dan inline text editor.
  5. Progress bar menghitung persentase penyelesaian tanpa pembagian dengan nol.
  6. Tombol *"Buat ulang langkah"* memicu dialog konfirmasi agar progres aktif tidak terhapus tanpa sengaja.

---

## 3. Aturan Ketat Validasi & Ambiguitas (Pilar Bisnis)

1. **Anti-Hallucination & Anti-Default:**
   - Dilarang keras meng-auto-fill jam `23:59` atau tanggal hari ini jika pengumuman tidak menyatakannya secara eksplisit. Field yang tidak ada bernilai `null`.
2. **Ketergantungan Waktu terhadap Tanggal:**
   - Waktu pengumpulan (`dueTime`) tidak dapat disimpan tanpa tanggal (`dueDate`).
3. **Penanganan Ambiguitas:**
   - Frasa "besok" memerlukan tanggal pesan asal (`sourceMessageDate`). Tanpa itu, tandai ambigu.
   - Frasa "Jumat depan", tanggal tanpa tahun, atau dua tenggat yang bertentangan ditandai ambigu.
4. **Isolasi Fitur AI Checklist:**
   - Ketentuan tugas pada preview murni berasal dari teks pengumuman (*requirements from source*), tidak mencampur aduk dengan checklist saran AI.
5. **Keselarasan Kontrak Model Task (PRD Bagian 9):**
   - `sourceText: string`, `sourceMessageDate: string | null`, `dueDate: string | null`, `dueTime: string | null`, `sourceTimezone: string | null`, `displayTimezone: string`, `requirements: string[]`, `status: TaskStatus`, `checklist: ChecklistItem[]`.
