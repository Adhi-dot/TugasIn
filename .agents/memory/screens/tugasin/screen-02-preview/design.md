# Page Design Spec: Preview dan Koreksi Hasil Ekstraksi
**Screen ID:** `screen-02-preview`  
**Functional Requirement:** `FR-02` (Preview Draft Tugas, Komparasi Teks Sumber & Koreksi)  
**Route:** `/preview` atau Modal Preview  
**Stitch Screen ID:** `c9727d0d4f4f4113a0d499f26fd8e0ae`  
**Stitch Project ID:** `12464816384577900465`  
**Screenshot Source:** `https://lh3.googleusercontent.com/aida/AEtjO1Xw-Of5QR6daQVzOIWjplaTLd3Lp9alolgKzSVXskq9nTUCbArxkbTjI-xGjDM4Jng59kgCAE2eqN6i3txaqfMk8Lw1Rz2GUpQ6M8sdjxrwkG7SJhAuUR1i5LJetKcNik9PxTKhM7BciLX1smqkoE-pS9p3W7vm_8m_mVLkSmUmFB6OM0V8cJBkW7bUrWEBumnq8B3Lyj_Ey3bKZ_YeTXqbZDWY5Bf4PMYka9cc0G6DM-BIOCn7wzaJz6jH`  
**Source HTML:** `./source.html`  

---

## 1. Page Purpose & FR Alignment
- **Associated FR:** `FR-02` — Menyajikan antarmuka komparasi split-screen 2-kolom antara teks pengumuman asli (WhatsApp/LMS) dengan draft kartu tugas terstruktur hasil ekstraksi Gemini, memfasilitasi verifikasi faktual, koreksi langsung, melengkapi data ambigu, serta eksekusi simpan tugas tunggal ke sistem penyimpanan.
- **Key Business Goals:** Mencegah kesalahan interpretasi AI oleh mahasiswa, memberikan kontrol penuh atas tenggat waktu (tanpa auto-fill default 23:59), menampilkan bukti kutipan teks asli, dan memastikan pembatalan tidak membuat tugas baru.

---

## 2. Visual Hierarchy & Layout Blueprint
- **Layout Type:** Dual-Pane Side-by-Side Comparison Workspace (Desktop) / Vertically Stacked (Mobile 360px) + Sticky Action Bar.
- **Grid Structure:**
  - `Workspace Header Bar`:
    - Breadcrumb: `TugasIn Workspace` / `Ekstraksi Gemini 1.5 Flash`.
    - H1 Title: *"Periksa & Koreksi Hasil Ekstraksi"*.
    - Subtitle: *"Bandingkan teks asli pengumuman grup kuliah dengan draft tugas terstruktur sebelum disimpan."*
    - Header Controls: Badge Akurasi Deteksi ("94% Akurasi Deteksi"), tombol Tutup/Dismiss (X).
  - `Two-Column Split Workspace`:
    - **Kolom Kiri (40% Width - Teks Sumber Asli):**
      - Background: Soft Slate-100 container (`#F1F5F9`) dengan border halus `#E2E8F0`.
      - Header panel: Label "Pengumuman Asli (Chat WA / LMS)", tombol "Salin Teks", counter karakter teks sumber.
      - Body renderer: Teks asli pengumuman dirender dengan aman (anti-XSS) dengan *evidence highlight chips* (sorotan teks pendukung seperti judul, batas waktu, format).
      - Evidence Box: Catatan penalaran ekstraksi yang menjelaskan bukti kutipan di teks sumber.
    - **Kolom Kanan (60% Width - Form Koreksi Terstruktur):**
      - Field 1: **Judul Tugas (Wajib)** — Input teks dengan indikator counter karakter (maks 150 char), border merah jika kosong setelah diedit.
      - Field 2: **Mata Kuliah (Opsional)** — Input teks auto-suggest atau manual (maks 100 char).
      - Field 3: **Deskripsi Tugas** — Ringkasan instruksi tugas yang diekstrak.
      - Field 4: **Batas Pengumpulan (Deadline)**:
        * Baris inline 2 kolom: Tanggal (`YYYY-MM-DD`) + Jam (`HH:mm`).
        * Badge *"Perlu dilengkapi"* oranye jika tanggal tidak ada di sumber.
        * Badge *"Jam tidak disebutkan"* jika jam tidak ada di sumber (dilarang meng-auto-fill 23:59).
        * **Ambiguous Deadline Alert Box**: Banner peringatan jika tenggat berbunyi "Jumat depan" atau bertentangan.
      - Field 5: **Ketentuan Tugas dari Pengumuman**:
        * Kumpulan tag chips interaktif yang dapat dihapus (contoh: "Format PDF", "Maks 3 orang", "Kumpul via LMS").
        * Tombol "+ Tambah Ketentuan" untuk menambahkan syarat manual.
  - `Sticky Bottom Action Bar`:
    - Fixed bottom panel berlatar putih dengan top hairline border `#E2E8F0`.
    - Sisi Kiri: Status validasi ("Semua field tervalidasi" atau "1 peringatan tenggat perlu konfirmasi").
    - Sisi Kanan:
      * Tombol Ghost: *"Batal & Buang Draft"* (tidak membuat tugas ke penyimpanan).
      * Tombol Primer: *"Simpan tugas"* (warna Emerald-600 `#059669`, tombol disable jika judul kosong, loading spinner saat proses simpan).

