import React, { useState } from 'react';
import { Calendar, ArrowLeft, FileText, Users, MessageSquare, ExternalLink, Download } from 'lucide-react';
import { TaskChecklist } from './components/checklist/TaskChecklist';
import { Task } from './types/task';
import { ChecklistItemData } from './types/checklist';

const INITIAL_TASK: Task = {
  id: 'task-wireframe-01',
  title: 'Tugas Wireframe Aplikasi Perpustakaan',
  course: 'Pemrograman Web (IF-301)',
  description: 'Membuat rancangan wireframe low-fidelity untuk sistem peminjaman dan katalog buku digital.',
  sourceText: 'Untuk mata kuliah UI/UX, buat wireframe aplikasi perpustakaan. Maksimal 3 anggota per kelompok. Kumpulkan PDF pada 21 Oktober 2026 pukul 23.59 WIB melalui LMS.',
  sourceMessageDate: '2026-10-14',
  dueDate: '2026-10-21',
  dueTime: '23:59',
  displayTimezone: 'WIB',
  status: 'in_progress',
  requirements: [
    'Maksimal 3 anggota per kelompok',
    'Format pengumpulan PDF melalui portal LMS',
    'Sertakan user flow lengkap dan wireframe low-fidelity semua alur utama',
  ],
  checklist: [
    {
      id: 'step-1',
      text: 'Bentuk kelompok maksimal 3 mahasiswa dan tentukan ketua',
      completed: true,
      origin: 'ai',
    },
    {
      id: 'step-2',
      text: 'Buat dokumen user flow peminjaman dan pengembalian buku',
      completed: true,
      origin: 'ai',
    },
    {
      id: 'step-3',
      text: 'Rancang wireframe low-fidelity halaman katalog dan detail buku',
      completed: false,
      origin: 'ai',
    },
    {
      id: 'step-4',
      text: 'Kompilasi wireframe ke dalam format PDF sesuai ketentuan',
      completed: false,
      origin: 'ai',
    },
    {
      id: 'step-5',
      text: 'Submit PDF ke portal LMS sebelum batas waktu 23.59 WIB',
      completed: false,
      origin: 'ai',
    },
  ],
  createdAt: '2026-10-14T08:00:00Z',
  updatedAt: '2026-10-21T10:00:00Z',
};

const STORAGE_KEY = 'tugasin_active_task_detail';

export const App: React.FC = () => {
  const [task, setTask] = useState<Task>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_TASK;
  });

  // Sinkronisasi penyimpanan tugas bersama ke localStorage
  const handleUpdateChecklist = (newChecklist: ChecklistItemData[]) => {
    setTask((prev) => {
      const updated: Task = {
        ...prev,
        checklist: newChecklist,
        updatedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Gagal menyimpan tugas ke localStorage:', err);
      }
      return updated;
    });
  };

  const resetToEmptyState = () => {
    const emptyTask: Task = {
      ...task,
      checklist: [],
      updatedAt: new Date().toISOString(),
    };
    setTask(emptyTask);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(emptyTask));
  };

  const resetToDefaultSample = () => {
    setTask(INITIAL_TASK);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TASK));
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-hairline">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
              T
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-ink">TugasIn</span>
                <span className="hidden sm:inline text-xs text-ink-muted">· Dari chat jadi checklist</span>
              </div>
              <div className="text-xs text-ink-muted">
                Dashboard / Pemrograman Web / Tugas Wireframe
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <img
                src="/assets/images/student-avatar.jpg"
                alt="Foto Profil Mahasiswa"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-ink leading-tight">Rian Pratama</p>
                <p className="text-[10px] text-ink-muted font-medium">NIM 13522041</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Navigasi Kembali */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-ink-muted hover:text-ink transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Tugas</span>
          </button>

          {/* Quick Demo Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetToEmptyState}
              className="px-2.5 py-1 text-[11px] font-semibold text-ink-muted hover:text-ink bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              title="Kosongkan checklist untuk melihat Empty State"
            >
              Simulasi Empty State
            </button>
            <button
              type="button"
              onClick={resetToDefaultSample}
              className="px-2.5 py-1 text-[11px] font-semibold text-accent hover:text-accent-hover bg-blue-50 hover:bg-blue-100 rounded-lg transition"
              title="Reset ke contoh awal"
            >
              Reset Data Contoh
            </button>
          </div>
        </div>

        {/* Task Context Card */}
        <div className="bg-surface rounded-2xl p-6 border border-hairline shadow-sm space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent-soft text-accent-ink border border-blue-200">
                {task.course}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                Sedang Dikerjakan
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>21 Okt 2026, 23:59 WIB</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
              {task.title}
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              {task.description}
            </p>
          </div>

          {/* Ketentuan Resmi Pengumuman Dosen (Terpisah dari Saran AI) */}
          <div className="border-l-4 border-blue-500 bg-slate-50/80 p-4 rounded-r-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-ink">
              <FileText className="w-4 h-4 text-accent" />
              <span>Ketentuan Resmi dari Pengumuman Dosen</span>
            </div>
            <ul className="text-xs sm:text-sm text-ink-muted space-y-1 list-disc list-inside">
              {task.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Primary AI Task Checklist Component */}
        <TaskChecklist
          taskId={task.id}
          taskTitle={task.title}
          taskDescription={task.description}
          taskRequirements={task.requirements}
          initialChecklist={task.checklist}
          onUpdateChecklist={handleUpdateChecklist}
        />

        {/* Supporting Context Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-surface rounded-xl p-4 border border-hairline flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-accent flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-ink">Lampiran Panduan</p>
                <p className="text-ink-muted text-[11px]">Slide-Kuliah-07.pdf</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-ink-muted hover:text-ink cursor-pointer" />
          </div>

          <div className="bg-surface rounded-xl p-4 border border-hairline flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-success flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-ink">Anggota Kelompok</p>
                <p className="text-ink-muted text-[11px]">3 dari 3 mahasiswa</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-success">Lengkap</span>
          </div>

          <div className="bg-surface rounded-xl p-4 border border-hairline flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-ink">Sumber Asli</p>
                <p className="text-ink-muted text-[11px]">Grup WhatsApp IF-301</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-ink-muted hover:text-ink cursor-pointer" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-hairline bg-surface text-center text-xs text-ink-muted">
        <p>TugasIn — Dari chat jadi checklist · Proyek Kelompok Hackathon 2026</p>
      </footer>
    </div>
  );
};
export default App;
