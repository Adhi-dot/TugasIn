import React, { useState, useId } from 'react';
import {
  VerificationShieldIcon,
  EvidenceQuoteIcon,
  CalendarAlertIcon,
  CloseIcon,
  CopyIcon,
  PlusIcon,
  SpinnerIcon,
  CheckIcon,
} from '../../ui/icons';
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

export const TaskPreviewModal: React.FC<TaskPreviewModalProps> = ({
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
  const [sourceTimezone, setSourceTimezone] = useState<string>(initialDraft.sourceTimezone || '');
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
      // Fallback diam jika clipboard permission tidak tersedia
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
    <div className={`fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 ${className}`}>
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-modal-title"
        className="bg-surface rounded-card border border-hairline shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline bg-surface flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 border border-emerald-200 flex items-center justify-center text-brand-600">
              <VerificationShieldIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 id="preview-modal-title" className="text-base font-bold text-ink">
                Periksa & Koreksi Hasil Ekstraksi
              </h2>
              <p className="text-xs text-ink-muted">
                Bandingkan teks asli pengumuman dengan draft tugas terstruktur sebelum disimpan.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="text-ink-subtle hover:text-ink p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Tutup dan batal"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Dual Pane Side-by-Side (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-canvas">
          {/* SISI KIRI (40% - 5 Kolom): Teks Sumber Asli Pengumuman */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-surface-subtle rounded-xl border border-hairline p-4 flex-1 flex flex-col shadow-sm">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-hairline">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <EvidenceQuoteIcon className="w-4 h-4 text-slate-500" />
                  <span>Pengumuman Asli</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopySourceText}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-ink bg-white px-2 py-1 rounded border border-hairline transition-colors"
                >
                  {copySuccess ? (
                    <>
                      <CheckIcon className="w-3 h-3 text-brand-600" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-3 h-3" />
                      <span>Salin teks</span>
                    </>
                  )}
                </button>
              </div>

              {/* Render Teks Pengumuman Aman Anti-XSS */}
              <div className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed flex-1 bg-white p-3 rounded-lg border border-hairline overflow-y-auto max-h-[300px] lg:max-h-[460px]">
                {sourceText}
              </div>

              {/* Bukti Kutipan AI */}
              {criticalFieldEvidence && Object.keys(criticalFieldEvidence).length > 0 && (
                <div className="mt-3 pt-3 border-t border-hairline">
                  <span className="text-[11px] font-semibold text-ink-muted block mb-1.5">
                    Bukti Kutipan Entitas dari Teks:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(criticalFieldEvidence).map(([key, val]) => (
                      <span
                        key={key}
                        className="text-[11px] bg-white border border-emerald-200 text-brand-700 px-2 py-0.5 rounded-full truncate max-w-full"
                        title={`${key}: ${val}`}
                      >
                        <strong className="capitalize">{key}:</strong> "{val}"
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Context Info Box */}
            <div className="text-[11px] text-ink-subtle bg-surface p-3 rounded-lg border border-hairline space-y-1">
              <div>• Zona Tampilan Aktif: <strong className="text-ink-muted">{displayTimezone}</strong></div>
              {sourceMessageDate && (
                <div>• Acuan Tanggal Pesan Asal: <strong className="text-ink-muted">{sourceMessageDate}</strong></div>
              )}
            </div>
          </div>

          {/* SISI KANAN (60% - 7 Kolom): Formulir Koreksi Draft */}
          <div className="lg:col-span-7 bg-surface rounded-xl border border-hairline p-5 shadow-sm space-y-4">
            {/* Warning Banner Ekstraksi jika ada */}
            {(warnings.length > 0 || initialDraft.isAmbiguousDeadline) && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-amber-800">
                  <CalendarAlertIcon className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Perhatian: Perlu Dilengkapi / Dikonfirmasi</span>
                </div>
                {initialDraft.ambiguityReason && (
                  <p className="text-amber-700">{initialDraft.ambiguityReason}</p>
                )}
                {warnings.map((w, idx) => (
                  <p key={idx} className="text-amber-700">• {w}</p>
                ))}
              </div>
            )}

            {/* Field 1: Judul Tugas (Wajib) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor={titleInputId} className="text-xs font-semibold text-ink">
                  Judul Tugas <span className="text-red-500">*</span>
                </label>
                <span className={`text-[11px] ${title.length > 150 ? 'text-red-600 font-bold' : 'text-ink-subtle'}`}>
                  {title.length} / 150
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
                placeholder="Contoh: Desain Wireframe Aplikasi Perpustakaan"
                className={`w-full text-xs rounded-input border p-2.5 text-ink bg-surface focus:outline-none focus:ring-2 ${
                  titleError
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                    : 'border-hairline focus:border-brand-600 focus:ring-emerald-100'
                }`}
              />
              {titleError && (
                <p className="mt-1 text-xs text-red-600">{titleError}</p>
              )}
            </div>

            {/* Field 2: Mata Kuliah (Opsional) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor={courseInputId} className="text-xs font-semibold text-ink">
                  Mata Kuliah <span className="text-ink-subtle font-normal">(Opsional)</span>
                </label>
                <span className="text-[11px] text-ink-subtle">{course.length} / 100</span>
              </div>
              <input
                id={courseInputId}
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                disabled={isSaving}
                placeholder="Contoh: UI/UX Design"
                className="w-full text-xs rounded-input border border-hairline p-2.5 text-ink bg-surface focus:border-brand-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
              />
            </div>

            {/* Field 3: Deadline (Tanggal & Waktu) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor={dateInputId} className="text-xs font-semibold text-ink">
                  Batas Pengumpulan (Deadline)
                </label>
                {!dueDate && (
                  <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Belum ada deadline
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor={dateInputId} className="block text-[11px] text-ink-muted mb-1">
                    Tanggal Pengumpulan
                  </label>
                  <input
                    id={dateInputId}
                    type="date"
                    value={dueDate}
                    onChange={(e) => {
                      setDueDate(e.target.value);
                      if (dateError) setDateError(null);
                    }}
                    disabled={isSaving}
                    className="w-full text-xs rounded-input border border-hairline p-2 text-ink bg-surface focus:border-brand-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor={timeInputId} className="block text-[11px] text-ink-muted mb-1">
                    Jam Pengumpulan
                  </label>
                  <input
                    id={timeInputId}
                    type="time"
                    value={dueTime}
                    onChange={(e) => {
                      setDueTime(e.target.value);
                      if (dateError) setDateError(null);
                    }}
                    disabled={isSaving || !dueDate}
                    className={`w-full text-xs rounded-input border p-2 text-ink bg-surface focus:outline-none focus:ring-2 ${
                      !dueDate
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'border-hairline focus:border-brand-600 focus:ring-emerald-100'
                    }`}
                  />
                </div>
              </div>

              {/* Status helper deadline */}
              <div className="mt-1.5 flex flex-wrap gap-2 text-[11px]">
                {dueDate && !dueTime && (
                  <span className="text-slate-500 italic">
                    Batas tanggal {dueDate} · Jam tidak disebutkan
                  </span>
                )}
                {!dueDate && (
                  <span className="text-amber-600">
                    * Tugas tanpa deadline tetap dapat disimpan.
                  </span>
                )}
                {dateError && (
                  <span className="text-red-600 font-medium block w-full">{dateError}</span>
                )}
              </div>
            </div>

            {/* Field 4: Zona Waktu Sumber */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Zona Waktu Pengumpulan
              </label>
              <input
                type="text"
                value={sourceTimezone}
                onChange={(e) => setSourceTimezone(e.target.value)}
                disabled={isSaving}
                placeholder="Contoh: WIB (UTC+7)"
                className="w-full text-xs rounded-input border border-hairline p-2.5 text-ink bg-surface focus:border-brand-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
              />
              <span className="block mt-1 text-[11px] text-ink-subtle">
                Zona waktu yang tertera pada pengumuman.
              </span>
            </div>

            {/* Field 5: Deskripsi Singkat */}
            <div>
              <label htmlFor={descriptionId} className="block text-xs font-semibold text-ink mb-1">
                Deskripsi / Catatan Tugas
              </label>
              <textarea
                id={descriptionId}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSaving}
                rows={2}
                placeholder="Ringkasan instruksi atau catatan khusus tugas..."
                className="w-full text-xs rounded-input border border-hairline p-2.5 text-ink bg-surface focus:border-brand-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
              />
            </div>

            {/* Field 6: Ketentuan Tugas dari Pengumuman */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Ketentuan dari Pengumuman
              </label>
              <p className="text-[11px] text-ink-subtle mb-2">
                Format, batasan kelompok, dan media pengumpulan yang diekstrak langsung dari sumber.
              </p>

              {/* Chip List Ketentuan */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {requirements.map((req, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 bg-brand-50 border border-emerald-200 text-brand-700 text-xs px-2.5 py-1 rounded-full"
                  >
                    <span>{req}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(index)}
                      disabled={isSaving}
                      className="text-brand-600 hover:text-red-600 p-0.5 rounded-full"
                      title="Hapus ketentuan"
                    >
                      <CloseIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {requirements.length === 0 && (
                  <span className="text-xs text-ink-subtle italic">Belum ada ketentuan penugasan khusus.</span>
                )}
              </div>

              {/* Form Input Tambah Ketentuan */}
              <form onSubmit={handleAddRequirement} className="flex gap-2">
                <input
                  type="text"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  disabled={isSaving}
                  placeholder="Tambah ketentuan baru (misal: Maks 10 MB)..."
                  className="flex-1 text-xs rounded-input border border-hairline p-2 text-ink bg-surface focus:border-brand-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSaving || !newRequirement.trim()}
                  className="inline-flex items-center gap-1 text-xs font-medium bg-surface border border-hairline hover:bg-slate-50 text-ink px-3 py-2 rounded-input transition-colors disabled:opacity-50"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-hairline bg-surface flex-shrink-0">
          <div className="text-xs text-ink-muted">
            {saveErrorMessage ? (
              <span className="text-red-600 font-medium">{saveErrorMessage}</span>
            ) : (
              <span>Satu aksi simpan menghasilkan tepat satu kartu tugas.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink bg-surface border border-hairline hover:bg-slate-50 rounded-input transition-colors disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`inline-flex items-center justify-center gap-2 px-6 py-2 text-xs font-semibold rounded-input text-white transition-all shadow-sm ${
                isSaving ? 'bg-emerald-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 active:scale-[0.98]'
              }`}
            >
              {isSaving ? (
                <>
                  <SpinnerIcon className="w-3.5 h-3.5 text-white animate-spin" />
                  <span>Menyimpan tugas...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="w-3.5 h-3.5 text-white" />
                  <span>Simpan tugas</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
