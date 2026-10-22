import React, { useState, useId } from 'react';
import {
  Sparkles,
  MessageSquare,
  Calendar,
  Clock,
  Plus,
  X,
  Copy,
  Check,
  AlertTriangle,
  BookmarkCheck,
  Building,
} from 'lucide-react';
import { TaskDraft } from '../../../types/task';

export interface TaskPreviewModalProps {
  draft: TaskDraft;
  sourceText: string;
  sourceMessageDate?: string | null;
  displayTimezone: string;
  warnings?: string[];
  criticalFieldEvidence?: Record<string, string>;
  onSave: (validatedDraft: TaskDraft, sourceText: string) => Promise<boolean | void> | boolean | void;
  onCancel: () => void;
  className?: string;
}

export const TaskPreviewModal: React.FC<Readonly<TaskPreviewModalProps>> = ({
  draft: initialDraft,
  sourceText,
  sourceMessageDate,
  displayTimezone,
  warnings = [],
  criticalFieldEvidence = {},
  onSave,
  onCancel,
  className = '',
}) => {
  // State koreksi field oleh pengguna
  const [title, setTitle] = useState<string>(initialDraft.title || '');
  const [course, setCourse] = useState<string>(initialDraft.course || '');
  const [description, setDescription] = useState<string>(initialDraft.description || '');
  const [dueDate, setDueDate] = useState<string>(initialDraft.dueDate || '');
  const [dueTime, setDueTime] = useState<string>(initialDraft.dueTime || '');
  const [sourceTimezone] = useState<string>(initialDraft.sourceTimezone || '');
  const [requirements, setRequirements] = useState<string[]>([...(initialDraft.requirements || [])]);
  const [newRequirement, setNewRequirement] = useState<string>('');

  // Validasi & status UI
  const [titleError, setTitleError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const titleInputId = useId();
  const courseInputId = useId();
  const descriptionId = useId();
  const dateInputId = useId();
  const timeInputId = useId();

  // Handler penambahan chip ketentuan pengumuman
  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newRequirement.trim();
    if (trimmed && !requirements.includes(trimmed)) {
      setRequirements([...requirements, trimmed]);
      setNewRequirement('');
    }
  };

  // Handler penghapusan chip ketentuan
  const handleRemoveRequirement = (indexToRemove: number) => {
    setRequirements(requirements.filter((_, i) => i !== indexToRemove));
  };

  // Handler salin teks pengumuman asli
  const handleCopySourceText = async () => {
    try {
      await navigator.clipboard.writeText(sourceText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Handler eksekusi simpan tugas
  const handleSave = async () => {
    setSaveErrorMessage(null);

    // 1. Validasi Judul Tugas
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError('Judul tugas wajib diisi.');
      const elem = document.getElementById(titleInputId);
      elem?.focus();
      return;
    }
    if (trimmedTitle.length > 150) {
      setTitleError('Judul tugas maksimal 150 karakter.');
      return;
    }
    setTitleError(null);

    // 2. Validasi Mata Kuliah
    const trimmedCourse = course.trim();
    if (trimmedCourse.length > 100) {
      return;
    }

    // 3. Validasi Deadline: Waktu tidak boleh ada tanpa tanggal
    if (dueTime && !dueDate) {
      setDateError('Waktu pengumpulan tidak dapat disimpan tanpa tanggal. Silakan pilih tanggal atau kosongkan waktu.');
      const elem = document.getElementById(dateInputId);
      elem?.focus();
      return;
    }
    setDateError(null);

    // Jika deadline dihapus pengguna agar tanpa deadline, bersihkan waktu
    const finalDueDate = dueDate ? dueDate : null;
    const finalDueTime = dueDate && dueTime ? dueTime : null;

    const validatedDraft: TaskDraft = {
      title: trimmedTitle,
      course: trimmedCourse || null,
      description: description.trim(),
      dueDate: finalDueDate,
      dueTime: finalDueTime,
      sourceTimezone: sourceTimezone.trim() || null,
      requirements,
      isAmbiguousDeadline: initialDraft.isAmbiguousDeadline,
    };

    setIsSaving(true);

    try {
      const result = await onSave(validatedDraft, sourceText);
      if (result === false) {
        setSaveErrorMessage('Penyimpanan tugas belum berhasil. Draft Anda tetap kami pertahankan.');
        setIsSaving(false);
      }
    } catch {
      setSaveErrorMessage('Terjadi kesalahan saat menyimpan tugas ke penyimpanan lokal. Draft Anda tidak hilang.');
      setIsSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
      className={`fixed inset-0 z-50 bg-dark-ink/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto ${className}`}
    >
      <div className="relative w-full max-w-5xl bg-surface-container-lowest rounded-2xl border border-outline-variant/40 flex flex-col max-h-[92vh] overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* 1. Modal Header Bar */}
        <div className="px-6 py-4 border-b border-outline-variant/30 flex items-start justify-between bg-surface-container-low shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-lime-accent text-dark-ink text-xs font-bold border border-secondary/20 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-forest-green" />
                Hasil Ekstraksi Gemini AI
              </span>
              <span className="text-xs text-on-surface-variant hidden sm:flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary" />
                Model: Gemini AI Extractor
              </span>
            </div>
            <h2 id="preview-modal-title" className="text-lg sm:text-xl font-bold text-forest-green tracking-tight">
              Periksa &amp; Koreksi Detail Tugas
            </h2>
            <p className="text-xs text-on-surface-variant">
              Bandingkan teks pengumuman asli dengan field yang diekstrak oleh Gemini API sebelum disimpan ke dashboard.
            </p>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="rounded-lg p-2 text-on-surface-variant hover:text-dark-ink hover:bg-surface-container-high transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-forest-green"
            aria-label="Tutup dan batal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Modal Body: Two-Column Comparison View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-ivory-bg">
          {/* SISI KIRI (5 Kolom): Teks Sumber Asli Pengumuman */}
          <div className="lg:col-span-5 flex flex-col bg-surface-container-low rounded-xl border border-outline-variant/40 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30 mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-lowest text-dark-ink text-xs font-bold border border-outline-variant/30">
                <MessageSquare className="w-3.5 h-3.5 text-forest-green" />
                Teks Pengumuman Asal
              </span>

              <button
                type="button"
                onClick={handleCopySourceText}
                className="inline-flex items-center gap-1 text-xs font-medium text-dark-ink hover:bg-surface-container-lowest px-2 py-1 rounded border border-outline-variant/30 transition-colors"
                title="Salin teks sumber"
              >
                {copySuccess ? (
                  <>
                    <Check className="w-3 h-3 text-forest-green" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-outline" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>

            {/* Render Teks Pengumuman Aman */}
            <div className="text-xs text-dark-ink whitespace-pre-wrap font-sans leading-relaxed flex-1 bg-surface-container-lowest p-3.5 rounded-lg border border-outline-variant/30 overflow-y-auto max-h-[260px] lg:max-h-[380px] shadow-inner">
              {sourceText}
            </div>

            {/* Bukti Kutipan Entitas dari Teks */}
            {criticalFieldEvidence && Object.keys(criticalFieldEvidence).length > 0 && (
              <div className="mt-3 pt-3 border-t border-outline-variant/30">
                <span className="text-[11px] font-bold text-outline block mb-1.5">
                  Bukti Kutipan Entitas dari Teks:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(criticalFieldEvidence).map(([key, val]) => (
                    <span
                      key={key}
                      className="text-[11px] bg-surface-container-lowest border border-outline-variant/40 text-dark-ink px-2 py-0.5 rounded-md truncate max-w-full font-medium"
                      title={`${key}: ${val}`}
                    >
                      <strong className="capitalize text-forest-green">{key}:</strong> "{val}"
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata Footer */}
            <div className="mt-3 text-[11px] text-outline bg-surface-container-lowest/80 p-2.5 rounded-lg border border-outline-variant/30 space-y-0.5">
              <div>• Zona Tampilan Aktif: <strong className="text-dark-ink">{displayTimezone}</strong></div>
              {sourceMessageDate && (
                <div>• Acuan Tanggal Pesan Asal: <strong className="text-dark-ink">{sourceMessageDate}</strong></div>
              )}
            </div>
          </div>

          {/* SISI KANAN (7 Kolom): Formulir Koreksi Draft */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-4 sm:p-5 shadow-sm space-y-4">
            {/* Warning Banner Ekstraksi jika ada */}
            {(warnings.length > 0 || initialDraft.isAmbiguousDeadline) && (
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Catatan Pemeriksaan AI:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-amber-900/90 pl-1">
                  {initialDraft.isAmbiguousDeadline && (
                    <li>
                      Tenggat ambigu: {initialDraft.ambiguityReason || 'Informasi tanggal/waktu pada pengumuman belum lengkap.'} Silakan lengkapi atau hapus tanggal.
                    </li>
                  )}
                  {warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Field 1: Judul Tugas (Wajib) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor={titleInputId} className="text-xs font-bold text-dark-ink flex items-center gap-1">
                  Judul Tugas <span className="text-rose-600">*</span>
                </label>
                <span className={`text-[11px] ${title.length > 150 ? 'text-rose-600 font-bold' : 'text-outline'}`}>
                  {title.length}/150
                </span>
              </div>
              <input
                id={titleInputId}
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError) setTitleError(null);
                }}
                disabled={isSaving}
                className={`w-full text-xs sm:text-sm rounded-lg border bg-surface-container-lowest p-2.5 text-dark-ink focus:outline-none focus:ring-2 focus:ring-forest-green transition-all ${
                  titleError ? 'border-rose-400 focus:ring-rose-400' : 'border-outline-variant/50'
                }`}
                placeholder="Contoh: Wireframe UI/UX Aplikasi Perpustakaan"
              />
              {titleError && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{titleError}</p>
              )}
            </div>

            {/* Field 2: Mata Kuliah */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor={courseInputId} className="text-xs font-bold text-dark-ink flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-forest-green" />
                  Mata Kuliah
                </label>
                {!course && (
                  <span className="text-[11px] font-semibold text-outline bg-surface-container-low px-2 py-0.5 rounded">
                    Perlu dilengkapi (Opsional)
                  </span>
                )}
              </div>
              <input
                id={courseInputId}
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                disabled={isSaving}
                className="w-full text-xs sm:text-sm rounded-lg border border-outline-variant/50 bg-surface-container-lowest p-2.5 text-dark-ink focus:outline-none focus:ring-2 focus:ring-forest-green transition-all"
                placeholder="Contoh: Desain Antarmuka &amp; Pengalaman Pengguna"
              />
            </div>

            {/* Field 3: Tenggat Waktu (Tanggal, Jam, Zona) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor={dateInputId} className="text-xs font-bold text-dark-ink flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-forest-green" />
                    Tanggal Tenggat
                  </label>
                  {!dueDate && (
                    <span className="text-[11px] font-semibold text-outline bg-surface-container-low px-1.5 py-0.5 rounded">
                      Belum ada
                    </span>
                  )}
                </div>
                <input
                  id={dateInputId}
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    if (dateError) setDateError(null);
                  }}
                  disabled={isSaving}
                  className={`w-full text-xs sm:text-sm rounded-lg border bg-surface-container-lowest p-2.5 text-dark-ink focus:outline-none focus:ring-2 focus:ring-forest-green transition-all ${
                    dateError ? 'border-rose-400 focus:ring-rose-400' : 'border-outline-variant/50'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor={timeInputId} className="text-xs font-bold text-dark-ink flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-forest-green" />
                    Waktu (Jam)
                  </label>
                  {!dueTime && dueDate && (
                    <span className="text-[11px] text-outline">Tidak disebutkan</span>
                  )}
                </div>
                <input
                  id={timeInputId}
                  type="time"
                  value={dueTime}
                  onChange={(e) => {
                    setDueTime(e.target.value);
                    if (dateError) setDateError(null);
                  }}
                  disabled={isSaving || !dueDate}
                  className={`w-full text-xs sm:text-sm rounded-lg border bg-surface-container-lowest p-2.5 text-dark-ink focus:outline-none focus:ring-2 focus:ring-forest-green transition-all ${
                    !dueDate ? 'opacity-50 cursor-not-allowed bg-surface-container-low' : 'border-outline-variant/50'
                  }`}
                />
              </div>
            </div>

            {dateError && (
              <p className="text-xs text-rose-600 font-medium">{dateError}</p>
            )}

            {/* Field 4: Deskripsi / Ringkasan Tugas */}
            <div>
              <label htmlFor={descriptionId} className="block text-xs font-bold text-dark-ink mb-1">
                Deskripsi / Ringkasan Instruksi
              </label>
              <textarea
                id={descriptionId}
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSaving}
                className="w-full text-xs sm:text-sm rounded-lg border border-outline-variant/50 bg-surface-container-lowest p-2.5 text-dark-ink focus:outline-none focus:ring-2 focus:ring-forest-green transition-all resize-y"
                placeholder="Rincian petunjuk pengerjaan tugas dari dosen..."
              />
            </div>

            {/* Field 5: Ketentuan dari Pengumuman */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-dark-ink flex items-center gap-1">
                  <BookmarkCheck className="w-3.5 h-3.5 text-forest-green" />
                  Ketentuan Khusus ({requirements.length})
                </label>
              </div>

              {/* Requirement Chips */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {requirements.map((req, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-surface-container-low border border-outline-variant/40 text-dark-ink text-xs px-2.5 py-1 rounded-lg font-medium"
                  >
                    <span>{req}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(idx)}
                      disabled={isSaving}
                      className="text-outline hover:text-rose-600 ml-0.5 p-0.5 rounded transition-colors"
                      title="Hapus ketentuan"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {requirements.length === 0 && (
                  <span className="text-xs text-outline italic">
                    Belum ada ketentuan eksplisit yang terdeteksi.
                  </span>
                )}
              </div>

              {/* Add Requirement Input */}
              <form onSubmit={handleAddRequirement} className="flex gap-2">
                <input
                  type="text"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  disabled={isSaving}
                  placeholder="Tambah ketentuan baru (cth: Format PDF maks 10MB)..."
                  className="flex-1 text-xs rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-3 py-1.5 text-dark-ink focus:outline-none focus:ring-2 focus:ring-forest-green"
                />
                <button
                  type="submit"
                  disabled={isSaving || !newRequirement.trim()}
                  className="px-3 py-1.5 bg-surface-container-low hover:bg-surface-container-high text-dark-ink font-semibold text-xs rounded-lg border border-outline-variant/40 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" />
                  Tambah
                </button>
              </form>
            </div>

            {saveErrorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                {saveErrorMessage}
              </div>
            )}
          </div>
        </div>

        {/* 3. Modal Footer Bar */}
        <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="h-11 px-5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest hover:bg-surface-container-high text-dark-ink text-xs sm:text-sm font-semibold transition-colors"
          >
            Batal / Hapus Draft
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="h-11 px-6 rounded-xl font-bold bg-forest-green hover:bg-[#193e31] text-white text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] shadow-sm disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan ke Dashboard...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-lime-accent" />
                <span>Simpan ke Dashboard</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
