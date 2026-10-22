/**
 * Component: ManualTaskModal
 * Form Modal Tambah Tugas Manual
 * Aligned with PRD US-04, Section 8, 9 & AGENTS.md
 * 
 * Rules:
 * 1. Tidak memanggil Gemini API.
 * 2. Judul wajib setelah trim, maks 150 karakter.
 * 3. Mata kuliah opsional, maks 100 karakter.
 * 4. Waktu tidak boleh disimpan tanpa tanggal.
 * 5. Cegah simpan ganda (double-save prevention).
 * 6. Jika penyimpanan gagal, pertahankan isi formulir di memori.
 * 7. Pembatalan tidak mengubah data tersimpan.
 */

import React, { useState } from 'react';
import { X, Plus, Trash2, Calendar, Clock, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { ManualTaskDraft } from '../../../hooks/useTaskManager';
import { resolveIanaTimezone } from '../../../lib/deadline';

export interface ManualTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (draft: ManualTaskDraft) => Promise<{ success: boolean; error?: string }>;
}

export const ManualTaskModal: React.FC<ManualTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const detectedTimezone = resolveIanaTimezone(null);

  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [displayTimezone, setDisplayTimezone] = useState(detectedTimezone);
  const [requirements, setRequirements] = useState<string[]>(['']);

  const [errors, setErrors] = useState<{
    title?: string;
    course?: string;
    dueTime?: string;
    general?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Requirement items manipulation
  const handleAddRequirement = () => {
    setRequirements((prev) => [...prev, '']);
  };

  const handleUpdateRequirement = (index: number, value: string) => {
    setRequirements((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements((prev) => prev.filter((_, i) => i !== index));
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submissions
    if (isSubmitting) return;

    const validationErrors: typeof errors = {};

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      validationErrors.title = 'Judul tugas wajib diisi.';
    } else if (trimmedTitle.length > 150) {
      validationErrors.title = 'Judul tugas maksimal 150 karakter.';
    }

    const trimmedCourse = course.trim();
    if (trimmedCourse.length > 100) {
      validationErrors.course = 'Nama mata kuliah maksimal 100 karakter.';
    }

    const hasDate = Boolean(dueDate && dueDate.trim().length > 0);
    const hasTime = Boolean(dueTime && dueTime.trim().length > 0);

    if (hasTime && !hasDate) {
      validationErrors.dueTime = 'Waktu pengumpulan tidak dapat disimpan tanpa tanggal batas pengumpulan.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const cleanRequirements = requirements
        .map((r) => r.trim())
        .filter((r) => r.length > 0);

      const result = await onSubmit({
        title: trimmedTitle,
        course: trimmedCourse.length > 0 ? trimmedCourse : null,
        description: description.trim(),
        dueDate: hasDate ? dueDate.trim() : null,
        dueTime: hasDate && hasTime ? dueTime.trim() : null,
        displayTimezone,
        requirements: cleanRequirements,
      });

      if (result.success) {
        setIsSubmitting(false);
        onClose();
      } else {
        // If storage write failed, keep form open and display error
        setIsSubmitting(false);
        setErrors({ general: result.error || 'Gagal menyimpan tugas. Formulir tetap terbuka untuk dicoba lagi.' });
      }
    } catch {
      setIsSubmitting(false);
      setErrors({ general: 'Terjadi kesalahan tak terduga saat menyimpan tugas.' });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-task-modal-title"
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="bg-white border border-border rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-light text-brand-primary flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 id="manual-task-modal-title" className="text-lg font-bold text-ink-primary">
                Tambah Tugas Manual
              </h2>
              <p className="text-xs text-ink-muted">
                Catat tugas langsung tanpa melalui ekstraksi pengumuman.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-slate-100 transition-colors"
            aria-label="Tutup form tambah manual"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Storage / General Error Alert */}
        {errors.general && (
          <div
            role="alert"
            className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Penyimpanan Gagal</p>
              <p>{errors.general}</p>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Judul Tugas */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="manual-title" className="text-xs font-semibold text-ink-primary">
                Judul Tugas <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-ink-muted">
                {title.length}/150 karakter
              </span>
            </div>
            <input
              id="manual-title"
              type="text"
              required
              maxLength={150}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="Contoh: Laporan Akhir Praktikum Jaringan Komputer"
              className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-surface transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                errors.title
                  ? 'border-rose-400 focus:border-rose-500'
                  : 'border-border focus:border-brand-primary'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Mata Kuliah */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="manual-course" className="text-xs font-semibold text-ink-primary flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-ink-muted" />
                <span>Mata Kuliah (Opsional)</span>
              </label>
              <span className="text-[11px] text-ink-muted">
                {course.length}/100 karakter
              </span>
            </div>
            <input
              id="manual-course"
              type="text"
              maxLength={100}
              value={course}
              onChange={(e) => {
                setCourse(e.target.value);
                if (errors.course) setErrors((prev) => ({ ...prev, course: undefined }));
              }}
              placeholder="Contoh: Sistem Basis Data"
              className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-surface transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                errors.course
                  ? 'border-rose-400 focus:border-rose-500'
                  : 'border-border focus:border-brand-primary'
              }`}
            />
            {errors.course && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.course}
              </p>
            )}
          </div>

          {/* Deskripsi */}
          <div>
            <label htmlFor="manual-desc" className="block text-xs font-semibold text-ink-primary mb-1.5">
              Deskripsi / Ringkasan (Opsional)
            </label>
            <textarea
              id="manual-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tambahkan detail ringkasan pengerjaan tugas..."
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border bg-surface transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary leading-relaxed"
            />
          </div>

          {/* Deadline: Tanggal, Waktu & Zona Waktu */}
          <div className="p-3.5 bg-slate-50 border border-border rounded-xl space-y-3">
            <span className="text-xs font-bold text-ink-primary flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-primary" />
              <span>Batas Waktu Pengumpulan (Deadline)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Tanggal */}
              <div>
                <label htmlFor="manual-date" className="block text-[11px] font-semibold text-ink-secondary mb-1">
                  Tanggal Batas
                </label>
                <input
                  id="manual-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    if (errors.dueTime) setErrors((prev) => ({ ...prev, dueTime: undefined }));
                  }}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-border bg-white text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>

              {/* Jam */}
              <div>
                <label htmlFor="manual-time" className="block text-[11px] font-semibold text-ink-secondary mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-ink-muted" />
                  <span>Jam (Opsional)</span>
                </label>
                <input
                  id="manual-time"
                  type="time"
                  value={dueTime}
                  onChange={(e) => {
                    setDueTime(e.target.value);
                    if (errors.dueTime) setErrors((prev) => ({ ...prev, dueTime: undefined }));
                  }}
                  className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg border bg-white text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                    errors.dueTime ? 'border-rose-400 focus:border-rose-500' : 'border-border focus:border-brand-primary'
                  }`}
                />
              </div>

              {/* Zona Waktu */}
              <div>
                <label htmlFor="manual-tz" className="block text-[11px] font-semibold text-ink-secondary mb-1">
                  Zona Waktu Tampilan
                </label>
                <select
                  id="manual-tz"
                  value={displayTimezone}
                  onChange={(e) => setDisplayTimezone(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-border bg-white text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                >
                  <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
                  <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
                  <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>

            {errors.dueTime && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.dueTime}
              </p>
            )}

            {!dueDate && (
              <p className="text-[11px] text-ink-muted">
                Boleh dikosongkan jika tugas belum memiliki batas tenggat.
              </p>
            )}
          </div>

          {/* Ketentuan Tambahan */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-ink-primary">
                Ketentuan / Catatan Tambahan (Opsional)
              </label>
              <button
                type="button"
                onClick={handleAddRequirement}
                className="text-xs font-semibold text-brand-primary hover:text-brand-hover inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Ketentuan</span>
              </button>
            </div>

            <div className="space-y-2">
              {requirements.map((req, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => handleUpdateRequirement(idx, e.target.value)}
                    placeholder={`Ketentuan ${idx + 1} (misal: Format PDF, maks 5 halaman)`}
                    className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  />
                  {requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(idx)}
                      className="p-2 text-ink-muted hover:text-rose-600 rounded-lg transition-colors"
                      aria-label={`Hapus ketentuan ${idx + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-lg border border-border text-xs sm:text-sm font-semibold text-ink-secondary hover:text-ink-primary hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold shadow-sm transition-all disabled:opacity-50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Tugas</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
