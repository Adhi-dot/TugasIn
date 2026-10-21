# PRD TugasIn

**Tagline:** Dari chat jadi checklist.  
**Versi:** 1.0 — rancangan MVP mini hackathon  
**Tanggal:** 17 Oktober 2026  
**Tema:** Otomatisasi kerja/kuliah  
**Status:** Siap dipakai sebagai acuan awal implementasi; belum merupakan produk yang sudah dibangun.

## 1. Ringkasan produk

TugasIn adalah website yang mengubah pengumuman tugas berbahasa Indonesia menjadi kartu tugas terstruktur menggunakan Gemini API. Pengguna menempelkan teks dari grup kelas atau LMS, memeriksa hasil ekstraksi, lalu menyimpannya ke dashboard yang diurutkan berdasarkan deadline. Gemini juga dapat menyarankan langkah pengerjaan sebagai checklist.

**Alur utama:** tempel pengumuman → ekstraksi Gemini → periksa dan koreksi → simpan tugas → pantau progres.

Manfaat utama adalah mengurangi pekerjaan memindahkan judul, mata kuliah, tenggat, dan ketentuan secara manual. AI memiliki peran langsung dalam alur tersebut, sehingga manfaat otomatisasinya bisa terlihat saat demo.

## 2. Masalah dan pengguna

Hipotesis masalah yang perlu divalidasi:

- Pengumuman tugas tersebar di chat dan LMS sehingga detail mudah terlewat.
- Mahasiswa perlu membaca ulang pesan untuk mencatat deadline dan format pengumpulan.
- Tugas besar sulit dimulai karena belum dipecah menjadi langkah kecil.

**Pengguna utama:** mahasiswa yang menerima pengumuman tugas melalui teks dan ingin mengelola tugas pribadinya dalam satu tempat.

**Contoh situasi:** seorang mahasiswa menerima pengumuman tugas desain antarmuka, menempelkannya ke TugasIn, lalu mendapatkan kartu dengan ketentuan PDF, jumlah anggota, dan tenggat yang bisa diperiksa sebelum disimpan.

## 3. Tujuan dan ukuran keberhasilan

Angka berikut adalah target penerimaan MVP, bukan hasil pengujian yang sudah tercapai.

| Tujuan | Target uji |
|---|---|
| Mempercepat pencatatan | Minimal 4 dari 5 pengguna uji berhasil menyimpan tugas pertama dalam 60 detik sejak mulai menempel teks, pada koneksi normal |
| Mengambil informasi eksplisit dengan tepat | Minimal 90% kecocokan field pada 10 pengumuman uji berlabel; mencakup judul, mata kuliah, tanggal, waktu, dan ketentuan |
| Tidak mengisi detail tanpa dasar | Seluruh kasus uji dengan deadline tidak disebutkan menghasilkan deadline kosong dan tanda perlu dilengkapi |
| Menyimpan progres | Tugas, status, dan checklist tetap ada setelah refresh pada browser yang sama |
| Menunjukkan integrasi AI nyata | Demo berhasil melakukan ekstraksi dan pembuatan checklist melalui Gemini API langsung |

Penilaian judul memakai kesetaraan makna, bukan kecocokan teks persis. Tanggal dan waktu yang eksplisit harus sama dengan sumber. Pengujian dilakukan manual; dashboard analitik tidak diperlukan.

## 4. Asumsi dan keputusan cakupan

- Jumlah anggota tim, durasi hackathon, stack, dan aturan deployment belum diberikan.
- MVP dipakai individu, tanpa login atau kolaborasi antaranggota.
- Tugas disimpan di localStorage pada browser pengguna. Data tidak tersinkron lintas perangkat dan bisa hilang jika penyimpanan browser dihapus.
- Backend hanya memproses permintaan Gemini; database server belum diperlukan.
- Input berupa teks bahasa Indonesia, maksimal 5.000 karakter.
- Satu proses menghasilkan satu tugas. Input yang jelas memuat beberapa tugas ditandai agar pengguna memisahkannya, tanpa menyimpan hasil parsial secara diam-diam.
- UI berbahasa Indonesia dan dapat digunakan di desktop maupun ponsel.

