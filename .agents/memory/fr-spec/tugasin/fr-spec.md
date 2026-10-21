# Functional Requirements Specification (FR-Spec)
**Project:** TugasIn — Platform Otomasi Tugas Mahasiswa (“Dari chat jadi checklist”)  
**Project Slug:** `tugasin`  
**Fitur / Modul:** Input Pengumuman & Preview Hasil Ekstraksi (Member Input & Preview)  
**Total FRs:** 2  
**Total Target UI Screens:** 2 (1:1 Ratio Guaranteed)  
**Dokumen Acuan:** `PRD-TugasIn.md` (Bagian 5, 6, 7 US-01 & US-02, 8, 9, 10) dan `AGENTS.md`  

---

## 1. Traceability Matrix

| FR ID | Feature Name | Target Screen ID | Route / View | Primary UI Component |
| :--- | :--- | :--- | :--- | :--- |
| **FR-01** | Input Pengumuman Tugas & Orkestrasi Ekstraksi | `screen-01-input` | `/` atau `/input` | `AnnouncementInputCard` |
| **FR-02** | Preview Draft Tugas, Komparasi Teks Sumber & Koreksi | `screen-02-preview` | `/preview` atau Modal Preview | `TaskExtractionPreview` |

---

## 2. Detailed Functional Requirements & Screen Specs

### FR-01: Input Pengumuman Tugas & Orkestrasi Ekstraksi
- **Target Screen:** `screen-01-input`
- **User Role:** Mahasiswa / Pengguna Akhir
- **Objective:** Memungkinkan mahasiswa menempel teks pengumuman tugas (dari WhatsApp/Telegram/LMS) dalam Bahasa Indonesia hingga 5.000 karakter, menentukan tanggal pesan asal opsional (untuk konteks waktu relatif), menyelaraskan zona waktu tampilan, dan mengirimkan permintaan ekstraksi AI dengan status umpan balik yang aman dan transparan.
- **Workflow:**
  1. Pengguna membuka tampilan input pengumuman tugas.
  2. Sistem menampilkan keterangan: *“Teks pengumuman dikirim ke Gemini untuk diproses.”* (tanpa dialog popup tambahan).
  3. Pengguna menempelkan teks tugas ke dalam textarea berlabel jelas.
  4. Sistem menghitung jumlah karakter secara langsung:
     - Jika teks kosong atau hanya whitespace, tombol *“Ambil tugas”* dinonaktifkan.
     - Jika panjang teks melebihi 5.000 karakter, indikator berubah menjadi error dan pemanggilan API diblokir di sisi frontend.
  5. Pengguna secara opsional dapat mengisi *Tanggal Pesan Asal* (`sourceMessageDate`) jika pengumuman menyebut istilah relatif seperti “besok” atau “lusa”.
  6. Pengguna dapat memeriksa atau mengubah *Zona Waktu Tampilan* (`displayTimezone`, default mendeteksi zona browser pengguna, e.g. `Asia/Jakarta`).
  7. Pengguna mengklik tombol *“Ambil tugas”*:
     - Sistem menonaktifkan tombol dan mencegah klik berulang (*double-submit protection*).
     - Sistem menginisiasi request `POST /api/extract-task` dengan batas waktu (*timeout*) 30 detik menggunakan mekanisme `AbortController`.
  8. Sistem menangani respons:
     - Jika respons bertipe `task`: Pengguna diarahkan ke layar `screen-02-preview` dengan membawa draft tugas dan teks asli (tanpa auto-save ke database/localStorage).
     - Jika respons bertipe `no_task`: Sistem menampilkan pesan informatif bahwa tugas tidak terdeteksi dalam teks dan meminta pengguna memperbaiki input. Teks input tidak hilang.
     - Jika respons bertipe `multiple_tasks`: Sistem menampilkan peringatan bahwa teks terdeteksi memuat lebih dari satu tugas dan menyarankan pengguna memisahkan pengumuman.
     - Jika terjadi timeout, error jaringan, kuota habis, atau respons rusak: Sistem mempertahankan teks input dan menampilkan tombol aksi coba lagi (*retry*) serta tautan jalan pintas menuju *Tambah manual*.
  9. Pengguna dapat membatalkan proses yang sedang berlangsung sewaktu-waktu; respons yang datang terlambat (*late-arrival*) dibuang dan tidak menimpa state.
  10. Terdapat tombol sekunder yang jelas untuk navigasi ke *“Tambah manual”* tanpa melalui AI.

