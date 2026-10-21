# Stitch MCP Generation Prompts: TugasIn
**Project Slug:** `tugasin`  
**Generated Via:** `@enhance-prompt`  
**Source Specifications:** `.agents/memory/fr-spec/tugasin/fr-spec.md` & `.agents/memory/frontend-design/tugasin/design.md`  

---

## Screen 01: Input Pengumuman Tugas (`screen-01-input`)

```markdown
A modern, minimalist academic task capture landing and input workspace designed for Indonesian university students, transforming chaotic assignment announcements from WhatsApp and LMS into organized checklist tasks. Tagline: "Dari chat jadi checklist".

**DESIGN SYSTEM (REQUIRED):**
- Platform: Responsive Web (Fluid desktop layout down to 360px mobile viewport)
- Theme: Pristine Light Mode (WCAG AAA contrast, zero generic purple gradients or AI tells)
- Background Canvas: Clean Slate-50 (#F8FAFC)
- Card Surfaces: Pure White (#FFFFFF) with crisp hairline borders (#E2E8F0) and subtle soft lift (shadow-sm)
- Primary Brand Accent: Emerald Green (#059669) for focal CTAs and active states
- Secondary Accent: Emerald-50 (#ECFDF5) for badges and highlight chips
- Text Primary: Deep Slate (#0F172A)
- Text Secondary: Muted Slate (#64748B)
- Warning Tone: Amber-600 (#D97706) for ambiguous deadline alerts
- Typography: Plus Jakarta Sans / Inter throughout (strictly no monospace on UI controls)
- Corner Radius: 12px (rounded-xl) for cards, 8px (rounded-lg) for inputs and buttons

**VISUAL & IMAGERY ASSETS (REQUIRED):**
- Hero Asset (Right Column or Header Accent): High-resolution authentic lifestyle photo of a modern Indonesian university student sitting at a tidy minimalist wooden desk with laptop, clean morning daylight, warm ambient lighting, crisp negative space.
- Bespoke Vector SVGs: Sparkle AI extraction indicator, privacy padlock badge, live status telemetry icon. No empty gray placeholder boxes.

**Page Structure & Components:**
1. **Top Navigation Bar:** Minimalist logo titled "TugasIn" with tagline "Dari chat jadi checklist", status chip "Semester Aktif", and subtle outline navigation button "Dashboard".
2. **Hero & Context Header:** Bold H1 "Ubah Pengumuman Kelas Menjadi Tugas Terjadwal", concise value proposition, and trust badge "Teks pengumuman dikirim ke Gemini untuk diproses secara aman".
3. **Core Announcement Input Card:**
   - Prominent labeled textarea with clean hairline border: "Tempel Teks Pengumuman Tugas di Sini" (placeholder guiding user to paste messages from WhatsApp / LMS).
   - Live Character Tracker & Validation: "0 / 5.000 karakter" right-aligned, transitioning to warning color if exceeded.
   - Context Parameter Controls (Horizontal Row): Date-picker for optional "Tanggal Pesan Asal" (to resolve relative terms like 'besok') and Dropdown selector for "Zona Waktu Tampilan" (default: WIB - Asia/Jakarta).
4. **Action Controls Bar:**
   - High-contrast Emerald Primary CTA: "Ambil tugas" with sparkle scan icon and loading shimmer state.
   - Secondary Outline CTA: "Tambah manual" for entering tasks without AI processing.
5. **Interactive Feedback States (Banner Overlays):**
   - Alert notification for "Tugas Tidak Ditemukan" (no_task state) with actionable hint.
   - Alert notification for "Multiple Tugas Terdeteksi" (multiple_tasks state) prompting user to split messages.
   - Processing Skeleton Loader: Shimmering wave skeleton indicating Gemini extraction in progress.
```

---

## Screen 02: Preview dan Koreksi Draft Tugas (`screen-02-preview`)

```markdown
An editorial, high-precision two-column split-screen preview and validation workspace for university students to review and correct assignment details extracted by Gemini API before saving.

**DESIGN SYSTEM (REQUIRED):**
- Platform: Responsive Web (Side-by-side desktop view, vertically stacked on mobile 360px)
- Theme: Pristine Light Mode (WCAG AAA compliance, clean academic aesthetic)
- Background Canvas: Slate-50 (#F8FAFC)
- Card Surfaces: Pure White (#FFFFFF) with 1px hairline border (#E2E8F0)
- Primary CTA: Emerald Green (#059669) for "Simpan tugas"
- Source Text Container: Soft Slate-100 (#F1F5F9) background
- Status Badges: Amber-50 (#FFFBEB) with Amber-600 text for "Perlu dilengkapi"
- Typography: Plus Jakarta Sans / Inter

**VISUAL & IMAGERY ASSETS (REQUIRED):**
- Bespoke Semantic SVGs: Quote evidence badge indicating source citation, calendar warning triangle, verified extraction badge.
- Interactive requirement tag chips with clear remove icons.

**Page Structure & Components:**
1. **Workspace Header:** Modal/Page title "Periksa & Koreksi Hasil Ekstraksi", subtitle "Bandingkan teks asli pengumuman dengan draft tugas terstruktur", and top-right dismiss button.
2. **Two-Column Comparison Layout:**
   - **Left Column (40% Width - Teks Sumber Asli):**
     - Structured container with subtle gray background `#F1F5F9`.
     - Header "Pengumuman Asli" with copy button.
     - Raw announcement text displayed safely with preserved line breaks and evidence highlight chips.
   - **Right Column (60% Width - Form Koreksi Terstruktur):**
     - Field "Judul Tugas" (Required, max 150 chars, clear red validation text if empty).
     - Field "Mata Kuliah" (Optional, max 100 chars).
     - Field "Deskripsi Singkat" (Multi-line summary).
     - Field "Batas Pengumpulan" (Split row: Tanggal YYYY-MM-DD + Jam HH:mm). Clearly displays "Perlu dilengkapi" badge if date is missing, or "Jam tidak disebutkan" if only date is available. No auto-filled 23:59.
     - Ambiguous Deadline Warning Box: Amber alert box explaining ambiguous deadlines (e.g. "Jumat depan") and prompting user to verify.
     - Field "Ketentuan dari Pengumuman": Interactive list of chips/tags (e.g., "Format PDF", "Maks 3 anggota", "Kumpul di LMS") that can be edited or deleted.
3. **Bottom Sticky Action Bar:**
   - Flat Ghost Button: "Batal" (closes preview without saving anything).
   - Solid Emerald CTA Button: "Simpan tugas" (enforces validation, triggers storage callback, displays loading spinner during save).
```