## 5. Cakupan fitur

| Prioritas | Fitur | Hasil yang diharapkan |
|---|---|---|
| P0 — wajib | Input pengumuman dan ekstraksi Gemini | Teks menjadi draft tugas terstruktur |
| P0 — wajib | Preview dan koreksi | Pengguna memeriksa hasil sebelum menyimpan |
| P0 — wajib | Dashboard deadline | Tugas terlihat berurutan dan dapat difilter menurut status |
| P0 — wajib | Pengelolaan tugas dan penyimpanan lokal | Tambah manual, edit, hapus, ubah status, dan pemulihan saat refresh |
| P0 — wajib | Checklist saran Gemini | Tugas dapat dipecah menjadi 3–7 langkah yang dapat diedit dan dicentang |
| P0 — wajib | Loading dan penanganan gagal | Input tetap aman saat permintaan gagal; pengguna bisa mencoba lagi |
| P1 — jika sempat | Ekspor kalender melalui file .ics | Tenggat yang sudah lengkap dapat dimasukkan ke kalender |
| P1 — jika sempat | Pencarian judul/mata kuliah | Tugas mudah ditemukan ketika daftar bertambah |

**Di luar MVP:** integrasi langsung WhatsApp/LMS, login, sinkronisasi cloud, OCR gambar, unggah PDF, transkripsi audio, chatbot umum, pembagian kerja kelompok, penjadwalan belajar otomatis, dan pengingat email/push. Indikator deadline di dashboard bukan notifikasi latar belakang.

## 6. Alur dan layar

### 6.1 Dashboard

Menampilkan jumlah tugas aktif, tugas selesai, daftar tugas, filter status, tombol **Tambah dari pengumuman**, dan **Tambah manual**. Kartu memuat judul, mata kuliah bila tersedia, deadline atau label **Belum ada deadline**, status, serta progres checklist.

Urutan awal: tugas aktif yang terlambat → tugas aktif dengan tenggat terdekat → tugas aktif tanpa tenggat → tugas selesai. Di dalam kelompok terlambat, tenggat paling lama ditempatkan pertama. Status selesai menghilangkan label terlambat.

### 6.2 Input pengumuman

Pengguna menempel teks dan menekan **Ambil tugas**. Tombol nonaktif ketika input kosong atau sedang diproses. Pengguna boleh mengisi tanggal pesan asal jika pengumuman memakai istilah relatif seperti “besok”.

Saat pertama kali memproses, tampilkan keterangan singkat: “Teks pengumuman dikirim ke Gemini untuk diproses.” Tidak perlu dialog persetujuan tambahan.

### 6.3 Preview hasil

Teks sumber ditampilkan bersama field yang bisa diedit: judul, mata kuliah, deskripsi, tanggal, waktu, zona waktu, dan ketentuan. Informasi yang kurang atau ambigu diberi label **Perlu dilengkapi**.

Pengguna menekan **Simpan tugas** untuk memasukkan hasil ke dashboard. Menutup preview tanpa menyimpan tidak membuat tugas baru.

### 6.4 Detail tugas

Pengguna dapat mengedit data, mengubah status, menghapus tugas dengan konfirmasi singkat, dan menekan **Buat langkah pengerjaan**. Checklist diberi label **Saran AI**, terpisah dari **Ketentuan dari pengumuman**.

Jika checklist sudah ada, pembuatan ulang harus meminta konfirmasi sebelum menggantinya. Pembuatan ulang yang gagal mempertahankan checklist lama.

## 7. User stories dan acceptance criteria

Estimasi poin bersifat relatif untuk diskusi tim, bukan perkiraan jam. Semua cerita diprioritaskan P0. UI dapat dibuat menggunakan fixture agar pengembangan tidak menunggu integrasi Gemini.

### US-01 — Mengambil tugas dari pengumuman — 5 poin

Sebagai mahasiswa, saya ingin menempel pengumuman agar detail tugas tidak perlu diketik ulang.