- **Data Input / Output:**
  - *Input Payload:*
    ```json
    {
      "text": "string (1-5000 chars, non-whitespace)",
      "sourceMessageDate": "YYYY-MM-DD | null",
      "displayTimezone": "string (IANA timezone)"
    }
    ```
  - *Expected Output:* `ExtractionResponse` (`resultType: 'task' | 'no_task' | 'multiple_tasks'`, `draft`, `warnings`, `criticalFieldEvidence`).

- **UI Blueprint (`screen-01-input`):**
  - **Zone A (Top Header / Hero):** Brand TugasIn, tagline *“Dari chat jadi checklist”*, dan visual anchor bertema produktivitas mahasiswa modern.
  - **Zone B (Form Input Canvas):**
    - Textarea utama dengan border hairline presisi dan focus ring kontras.
    - Status bar bawah textarea: live character counter (`X / 5.000 karakter`), privacy badge *“Teks pengumuman dikirim ke Gemini untuk diproses.”*
    - Pengaturan konteks: Baris input horizontal untuk *Tanggal Pesan Asal* (opsional date-picker) dan *Zona Waktu* dropdown selector.
  - **Zone C (Action & Fallback Controls):**
    - Tombol primer: *“Ambil tugas”* dengan ikon scan/sparkle dan visual loading skeleton/spinner saat proses berlangsung.
    - Tombol sekunder: *“Tambah manual”* (outline button) untuk memasukkan tugas langsung tanpa AI.
    - Warning/Error Alert Box: Muncul dinamis untuk `no_task`, `multiple_tasks`, atau kegagalan jaringan dengan tombol *Coba Lagi*.

- **Stitch MCP Generation Brief:**
  > "A pristine, modern light-mode web interface for university students to paste assignment announcements. Features a prominent clean text area with subtle slate border and clear Indonesian labeling, character count tracker (max 5,000), optional context inputs for message date and timezone selector, and a high-contrast emerald CTA button titled 'Ambil tugas'. Displays a subtle privacy reassurance caption below the input and includes an outline secondary button for manual entry. Includes thoughtful states for processing shimmer, error alert notification, and contextual feedback."

---

### FR-02: Preview Draft Tugas, Komparasi Teks Sumber & Koreksi
- **Target Screen:** `screen-02-preview`
- **User Role:** Mahasiswa / Pengguna Akhir
- **Objective:** Menyajikan antarmuka komparasi berdampingan (*split view*) antara teks pengumuman asli dengan draft kartu tugas terstruktur hasil ekstraksi Gemini, memungkinkan pengguna memeriksa, mengoreksi, melengkapi data yang ambigu, dan mengonfirmasi penyimpanan tepat satu tugas ke sistem.
- **Workflow:**
  1. Layar preview terbuka otomatis saat respons ekstraksi bertipe `task` diterima dari backend. Tidak ada penyimpanan tugas otomatis sebelum pengguna menyetujui.
  2. Pengguna melihat teks sumber pengumuman asli di panel pembanding sebagai referensi verifikasi faktual.
  3. Panel formulir draft menyajikan field-field yang dapat dikoreksi langsung:
     - **Judul Tugas:** Wajib diisi, maksimal 150 karakter (divalidasi setelah `trim()`).
     - **Mata Kuliah:** Opsional, maksimal 100 karakter.
     - **Deskripsi:** Ringkasan instruksi atau catatan tugas.
     - **Tanggal Deadline:** Tanggal penuh yang valid (`YYYY-MM-DD`). Jika tidak ditemukan di sumber, field dibiarkan kosong (`null`) disertai label peringatan *“Perlu dilengkapi”*. Sistem **tidak boleh** mengasumsikan tahun berjalan atau tanggal hari ini secara diam-diam.
     - **Waktu Deadline:** Format `HH:mm`. Waktu **tidak boleh disimpan tanpa tanggal**. Sistem **dilarang** mengisi jam default `23.59` secara otomatis jika tidak tertera di pengumuman.
     - **Zona Waktu:** Membedakan zona waktu yang berasal dari sumber pengumuman (`sourceTimezone`) dengan zona tampilan aplikasi (`displayTimezone`).
     - **Ketentuan Tugas:** Daftar poin syarat (format PDF, maksimal anggota, media pengumpulan) yang diekstrak langsung dari sumber. (Bukan checklist langkah AI).
  4. Sistem menampilkan *Extraction Warnings* dan badge penanda ambigu jika terdapat istilah relatif tanpa tanggal acuan (misal: "Jumat depan", tenggat bertentangan).
  5. Pengguna mengoreksi field atau melengkapi informasi yang kurang.
  6. Pengguna mengklik tombol *“Simpan tugas”*:
     - Sistem memvalidasi seluruh ketentuan form (judul tidak kosong, waktu memiliki tanggal).
     - Sistem memanggil fungsi kontrak penyimpanan bersama (`createTask`).
     - Cegah penyimpanan ganda (*single-save enforcement*).
     - Jika simpan berhasil, sistem mengarahkan navigasi kembali ke dashboard tugas.
     - Jika simpan gagal, sistem mempertahankan data draft di memori (tidak hilang) dan menampilkan pesan kesalahan penyimpanan yang ramah.
  7. Pengguna dapat membatalkan atau menutup preview:
     - Menutup/membatalkan preview **tidak membuat tugas baru** ke penyimpanan.

