/**
 * Realistic Development Fixture for TugasIn Dashboard
 * Used exclusively for local development and previewing all edge cases.
 * As required by PRD and AGENTS.md:
 * - Kept separate from actual user storage.
 * - Covers: overdue, upcoming, date without time, no deadline, completed, null course, empty checklist.
 */

import { Task } from '../types/task';

export const MOCK_TASKS: Task[] = [
  {
    id: 'task-01-overdue',
    title: 'Tugas 3: Implementasi REST API Express & SQLite',
    course: 'Pemrograman Web',
    description: 'Bangun endpoint CRUD autentikasi JWT dan koneksi database SQLite sesuai spesifikasi modul praktikum.',
    sourceText: 'Tugas 3 Web: Buat REST API Express + SQLite. Kumpulkan paling lambat 20 Oktober 2026 pukul 23:59 WIB.',
    sourceMessageDate: '2026-10-15',
    dueDate: '2026-10-20',
    dueTime: '23:59',
    sourceTimezone: 'WIB',
    displayTimezone: 'WIB',
    requirements: ['Express.js', 'SQLite3', 'JWT Auth', 'Dokumentasi Postman'],
    status: 'in_progress',
    checklist: [
      { id: 'c-1', text: 'Inisialisasi repo dan setup Express server', completed: true, origin: 'ai' },
      { id: 'c-2', text: 'Desain skema tabel users & items di SQLite', completed: true, origin: 'ai' },
      { id: 'c-3', text: 'Implementasi middleware otentikasi JWT', completed: true, origin: 'ai' },
      { id: 'c-4', text: 'Buat controller CRUD dan validasi request', completed: false, origin: 'manual' },
      { id: 'c-5', text: 'Ekspor koleksi Postman untuk pengujian', completed: false, origin: 'ai' },
    ],
    createdAt: '2026-10-15T10:00:00.000Z',
    updatedAt: '2026-10-19T14:30:00.000Z',
  },
  {
    id: 'task-02-imminent',
    title: 'Wireframe & Prototipe Interaktif Aplikasi Perpustakaan Kampus',
    course: 'Desain Antarmuka UI/UX',
    description: 'Buat high-fidelity wireframe dan flow peminjaman buku menggunakan Figma, maksimal 3 orang per kelompok.',
    sourceText: 'Untuk mata kuliah UI/UX, buat wireframe aplikasi perpustakaan. Maksimal 3 anggota per kelompok. Kumpulkan PDF pada 22 Oktober 2026 pukul 23.59 WIB melalui LMS.',
    sourceMessageDate: '2026-10-17',
    dueDate: '2026-10-22',
    dueTime: '23:59',
    sourceTimezone: 'WIB',
    displayTimezone: 'WIB',
    requirements: ['Maksimal 3 anggota per kelompok', 'Format PDF dan tautan Figma prototype', 'Kumpul via LMS'],
    status: 'not_started',
    checklist: [
      { id: 'c-6', text: 'Penyusunan user persona dan problem statement', completed: false, origin: 'ai' },
      { id: 'c-7', text: 'Pembuatan sketsa kasar user journey flow', completed: false, origin: 'ai' },
      { id: 'c-8', text: 'Desain antarmuka high-fidelity di Figma', completed: false, origin: 'ai' },
      { id: 'c-9', text: 'Ekspor PDF rangkuman dan submit ke LMS', completed: false, origin: 'manual' },
    ],
    createdAt: '2026-10-17T08:15:00.000Z',
    updatedAt: '2026-10-17T08:15:00.000Z',
  },
  {
    id: 'task-03-no-time',
    title: 'Laporan Eksplorasi Model Klasifikasi Decision Tree',
    course: 'Kecerdasan Buatan',
    description: 'Analisis akurasi algoritma C4.5 pada dataset Iris dan buat grafik confusion matrix.',
    sourceText: 'Pengumuman AI: Laporan klasifikasi decision tree dikumpulkan tanggal 24 Oktober 2026.',
    sourceMessageDate: '2026-10-18',
    dueDate: '2026-10-24',
    dueTime: null, // Tanpa jam -> harus tampil "Batas tanggal 24 Okt 2026 · jam tidak disebutkan"
    sourceTimezone: null,
    displayTimezone: 'WIB',
    requirements: ['Format laporan IEEE 2 kolom', 'Sertakan file Jupyter Notebook .ipynb'],
    status: 'in_progress',
    checklist: [
      { id: 'c-10', text: 'Preprocessing dataset dan splitting train-test', completed: true, origin: 'ai' },
      { id: 'c-11', text: 'Training model DecisionTreeClassifier', completed: true, origin: 'ai' },
      { id: 'c-12', text: 'Plot visualisasi pohon dan confusion matrix', completed: false, origin: 'ai' },
    ],
    createdAt: '2026-10-18T11:20:00.000Z',
    updatedAt: '2026-10-20T09:10:00.000Z',
  },
  {
    id: 'task-04-no-deadline',
    title: 'Latihan Mandiri Normalisasi Basis Data Relasional (1NF - 3NF)',
    course: null, // Mata kuliah kosong -> menguji penanganan null course
    description: 'Kerjakan soal latihan normalisasi pada modul bab 4 sebagai persiapan kuis minggu depan.',
    sourceText: 'Pelajari bab 4 dan coba normalisasi tabel transaksi sampai 3NF.',
    sourceMessageDate: null,
    dueDate: null, // Tanpa deadline -> harus tampil "Belum ada deadline"
    dueTime: null,
    sourceTimezone: null,
    displayTimezone: 'WIB',
    requirements: [],
    status: 'not_started',
    checklist: [], // Checklist kosong -> menguji zero division safe
    createdAt: '2026-10-19T13:00:00.000Z',
    updatedAt: '2026-10-19T13:00:00.000Z',
  },
  {
    id: 'task-05-completed',
    title: 'Dokumen Spesifikasi Kebutuhan Perangkat Lunak (SKPL)',
    course: 'Pengantar Rekayasa Perangkat Lunak',
    description: 'Penyusunan bab 1 pendahuluan dan bab 2 deskripsi umum sistem e-learning kampus.',
    sourceText: 'Tugas dokumen SKPL selesai dan telah dinilai asisten lab.',
    sourceMessageDate: '2026-10-10',
    dueDate: '2026-10-19',
    dueTime: '17:00',
    sourceTimezone: 'WIB',
    displayTimezone: 'WIB',
    requirements: ['Standar IEEE 830', 'Format DOCX/PDF'],
    status: 'done', // Selesai -> TIDAK boleh berlabel terlambat meski 19 Okt sudah lewat
    checklist: [
      { id: 'c-13', text: 'Identifikasi kebutuhan fungsional & nonfungsional', completed: true, origin: 'ai' },
      { id: 'c-14', text: 'Diagram use case dan skenario interaksi', completed: true, origin: 'ai' },
      { id: 'c-15', text: 'Tinjauan akhir dan submit ke asisten praktikum', completed: true, origin: 'manual' },
    ],
    createdAt: '2026-10-10T07:00:00.000Z',
    updatedAt: '2026-10-19T16:45:00.000Z',
  },
];