- **Diberikan** satu pengumuman berisi tugas, **ketika** ekstraksi berhasil, **maka** preview menampilkan draft tanpa langsung menyimpannya.
- **Diberikan** input kosong atau lebih dari 5.000 karakter, **ketika** pengguna mencoba memproses, **maka** validasi tampil dan API tidak dipanggil.
- **Diberikan** teks tanpa tugas atau berisi beberapa tugas yang berbeda, **ketika** diproses, **maka** tampil penjelasan yang sesuai dan pengguna diminta memperbaiki input.
- **Diberikan** API timeout, kuota habis, atau respons tidak valid, **ketika** pemrosesan gagal, **maka** teks sumber tetap ada dan tersedia tombol coba lagi serta tambah manual.
- **Diberikan** permintaan sedang berlangsung, **ketika** tombol ditekan berulang, **maka** hanya satu permintaan yang berjalan.

### US-02 — Memeriksa dan mengoreksi hasil — 3 poin

Sebagai mahasiswa, saya ingin mengoreksi hasil ekstraksi agar tugas yang tersimpan sesuai pengumuman.

- **Diberikan** hasil ekstraksi, **ketika** preview dibuka, **maka** teks asli dan field hasil dapat dibandingkan.
- **Diberikan** judul kosong, **ketika** pengguna menyimpan, **maka** penyimpanan ditolak dengan pesan di field judul.
- **Diberikan** tanggal atau mata kuliah tidak disebutkan, **ketika** preview dibuka, **maka** field kosong ditandai dan tetap bisa dilengkapi secara manual.
- **Diberikan** draft valid, **ketika** disimpan, **maka** tepat satu kartu dibuat; pembatalan tidak menambahkan kartu.

### US-03 — Melihat prioritas tenggat — 3 poin

Sebagai mahasiswa, saya ingin melihat urutan deadline agar tahu tugas mana yang perlu diperhatikan.

- **Diberikan** tugas dengan tenggat berbeda, **ketika** dashboard dibuka, **maka** urutannya mengikuti aturan bagian 6.1.
- **Diberikan** tenggat yang sudah lewat dan status belum selesai, **ketika** dashboard dibuka, **maka** kartu berlabel **Terlambat**.
- **Diberikan** tugas tanpa tanggal, **ketika** kartu ditampilkan, **maka** labelnya **Belum ada deadline**, tanpa tanggal buatan.
- **Diberikan** filter status dipilih, **ketika** daftar ditampilkan, **maka** hanya tugas sesuai status yang terlihat dan empty state tersedia jika hasil kosong.

### US-04 — Mengelola tugas — 3 poin

Sebagai mahasiswa, saya ingin memperbarui tugas agar daftar mengikuti progres sebenarnya.

- **Diberikan** formulir manual dengan judul valid, **ketika** disimpan, **maka** tugas dibuat tanpa memanggil Gemini.
- **Diberikan** tugas tersimpan, **ketika** field atau status diubah, **maka** perubahan muncul pada kartu dan tersimpan secara lokal.
- **Diberikan** status, **ketika** diubah, **maka** pilihannya terbatas pada **Belum mulai**, **Dikerjakan**, dan **Selesai**.
- **Diberikan** tugas dihapus dan pengguna mengonfirmasi, **ketika** penghapusan selesai, **maka** tugas hilang; pembatalan mempertahankannya.

### US-05 — Mendapatkan langkah pengerjaan — 5 poin

Sebagai mahasiswa, saya ingin mendapatkan saran langkah agar lebih mudah mulai mengerjakan tugas.

- **Diberikan** judul dan deskripsi tugas, **ketika** pembuatan checklist berhasil, **maka** tampil 3–7 langkah singkat berbahasa Indonesia.
- **Diberikan** checklist hasil AI, **ketika** ditampilkan, **maka** label **Saran AI** terlihat dan ketentuan asli tetap terpisah.
- **Diberikan** langkah checklist, **ketika** diedit atau dicentang, **maka** teks/progres diperbarui dan tersimpan.
- **Diberikan** pembuatan checklist gagal, **ketika** pesan gagal muncul, **maka** data tugas dan checklist sebelumnya tetap ada.
- **Diberikan** seluruh langkah dicentang, **ketika** progres mencapai 100%, **maka** status tugas tetap dikendalikan pengguna karena pekerjaan mungkin belum dikumpulkan.