- **Data Input / Output:**
  - *Input Data:* `TaskDraft` hasil ekstraksi + `sourceText` + `displayTimezone` + `sourceMessageDate`.
  - *Output Data (saat Simpan):*
    ```json
    {
      "title": "string (1-150 chars, trimmed)",
      "course": "string | null (max 100 chars)",
      "description": "string",
      "dueDate": "YYYY-MM-DD | null",
      "dueTime": "HH:mm | null (only if dueDate present)",
      "sourceTimezone": "string | null",
      "displayTimezone": "string",
      "requirements": ["string"],
      "sourceText": "string",
      "sourceMessageDate": "YYYY-MM-DD | null"
    }
    ```

- **UI Blueprint (`screen-02-preview`):**
  - **Zone A (Header Bar):** Judul modal/halaman *“Periksa & Koreksi Hasil Ekstraksi”*, badge status verifikasi, dan tombol kembali/batal (*Dismiss*).
  - **Zone B (Split Workspace Layout - 2 Kolom):**
    - *Kolom Kiri (40% - Teks Asli Pengumuman):* Card berlatar `slate-50` yang merender teks asli pengumuman secara aman (anti-XSS), lengkap dengan highlight potongan teks pendukung (*evidence chips*).
    - *Kolom Kanan (60% - Form Koreksi Terstruktur):*
      - Field Judul (dengan peringatan validasi jika kosong).
      - Field Mata Kuliah.
      - Field Tanggal & Jam Tenggat (dengan badge *“Jam tidak disebutkan”* atau *“Perlu dilengkapi”* jika kosong).
      - Field Ketentuan Tugas (list tags yang dapat ditambah/dihapus).
      - Warning banner kuning/oranye untuk tenggat ambigu (*“Tenggat belum pasti, silakan koreksi atau simpan tanpa deadline”*).
  - **Zone C (Bottom Action Bar):**
    - Tombol *“Batal”* (flat/ghost button).
    - Tombol *“Simpan tugas”* (primary emerald CTA) dengan indikator loader saat proses penyimpanan berlangsung.

- **Stitch MCP Generation Brief:**
  > "A comprehensive two-column preview and validation workspace for reviewing extracted academic assignments. The left column displays the raw original Indonesian announcement text inside a clean slate container with subtle typography. The right column presents an editable structured form for task title, course name, date and time picker with 'Needs Completion' indicator badges for missing fields, timezone indicator, and assignment requirements chips. Bottom action bar has a ghost 'Batal' button and a bold emerald 'Simpan tugas' CTA button. Pristine light mode theme, WCAG compliant contrast, modern typography."

---

## 3. Aturan Ketat Validasi & Ambiguitas (Pilar Bisnis)

1. **Anti-Hallucination & Anti-Default:**
   - Dilarang keras meng-auto-fill jam `23:59` atau tanggal hari ini jika pengumuman tidak secara gamblang menyatakannya. Field tanggal dan jam yang tidak ada harus bernilai `null`.
2. **Ketergantungan Waktu terhadap Tanggal:**
   - Waktu pengumpulan (`dueTime`) tidak dapat disimpan jika tanggal (`dueDate`) bernilai `null`.
3. **Penanganan Ambiguitas:**
   - Frasa relatif seperti *“Besok”* hanya dapat dikonversi jika `sourceMessageDate` diketahui. Jika tidak diketahui, tandai deadline sebagai ambigu.
   - Frasa seperti *“Jumat depan”* atau dua tenggat bertentangan harus ditandai ambigu dan meminta konfirmasi pengguna.
4. **Isolasi Fitur AI Checklist:**
   - Ketentuan tugas pada preview murni berasal dari teks pengumuman (*requirements from source*), dilarang menambahkan checklist langkah pengerjaan AI di fase ini.
