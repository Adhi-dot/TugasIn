# Panduan Integrasi Fitur Checklist AI — TugasIn

Dokumen ini ditujukan untuk **Leader**, **Member Pengelolaan Tugas/Detail**, dan **Member Backend Ekstraksi** sebagai panduan integrasi fitur Checklist AI pada branch `feat/checklist`.

---

## 1. Kontrak Endpoint Backend

### `POST /api/generate-checklist`

Memecah detail tugas yang telah diperiksa pengguna menjadi 3–7 langkah kerja konkret berbahasa Indonesia.

#### Request Payload
```json
{
  "title": "Tugas Wireframe Aplikasi Perpustakaan",
  "description": "Membuat wireframe low-fidelity untuk katalog dan peminjaman buku.",
  "requirements": [
    "Maksimal 3 anggota per kelompok",
    "Format pengumpulan PDF melalui LMS"
  ]
}
```

* **Validasi Request (Server-side)**:
  - `title`: Wajib, non-whitespace, minimal 1 karakter, maksimal 150 karakter.
  - `description`: Opsional string, maksimal 2.000 karakter.
  - `requirements`: Opsional array string, maksimal 20 item, masing-masing maksimal 300 karakter.
  - *Jika validasi gagal*: Mengembalikan HTTP `400 Bad Request` dan **Gemini tidak dipanggil**.

#### Response Sukses (HTTP 200 OK)
```json
{
  "steps": [
    "Bentuk kelompok maksimal 3 mahasiswa dan tentukan ketua",
    "Buat dokumen user flow peminjaman dan pengembalian buku",
    "Rancang wireframe low-fidelity halaman katalog dan detail buku",
    "Kompilasi wireframe ke dalam format PDF sesuai ketentuan",
    "Submit PDF ke portal LMS sebelum batas waktu 23.59 WIB"
  ]
}
```

* **Validasi Server terhadap Output AI**:
  - Wajib menghasilkan array berisi 3 sampai 7 item.
  - Tiap item wajib berupa string non-kosong (3–250 karakter).
  - Jika format output rusak: Mengembalikan HTTP `502 Bad Gateway` (`INVALID_AI_RESPONSE`).

#### Error Response Format
```json
{
  "error": {
    "code": "TIMEOUT",
    "message": "Permintaan pembuatan langkah pengerjaan melebihi batas waktu 30 detik."
  }
}
```

| Kode Error | HTTP Status | Penjelasan |
|---|---|---|
| `INVALID_INPUT` | 400 | Data request tidak memenuhi batasan skema validasi Zod. |
| `UNCONFIGURED_SERVER` | 503 | Kunci API Gemini belum dikonfigurasi di environment server. |
| `SERVICE_OVERLOAD_OR_QUOTA` | 429 | Layanan Gemini sedang sibuk atau kuota tercapai. |
| `TIMEOUT` | 504 | Pemanggilan melampaui batas waktu aplikasi 30 detik. |
| `NETWORK_ERROR` | 500 | Gangguan konektivitas atau kegagalan jaringan eksternal. |
| `INVALID_AI_RESPONSE` | 502 | Respons model kosong, gagal diparse, atau di luar 3–7 langkah. |

---

## 2. Penggunaan Client Gemini Bersama

Modul terletak pada `src/server/gemini/geminiClient.ts`.
* Menggunakan antarmuka standar `IGeminiClient` dengan metode `generateChecklist(input)`.
* Menyediakan instance terpusat `defaultGeminiService` yang membaca `GEMINI_API_KEY` dari server environment.
* Mendukung pergantian adapter jika Member Ekstraksi menyediakan client Gemini terpusat lainnya.

---

## 3. Komponen Frontend & Props

### Komponen Utama: `<TaskChecklist />`
File: `src/components/checklist/TaskChecklist.tsx`