### US-06 — Memulihkan data setelah refresh — 2 poin

Sebagai mahasiswa, saya ingin tugas tetap tersimpan agar tidak perlu mengulang pencatatan.

- **Diberikan** tugas tersimpan, **ketika** halaman di-refresh, **maka** field, status, dan checklist dipulihkan pada browser yang sama.
- **Diberikan** localStorage kosong, **ketika** aplikasi dibuka, **maka** empty state mengarahkan pengguna menambah tugas.
- **Diberikan** data lokal rusak, **ketika** aplikasi dibuka, **maka** aplikasi tetap tampil dan menawarkan reset dengan konfirmasi tanpa menghapus otomatis.
- **Diberikan** penyimpanan browser tidak tersedia atau penuh, **ketika** perubahan gagal disimpan, **maka** tampil pesan bahwa perubahan belum tersimpan dan data yang sedang terbuka dipertahankan di memori.

## 8. Perilaku AI dan aturan deadline

### Ekstraksi

Gemini mengambil informasi yang ada di sumber: judul, mata kuliah, deskripsi, tanggal, waktu, zona waktu, dan ketentuan. Field yang tidak tersedia bernilai null atau array kosong. Backend memvalidasi hasil sebelum mengirimkannya ke UI.

Pengumuman diperlakukan sebagai data; instruksi di dalam teks tidak boleh mengganti aturan ekstraksi. Gemini tidak menjalankan tool atau tindakan eksternal dari isi pengumuman.

### Deadline

- Tanggal, jam, dan zona waktu adalah field terpisah. Jangan otomatis mengisi jam 23.59 atau tahun berjalan sebagai hasil ekstraksi.
- Tanggal lengkap tanpa jam ditampilkan sebagai **Batas tanggal … · jam tidak disebutkan**. Indikator terlambat baru aktif setelah tanggal itu berakhir, memakai zona tampilan yang terlihat di UI; ini aturan indikator aplikasi, bukan jam pengumpulan dari dosen.
- Zona tampilan awal mengikuti browser dan dapat dikoreksi. Jika sumber tidak menyebut zona, UI menjelaskan zona tampilan yang dipakai; jangan mengklaimnya berasal dari sumber.
- “Besok” hanya dikonversi jika tanggal pesan asal diketahui. Jika tidak, minta pengguna melengkapi tanggal acuan.
- “Jumat depan”, tanggal tanpa tahun, tanggal tidak valid, atau dua tenggat yang bertentangan ditandai ambigu. Pengguna harus mengoreksi atau menyimpan tanpa deadline.
- Waktu tidak boleh tersimpan tanpa tanggal. Tugas tanpa deadline tetap boleh disimpan.
- Checklist AI tidak menambahkan tenggat, ketentuan wajib, atau estimasi durasi yang seolah berasal dari dosen.

### Pembuatan checklist

Permintaan checklist menggunakan detail tugas yang sudah diperiksa pengguna. Langkah harus berupa tindakan konkret yang relevan. Tidak membuat jawaban tugas lengkap dan tidak mengubah ketentuan pengumuman.

## 9. Kebutuhan data dan integrasi

### Model data minimum

| Field | Tipe | Aturan |
|---|---|---|
| id | string | ID unik yang dibuat aplikasi |
| title | string | Wajib, maksimal 150 karakter |
| course | string atau null | Maksimal 100 karakter |
| description | string | Ringkasan tugas |
| sourceText | string | Teks pengumuman; kosong untuk input manual |
| sourceMessageDate | YYYY-MM-DD atau null | Acuan tanggal relatif |
| dueDate | YYYY-MM-DD atau null | Tanggal penuh yang valid |
| dueTime | HH:mm atau null | Hanya jika dueDate tersedia |
| sourceTimezone | string atau null | Zona yang eksplisit disebutkan atau dikonfirmasi pengguna |
| displayTimezone | string | Zona untuk tampilan dan perhitungan indikator |
| requirements | string[] | Ketentuan dari sumber |
| status | enum | not_started, in_progress, done |
| checklist | object[] | id, text, completed, origin: ai/manual |
| createdAt, updatedAt | ISO timestamp | Dibuat aplikasi |

