# Page Design Spec: Input Pengumuman Tugas
**Screen ID:** `screen-01-input`  
**Functional Requirement:** `FR-01` (Input Pengumuman Tugas & Orkestrasi Ekstraksi)  
**Route:** `/` atau `/input`  
**Stitch Screen ID:** `643106516be14f5bbc7d3773202b9945`  
**Stitch Project ID:** `12464816384577900465`  
**Screenshot Source:** `https://lh3.googleusercontent.com/aida/AEtjO1VPgQwdiiS2xFbNbXe8ILS82qAJTbzJCHYJAYkEAVJ5UMI4ATdmZS7M5MyAylFjgQi-7nSXZzN6VsHUyx7eWjsxtwmJHhwsUqHUi0s5-rg9xsimgzHzCDiywvvYCkkD1g8qdXQhK6CG09iEJbsIKWFG4xBBSpcQIAlGx6HGaHobUCGSpRcWq6d96YAbe2lTczSgrZOT3cjaF1P5Pj2O84IdoZ21BytPHp7aW96WW2EiJDrEBvuLqOnRk53c`  
**Source HTML:** `./source.html`  

---

## 1. Page Purpose & FR Alignment
- **Associated FR:** `FR-01` — Memungkinkan mahasiswa menempel teks pengumuman tugas dalam Bahasa Indonesia hingga 5.000 karakter, menentukan tanggal pesan asal opsional (konteks waktu relatif), menyelaraskan zona waktu, dan memicu ekstraksi Gemini terstruktur dengan feedback aman.
- **Key Business Goals:** Mengurangi beban manual pencatatan tugas, memberikan rasa aman bahwa teks diproses secara terenkripsi, mencegah double-submit, dan menangani state error/empty secara anggun.

---

## 2. Visual Hierarchy & Layout Blueprint
- **Layout Type:** Asymmetric 2-Column Split Hero + Centered Full-Width Input Workspace Card + Feedback Banner Overlays.
- **Grid Structure:**
  - `Top Navigation`: Logo TugasIn + Tagline pill "Dari chat jadi checklist" + Semester Indicator chip + "Buka Dashboard" secondary action.
  - `Hero Section`: 
    - *Left Side (60%)*: Privacy trust badge (Padlock SVG + "Didukung Gemini AI"), H1 Headline ("Ubah Pengumuman Kelas Menjadi Tugas Terjadwal"), subheadline, dan 3 fitur unggulan pills.
    - *Right Side (40%)*: Framed authentic photography of Indonesian university student with clean floating badge.
  - `Main Workspace Card`:
    - White rounded-xl container with 1px hairline border `#E2E8F0`.
    - Tab switch: "Ekstraksi Otomatis (Gemini)" vs "Input Manual Cepat".
    - Chip templates contoh pengumuman: "Contoh: Chat WA Dosen", "Contoh: Pengumuman LMS Spada".
    - Core textarea: Labeled clearly, placeholder kontekstual, bottom helper text, live character counter `0 / 5.000 karakter`.
    - Context parameter bar: Date input "Tanggal Pesan Asal (Opsional)" + Timezone dropdown ("WIB / WITA / WIT").
    - Action bar: Primary Emerald CTA "Ambil tugas" + Secondary outline "Tambah manual" + Ghost "Hapus Teks".
  - `Feedback Banners`:
    - Warning banner for `no_task` (Amber container `#FFFBEB`).
    - Notice banner for `multiple_tasks` (Indigo/Blue container).
    - Skeleton loader shimmering wave for loading state.

---

## 3. Component Breakdown (For React Conversion)
1. `<TopNavigation />`: Brand logo, subtitle badge, live semester status dot, link ke dashboard.
2. `<HeroSplitSection />`: Copywriting headline, value propositions, and framed image component.
3. `<AnnouncementInputCard />`:
   - `<TemplateChipsBar />`: Chip contoh pengumuman untuk demo instan.
   - `<AnnouncementTextarea />`: Textarea terkontrol, counter karakter real-time, validasi batas 5.000 char.
   - `<ContextParameterRow />`: Date picker tanggal asal, timezone selector.
   - `<ActionControlsBar />`: Tombol primer "Ambil tugas" (disabled saat kosong/loading, proteksi klik ganda), tombol "Tambah manual".
4. `<FeedbackBanner />`: Dynamic alert notification container untuk hasil `no_task`, `multiple_tasks`, atau kegagalan API.
5. `<ProcessingSkeleton />`: Skeleton loading shimmer saat ekstraksi berlangsung dengan timer batas 30 detik.

---

## 4. UI 4-State Specifications
- **Loading State:** Shimmering animated wave skeleton (`bg-slate-100` ke `bg-slate-200/60`) dengan tulisan *"Gemini sedang mengekstrak detail tugas..."*, tombol CTA terkunci (*disabled*), dan indikator spinner halus.
- **Error State:** Banner oranye/merah ramah di atas card input (`bg-red-50 border border-red-200 text-red-800 rounded-xl p-4`), tombol *Coba Lagi*, teks textarea dipertahankan 100%.
- **Empty / Ambiguous State:**
  - `no_task`: Alert amber *"Teks Tidak Mengandung Tugas Jelas. Pastikan ada nama mata kuliah atau instruksi penyerahan."*
  - `multiple_tasks`: Alert biru *"Beberapa Tugas Terdeteksi. Mohon tempelkan satu per satu."*
- **Success State:** Membuka layar `screen-02-preview` secara instan membawa draft terstruktur.

---

## 5. Token Usage & Tailwind Mapping
- **Canvas / Background:** `bg-[#F8FAFC]` (`bg-slate-50`)
- **Card Surface:** `bg-white border border-[#E2E8F0] shadow-sm rounded-xl`
- **Primary CTA:** `bg-[#059669] hover:bg-[#047857] text-white font-medium rounded-lg`
- **Text:** Primary `text-[#0F172A]` (Slate-900), Muted `text-[#64748B]` (Slate-500)
- **Status Amber:** `bg-[#FFFBEB] border-amber-200 text-amber-800`

---

## 6. Visual Asset & Imagery Manifest (Anti-Placeholder Architecture)
- **Hero Image Asset:**
  - *File*: `public/assets/images/hero-student-study.webp`
  - *Source URL Stitch*: `https://lh3.googleusercontent.com/aida/AEtjO1UbtFD-QrTXoqdB0y1WN44dKNsoZHDNPqioO8QjVwSAOEOofxlXKYlq0eVc6ZYovZwjKPrQGvk99CRq007zm0MR1uyO8WXUDEVpk_AhRbZxXKOUlSrmNDRw0bxJl_6gee2ZUri5vJW7IyTqf3yC_sIYnz0MLjiNz3mQKKcTTg5WrD25mgbVw3RaNroYEPPB-BcyHdEgFw5oAxgAq3IiF1Rh1_xIHUuUoiNOegYfyD00w-3p87KC0OXaF7US`
  - *Deskripsi*: Mahasiswa Indonesia modern tersenyum belajar di meja kerja rapi dengan laptop dan buku catatan, pencahayaan alami pagi hari.
  - *Aspect Ratio*: `3:2` framed with `rounded-2xl border border-slate-200 shadow-sm`.
- **Bespoke Vector SVGs:**
  - `SparkleScanIcon`: Ikon bintang presisi emerald untuk tombol "Ambil tugas".
  - `PrivacyShieldIcon`: Ikon gembok pelindung privasi data kampus.
  - `ClockWarningIcon`: Ikon peringatan tenggat untuk amber alert.