---

## 3. Component Breakdown (For React Conversion)
1. `<PreviewHeader />`: Judul, navigasi modal, badge verifikasi AI, tombol tutup.
2. `<SourceComparisonPane />`:
   - `<RawAnnouncementViewer />`: Rendering teks pengumuman aman anti-XSS dengan format whitespace preserved.
   - `<EvidenceHighlightCard />`: Penanda kutipan teks sumber pendukung field kritis.
3. `<StructuredCorrectionForm />`:
   - `<TitleInputField />`: Input judul tugas terkontrol dengan validasi trim dan karakter limit.
   - `<CourseInputField />`: Input mata kuliah opsional.
   - `<DescriptionTextarea />`: Textarea deskripsi ringkas.
   - `<DeadlinePickerGroup />`: Date input, time input, badge "Jam tidak disebutkan", badge "Perlu dilengkapi".
   - `<AmbiguousDeadlineWarning />`: Banner peringatan ambigu jika tanggal belum pasti.
   - `<RequirementChipsManager />`: Daftar chips ketentuan tugas dari pengumuman yang dapat ditambah/dihapus.
4. `<StickyActionBar />`: Kontrol pembatalan (*Batal*) dan eksekusi simpan (*Simpan tugas*).

---

## 4. UI 4-State Specifications
- **Loading / Submitting State:** Tombol *"Simpan tugas"* menampilkan loading spinner dan teks *"Menyimpan tugas..."*, tombol Batal terkunci sementara.
- **Error State (Gagal Simpan):** Muncul toast/banner error merah *"Gagal menyimpan tugas ke penyimpanan lokal. Draft Anda tetap aman, silakan coba simpan kembali."*
- **Validation Error State:** Field judul bergaris merah dengan pesan *"Judul tugas wajib diisi"* dan fokus otomatis ke field judul jika pengguna mencoba menyimpan.
- **Success State:** Memunculkan toast berhasil, menutup modal preview, dan mengarahkan pengguna ke dashboard dengan kartu tugas baru.

---

## 5. Token Usage & Tailwind Mapping
- **Canvas / Background:** `bg-[#F8FAFC]` (`bg-slate-50`)
- **Source Pane Container:** `bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl p-5`
- **Correction Form Surface:** `bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm`
- **Primary Action Button:** `bg-[#059669] hover:bg-[#047857] text-white font-medium px-6 py-2.5 rounded-lg`
- **Secondary Ghost Button:** `border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-lg`
- **Warning Indicator:** `bg-[#FFFBEB] text-[#D97706] border border-amber-200`
- **Error Indicator:** `bg-[#FEF2F2] text-[#DC2626] border border-red-200`

---

## 6. Visual Asset & Imagery Manifest (Anti-Placeholder Architecture)
- **Bespoke SVGs:**
  - `SourceQuoteIcon`: Ikon kutipan teks presisi untuk header kolom sumber.
  - `VerificationCheckmarkShield`: Segel verifikasi ekstraksi AI terpercaya.
  - `CalendarAlertIcon`: Ikon segitiga kalender untuk indikator deadline ambigu.
  - `TagRemoveCrossIcon`: Ikon silang mikro untuk menghapus chips ketentuan penugasan.