Warning ekstraksi dan potongan teks pendukung ditampilkan di preview untuk membantu pemeriksaan. ID dan timestamp tidak dibuat oleh model.

### Kontrak backend yang diusulkan

| Endpoint | Input | Output |
|---|---|---|
| POST /api/extract-task | text, sourceMessageDate opsional, displayTimezone | resultType: task/no_task/multiple_tasks, draft bila ada, warnings, dan bukti teks untuk field kritis |
| POST /api/generate-checklist | title, description, requirements | steps berisi 3–7 langkah |

- Gunakan structured output dengan skema untuk membatasi bentuk respons Gemini, lalu validasi tipe, panjang, enum, dan tanggal di backend. Bentuk JSON yang valid tidak menjamin isi faktual benar.
- Simpan GEMINI_API_KEY di environment server. Browser hanya memanggil backend; kunci tidak boleh berada di bundle frontend atau repository.
- Batasi ukuran request, panjang respons, dan frekuensi permintaan pada endpoint publik. Nonaktifkan pengiriman berulang selama loading.
- Tetapkan timeout aplikasi 30 detik. Setelah timeout, tampilkan pesan yang bisa ditindaklanjuti. Retry dilakukan pengguna untuk menghindari permintaan berulang tanpa disadari.
- Error dibedakan menjadi input tidak valid, layanan sibuk/kuota, timeout, dan hasil AI tidak dapat diproses. Jangan tampilkan stack trace kepada pengguna.
- Jangan menyimpan isi pengumuman dalam log server. Data tetap dikirim ke penyedia AI untuk diproses; penyimpanan lokal tidak berarti pemrosesan sepenuhnya di perangkat.
- Nama model, kuota, dan biaya perlu dicek saat implementasi menggunakan akun tim; PRD tidak mengasumsikan akses gratis atau model tertentu.