```tsx
import { TaskChecklist } from './components/checklist/TaskChecklist';

<TaskChecklist
  taskId={task.id}
  taskTitle={task.title}
  taskDescription={task.description}
  taskRequirements={task.requirements}
  initialChecklist={task.checklist}
  onUpdateChecklist={(newChecklist) => handleSaveToStorage(task.id, newChecklist)}
/>
```

#### TypeScript Props Interface
```ts
export interface TaskChecklistProps {
  readonly taskId: string;
  readonly taskTitle: string;
  readonly taskDescription?: string;
  readonly taskRequirements?: string[];
  readonly initialChecklist?: ChecklistItemData[];
  readonly onUpdateChecklist?: (items: ChecklistItemData[]) => void;
}
```

#### Model Data Item Checklist
```ts
export interface ChecklistItemData {
  id: string;              // Dibuat oleh aplikasi (misal: "chk-172950-0-a1b2")
  text: string;            // Teks langkah pengerjaan
  completed: boolean;       // Status centang
  origin: 'ai' | 'manual'; // Asal langkah ('ai' untuk hasil generasi)
}
```

---

## 4. Aturan State, Progres & Proteksi Data

1. **Pemisahan Konteks**:
   - Label **✨ Saran AI** selalu ditampilkan jelas di samping judul "Langkah Pengerjaan".
   - Ketentuan resmi dosen tetap berada di wadah terpisah (*Ketentuan Resmi Pengumuman*).
2. **Perhitungan Progres**:
   - Progres pecahan (`completed / total`) dan persentase dihitung secara aman (`total > 0 ? Math.round(...) : 0`) sehingga bebas pembagian nol saat checklist kosong.
   - Progres mencapai 100% **tidak otomatis** mengubah status tugas menjadi "Selesai" (kendali tetap di tangan pengguna karena tugas mungkin belum dikumpulkan).
3. **Edit Langkah**:
   - Mendukung inline editing dengan tombol *Simpan* dan *Batal* (didukung keyboard shortcut `Enter` dan `Esc`).
   - Teks hasil edit tidak boleh kosong atau hanya spasi.
   - Mengedit teks mempertahankan `id`, `completed`, dan `origin: 'ai'`.
4. **Proteksi Pembuatan Ulang (Regenerate Guard)**:
   - Jika checklist sudah ada, tombol berubah menjadi *Buat ulang*.
   - Mengklik tombol membuka modal konfirmasi: *"Buat ulang langkah pengerjaan? Seluruh langkah dan progres saat ini akan digantikan dengan saran baru."*
   - Jika dibatalkan: modal tertutup, tidak ada request ke server, dan data lama tetap utuh.
   - Jika request gagal: checklist lama dipertahankan.
   - Jika berhasil: seluruh checklist digantikan secara atomik dengan ID baru dan `completed: false`.
5. **Proteksi Stale Request**:
   - Jika `taskId` berubah atau tampilan berpindah saat request sedang berlangsung, respons yang datang kemudian akan dibuang dan tidak dipasang ke tugas lain.

---

## 5. Environment & Kebutuhan Konfigurasi

Buat file `.env` di root project:
```bash
GEMINI_API_KEY=AIzaSy...
```
* **Keamanan**: `GEMINI_API_KEY` tidak boleh di-commit ke Git dan tidak di-bundle ke dalam kode frontend client publik.

---

## 6. Cara Menjalankan & Memverifikasi

### Menjalankan Development Server:
```bash
npm run dev
```
Buka browser di `http://localhost:5173`. Anda dapat mencoba:
* Tampilan Checklist AI interaktif pada Detail Tugas.
* Mencentang dan mengedit langkah secara inline.
* Tombol *Simulasi Empty State* untuk melihat tampilan sebelum AI membuat langkah.
* Tombol *Buat ulang* untuk menguji modal konfirmasi.

### Menjalankan Automated Test Suite:
```bash
npx tsx --test tests/*.test.ts
```
Hasil: 12 pengujian lulus (validasi request, guard Gemini, validasi output AI, kalkulasi progres, toggle checkbox, edit teks).
