import React, { useState, useEffect } from 'react';
import { AnnouncementInputAndPreview } from './components/features/input-preview';
import { Task } from './types/task';
import { CalendarIcon, CheckIcon } from './components/ui/icons';

const LOCAL_STORAGE_KEY = 'tugasin_tasks';

export const App: React.FC = () => {
  // Persistence state bersama sesuai PRD Bagian 4 & US-06
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sinkronkan ke localStorage setiap ada perubahan tugas
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Gagal menyimpan ke localStorage:', e);
    }
  }, [tasks]);

  // Handler integrasi onSaveTask (Kontrak bersama untuk modul Task Management)
  const handleSaveTask = async (newTask: Task): Promise<boolean> => {
    try {
      setTasks((prev) => [newTask, ...prev]);
      return true;
    } catch {
      return false;
    }
  };

  const handleManualAdd = () => {
    alert('Navigasi ke Modal Tambah Manual (Dikelola oleh Member Pengelolaan Tugas).');
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-hairline py-3 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              T
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-ink">TugasIn</span>
              <span className="hidden sm:inline-block ml-2 text-[11px] font-medium text-brand-700 bg-brand-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Dari chat jadi checklist
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleManualAdd}
              className="text-xs font-semibold px-3 py-1.5 rounded-input border border-hairline hover:bg-slate-50 transition-colors text-ink"
            >
              + Tambah Manual
            </button>
            <div className="text-xs text-ink-muted pl-2 border-l border-hairline">
              Tugas Aktif: <strong className="text-brand-700 font-bold">{tasks.length}</strong>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8">
        {/* Modul Utama: Input Pengumuman & Preview Hasil Ekstraksi */}
        <AnnouncementInputAndPreview
          onSaveTask={handleSaveTask}
          onManualAdd={handleManualAdd}
        />

        {/* Section Demonstrasi Tugas Tersimpan (Koleksi yang berhasil disimpan dari alur Preview) */}
        {tasks.length > 0 && (
          <section className="mt-12 pt-8 border-t border-hairline">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-ink">Daftar Tugas Baru Tersimpan</h3>
                <p className="text-xs text-ink-muted">Tugas yang baru saja disimpan melalui modul Preview (Siap diproses modul Dashboard & Checklist).</p>
              </div>
              <span className="text-xs text-ink-subtle">{tasks.length} tugas tersimpan di memori</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map((task) => (
                <div key={task.id} className="bg-surface rounded-card border border-hairline p-4 shadow-sm hover:border-slate-300 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-brand-700 bg-brand-50 border border-emerald-100 px-2 py-0.5 rounded">
                      {task.course || 'Umum'}
                    </span>
                    <span className="text-[11px] text-ink-subtle flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3 text-slate-400" />
                      {task.dueDate ? `${task.dueDate} ${task.dueTime ? `· ${task.dueTime}` : ''}` : 'Belum ada deadline'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-ink mb-1.5">{task.title}</h4>
                  {task.description && (
                    <p className="text-xs text-ink-muted line-clamp-2 mb-3">{task.description}</p>
                  )}

                  {task.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-hairline">
                      {task.requirements.map((req, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckIcon className="w-2.5 h-2.5 text-brand-600" />
                          {req}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline py-6 px-4 text-center text-xs text-ink-subtle bg-surface">
        <p>TugasIn MVP — Otomatisasi Kerja & Kuliah Mahasiswa. Dibuat sesuai PRD Versi 1.0.</p>
      </footer>
    </div>
  );
};

export default App;