Referensi implementasi: [Gemini API — Structured outputs](https://ai.google.dev/gemini-api/docs/structured-output).

## 10. Kebutuhan nonfungsional

- Tampilan berfungsi pada lebar 360 px dan desktop tanpa gulir horizontal untuk konten utama.
- Form memiliki label, pesan validasi dekat field, fokus keyboard yang terlihat, dan tombol yang dapat dioperasikan dengan keyboard.
- Status dan urgensi memakai teks selain warna. Loading, berhasil, dan gagal memiliki pesan yang jelas.
- Render teks sumber dan keluaran model sebagai teks aman; jangan menyisipkan HTML dari AI secara langsung.
- Target interaksi lokal seperti filter atau mencentang checklist terasa langsung, dengan sasaran di bawah 200 ms pada data demo 100 tugas.
- Target ekstraksi selesai dalam 15 detik pada koneksi normal; 30 detik adalah batas tunggu aplikasi, bukan jaminan layanan Gemini.
- Jangan mengklaim perubahan tersimpan jika operasi penyimpanan lokal gagal.

## 11. Rencana implementasi hackathon

Pembagian berikut berupa persentase waktu efektif karena durasi acara belum diketahui. Estimasi story point perlu dikalibrasi tim sebelum dipakai untuk komitmen.

| Tahap | Porsi | Hasil |
|---|---:|---|
| Tetapkan kontrak data dan wireframe | 10% | Contoh input/output, field preview, layout dashboard |
| Bangun alur manual dan persistence | 25% | Tambah/edit/hapus/status bekerja dan bertahan saat refresh |
| Integrasikan ekstraksi Gemini | 25% | Endpoint, validasi, preview, aturan data ambigu |
| Tambahkan checklist Gemini | 15% | Langkah bisa dibuat, diedit, dicentang, dan disimpan |
| Uji, perbaiki, dan latih demo | 25% | Kasus penting lolos, environment siap, alur presentasi lancar |

**Urutan pemangkasan jika waktu sempit:** hapus P1 seluruhnya, sederhanakan styling tambahan, lalu kurangi variasi filter. Pertahankan ekstraksi nyata, preview yang dapat dikoreksi, dashboard tersimpan, dan checklist sebagai cakupan inti. Perubahan cakupan inti perlu dicatat sebagai revisi PRD.

## 12. Risiko dan mitigasi

| Risiko | Mitigasi dalam MVP |
|---|---|
| AI salah membaca deadline | Tampilkan sumber dan preview; gunakan null serta tanda ambigu; pengguna mengoreksi sebelum simpan |
| API tidak tersedia saat demo | Siapkan tambah manual dan rekaman demo sebagai cadangan; fixture harus berlabel simulasi dan tidak dipresentasikan sebagai panggilan API langsung |
| Kunci API bocor atau endpoint disalahgunakan | Kunci di server, batas input dan request, pesan error aman |
| Tugas lokal hilang saat data browser dibersihkan | Jelaskan penyimpanan pada browser yang sama; sinkronisasi cloud masuk pengembangan selanjutnya |
| Cakupan membesar | Selesaikan P0 sebelum P1; hindari integrasi chat dan login pada MVP |

## 13. Skenario demo

Durasi sasaran: sekitar 2–3 menit.

1. Tunjukkan masalah: satu pengumuman panjang yang perlu dicatat ulang.
2. Tempel contoh berikut dan jalankan Gemini langsung:

   > Untuk mata kuliah UI/UX, buat wireframe aplikasi perpustakaan. Maksimal 3 anggota per kelompok. Kumpulkan PDF pada 21 Oktober 2026 pukul 23.59 WIB melalui LMS.

3. Perlihatkan judul, mata kuliah, ketentuan, dan deadline hasil ekstraksi. Periksa lalu simpan.
4. Buka detail dan buat checklist saran AI, lalu centang satu langkah.
5. Refresh untuk menunjukkan bahwa progres tersimpan.
6. Jika waktu cukup, uji pengumuman tanpa deadline untuk menunjukkan label **Perlu dilengkapi**.

**Kalimat pitch:** “TugasIn mengotomatisasi pencatatan tugas dari pengumuman kelas menjadi daftar kerja yang bisa diperiksa, diurutkan, dan langsung ditindaklanjuti.”

## 14. Definition of Done

- [ ] Seluruh acceptance criteria P0 diverifikasi.
- [ ] Ekstraksi dan checklist benar-benar memanggil Gemini API.
- [ ] Set 10 pengumuman uji mencakup deadline lengkap, tanpa deadline, tanpa jam, tanggal relatif dengan/tanpa acuan, tanggal tanpa tahun, konflik deadline, tanpa tugas, dan beberapa tugas.
- [ ] Input kosong, input terlalu panjang, respons rusak, timeout, dan kuota API ditangani; kegagalan yang sulit direproduksi boleh diuji dengan respons tiruan berlabel pada lingkungan pengembangan.
- [ ] Field tidak tersedia tidak diisi sebagai fakta buatan; saran AI terpisah dari ketentuan sumber.
- [ ] Tambah, edit, hapus, filter, status, checklist, dan refresh berfungsi.
- [ ] Tampilan ponsel dan desktop serta navigasi keyboard diperiksa.
- [ ] Kunci API tidak ditemukan di frontend atau repository; endpoint memvalidasi request dan membatasi penggunaan.
- [ ] Petunjuk menjalankan aplikasi, environment yang dibutuhkan, dan batas penyimpanan lokal terdokumentasi.
- [ ] Alur demo langsung berhasil dijalankan sebelum presentasi.

## 15. Hal yang perlu dikonfirmasi tim

Dokumen ini bisa langsung menjadi acuan MVP dengan asumsi pada bagian 4. Sebelum mengunci jadwal, tim perlu menyepakati durasi acara, pembagian anggota, stack yang dikuasai, akses Gemini API, ketentuan hosting, serta rubrik penilaian lengkap dari panitia. Persyaratan tambahan dari panitia dapat mengubah prioritas dan estimasi.
