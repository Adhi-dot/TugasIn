/**
 * Component: ManualTaskModal
 * Form Modal Tambah Tugas Manual
 * Aligned with PRD US-04, Section 8, 9 & AGENTS.md
 * Styled to match Stitch Design System
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
  const [displayTimezone] = useState(detectedTimezone);
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

    const cleanedRequirements = requirements
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const draft: ManualTaskDraft = {
      title: trimmedTitle,
      course: trimmedCourse ? trimmedCourse : null,
      description: description.trim(),
      dueDate: hasDate ? dueDate : null,
      dueTime: hasDate && hasTime ? dueTime : null,
      displayTimezone: displayTimezone || detectedTimezone,
      requirements: cleanedRequirements,
    };

    try {
      const res = await onSubmit(draft);

      if (res.success) {
        // Reset and close
        setTitle('');
        setCourse('');
        setDescription('');
        setDueDate('');
        setDueTime('');
        setRequirements(['']);
        setIsSubmitting(false);
        onClose();
      } else {
        setIsSubmitting(false);
        setErrors({ general: res.error || 'Penyimpanan lokal gagal. Formulir Anda tidak hilang.' });
      }
    } catch {
      setIsSubmitting(false);
      setErrors({ general: 'Terjadi kegagalan penyimpanan. Data Anda tetap tersimpan di formulir ini.' });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-task-title"
      className="fixed inset-0 z-50 bg-dark-ink/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 shadow-2xl relative my-auto space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-2 rounded-lg text-outline hover:text-dark-ink hover:bg-surface-container-high transition-colors"
          aria-label="Tutup formulir tambah manual"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-left space-y-1 pr-8">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-center justify-center text-forest-green">
              <Plus className="w-4 h-4" />
            </span>
            <h2 id="manual-task-title" className="text-lg sm:text-xl font-bold text-dark-ink">
              Tambah Tugas Manual
            </h2>
          </div>
          <p className="text-xs text-on-surface-variant">
            Catat tugas langsung tanpa melalui ekstraksi pengumuman AI. Data tersimpan di browser Anda.
          </p>
        </div>

        {/* General Error Banner */}
        {errors.general && (
          <div
            role="alert"
            className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 text-left"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Gagal Menyimpan</p>
              <p>{errors.general}</p>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Judul Tugas */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="manual-title" className="text-xs font-bold text-dark-ink">
                Judul Tugas <span className="text-rose-600">*</span>
              </label>
              <span className="text-[11px] text-outline">
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
              className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border bg-surface-container-lowest transition-all focus:outline-none focus:ring-2 focus:ring-forest-green ${
                errors.title
                  ? 'border-rose-400 focus:border-rose-500'
                  : 'border-outline-variant/50 focus:border-forest-green'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Mata Kuliah */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="manual-course" className="text-xs font-bold text-dark-ink flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-forest-green" />
                <span>Mata Kuliah (Opsional)</span>
              </label>
              <span className="text-[11px] text-outline">
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
              className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border bg-surface-container-lowest transition-all focus:outline-none focus:ring-2 focus:ring-forest-green ${
                errors.course
                  ? 'border-rose-400 focus:border-rose-500'
                  : 'border-outline-variant/50 focus:border-forest-green'
              }`}
            />
            {errors.course && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.course}
              </p>
            )}
          </div>

          {/* Deskripsi */}
          <div>
            <label htmlFor="manual-desc" className="block text-xs font-bold text-dark-ink mb-1.5">
              Deskripsi / Ringkasan (Opsional)
            </label>
            <textarea
              id="manual-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tambahkan detail ringkasan pengerjaan tugas..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-outline-variant/50 bg-surface-container-lowest transition-all focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-forest-green leading-relaxed resize-y"
            />
          </div>

          {/* Deadline: Tanggal, Waktu & Zona Waktu */}
          <div className="p-3.5 bg-surface-container-low border border-outline-variant/40 rounded-xl space-y-3">
            <span className="text-xs font-bold text-dark-ink flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-forest-green" />
              <span>Batas Waktu Pengumpulan (Deadline)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Tanggal */}
              <div>
                <label htmlFor="manual-date" className="block text-xs font-semibold text-on-surface-variant mb-1">
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
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-dark-ink focus:outline-none focus:ring-2 focus:ring-forest-green"
                />
              </div>

              {/* Jam */}
              <div>
                <label htmlFor="manual-time" className="block text-xs font-semibold text-on-surface-variant mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-outline" />
                  <span>Jam (Opsional)</span>
                </label>
                <input
                  id="manual-time"
                  type="time"
                  value={dueTime}
                  disabled={!dueDate}
                  onChange={(e) => {
                    setDueTime(e.target.value);
                    if (errors.dueTime) setErrors((prev) => ({ ...prev, dueTime: undefined }));
                  }}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-dark-ink focus:outline-none focus:ring-2 focus:ring-forest-green disabled:opacity-50"
                />
              </div>
            </div>

            {errors.dueTime && (
              <p className="text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.dueTime}
              </p>
            )}
          </div>

          {/* Ketentuan Khusus */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-dark-ink">
                Ketentuan Tugas (Opsional)
              </label>
              <button
                type="button"
                onClick={handleAddRequirement}
                className="text-xs text-forest-green font-bold hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Ketentuan</span>
              </button>
            </div>

            <div className="space-y-2">
              {requirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => handleUpdateRequirement(index, e.target.value)}
                    placeholder={`Ketentuan ${index + 1} (cth: Format PDF maks 3 orang)`}
                    className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-dark-ink focus:outline-none focus:ring-2 focus:ring-forest-green"
                  />
                  {requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(index)}
                      className="p-2 text-outline hover:text-rose-600 rounded-lg hover:bg-surface-container-high transition-colors"
                      title="Hapus baris ketentuan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs sm:text-sm font-bold text-dark-ink bg-surface-container-lowest border border-outline-variant/50 hover:bg-surface-container-high rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-forest-green hover:bg-[#193e31] text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-forest-green focus:ring-offset-2 active:scale-95 disabled:opacity-50"
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
