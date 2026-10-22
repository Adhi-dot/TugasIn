/**
 * Component: TaskDetailModal
 * Modal Detail, Status, Edit, Hapus, dan Checklist Tugas Terpadu
 * Sesuai PRD US-02, US-04, US-05 & Tanggung Jawab Member Task Management
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  BookOpen,
  FileText,
  AlertCircle,
  CheckSquare,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Task, TaskStatus } from '../../../types/task';
import { ChecklistItemData } from '../../../types/checklist';
import { TaskChecklist } from '../../checklist/TaskChecklist';
import { getTaskDeadlineInfo } from '../../../lib/deadline';

export interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<{ success: boolean; error?: string }>;
  onDeleteTask: (taskId: string) => Promise<boolean>;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => Promise<boolean>;
  onUpdateChecklist: (taskId: string, newChecklist: ChecklistItemData[]) => Promise<boolean>;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask,
  onUpdateStatus,
  onUpdateChecklist,
}) => {
  if (!isOpen || !task) return null;

  // View vs Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Editable Form State
  const [editTitle, setEditTitle] = useState(task.title);
  const [editCourse, setEditCourse] = useState(task.course || '');
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editDueDate, setEditDueDate] = useState(task.dueDate || '');
  const [editDueTime, setEditDueTime] = useState(task.dueTime || '');
  const [editDisplayTimezone, setEditDisplayTimezone] = useState(task.displayTimezone || 'Asia/Jakarta');
  const [editRequirements, setEditRequirements] = useState<string[]>(
    task.requirements && task.requirements.length > 0 ? [...task.requirements] : ['']
  );

  const [formErrors, setFormErrors] = useState<{
    title?: string;
    course?: string;
    dueTime?: string;
  }>({});

  // Reset form when task prop changes
  useEffect(() => {
    setEditTitle(task.title);
    setEditCourse(task.course || '');
    setEditDescription(task.description || '');
    setEditDueDate(task.dueDate || '');
    setEditDueTime(task.dueTime || '');
    setEditDisplayTimezone(task.displayTimezone || 'Asia/Jakarta');
    setEditRequirements(task.requirements && task.requirements.length > 0 ? [...task.requirements] : ['']);
    setIsEditing(false);
    setIsConfirmingDelete(false);
    setErrorMessage(null);
    setFormErrors({});
  }, [task]);

  const deadlineInfo = getTaskDeadlineInfo(task);

  // Status Change Handler
  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (newStatus === task.status || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    const success = await onUpdateStatus(task.id, newStatus);
    setIsSubmitting(false);
    if (!success) {
      setErrorMessage('Gagal memperbarui status ke penyimpanan lokal.');
    }
  };

  // Requirement items manipulation in Edit Mode
  const handleAddRequirement = () => {
    setEditRequirements((prev) => [...prev, '']);
  };

  const handleUpdateRequirement = (index: number, val: string) => {
    setEditRequirements((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleRemoveRequirement = (index: number) => {
    setEditRequirements((prev) => prev.filter((_, i) => i !== index));
  };

  // Cancel Edit Mode
  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditCourse(task.course || '');
    setEditDescription(task.description || '');
    setEditDueDate(task.dueDate || '');
    setEditDueTime(task.dueTime || '');
    setEditDisplayTimezone(task.displayTimezone || 'Asia/Jakarta');
    setEditRequirements(task.requirements && task.requirements.length > 0 ? [...task.requirements] : ['']);
    setFormErrors({});
    setErrorMessage(null);
    setIsEditing(false);
  };

  // Save Edit Handler
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors: typeof formErrors = {};
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      errors.title = 'Judul tugas wajib diisi.';
    } else if (trimmedTitle.length > 150) {
      errors.title = 'Judul tugas maksimal 150 karakter.';
    }

    const trimmedCourse = editCourse.trim();
    if (trimmedCourse.length > 100) {
      errors.course = 'Nama mata kuliah maksimal 100 karakter.';
    }

    const hasDate = Boolean(editDueDate && editDueDate.trim().length > 0);
    const hasTime = Boolean(editDueTime && editDueTime.trim().length > 0);

    if (hasTime && !hasDate) {
      errors.dueTime = 'Waktu pengumpulan tidak dapat disimpan tanpa tanggal batas.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);
    setErrorMessage(null);

    const cleanReqs = editRequirements.map((r) => r.trim()).filter(Boolean);

    const result = await onUpdateTask(task.id, {
      title: trimmedTitle,
      course: trimmedCourse.length > 0 ? trimmedCourse : null,
      description: editDescription.trim(),
      dueDate: hasDate ? editDueDate.trim() : null,
      dueTime: hasDate && hasTime ? editDueTime.trim() : null,
      displayTimezone: editDisplayTimezone,
      requirements: cleanReqs,
    });

    setIsSubmitting(false);

    if (result.success) {
      setIsEditing(false);
    } else {
      setErrorMessage(result.error || 'Penyimpanan perubahan gagal. Data draft tetap aman di form.');
    }
  };

  // Delete Handler
  const handleConfirmDelete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const success = await onDeleteTask(task.id);
    setIsSubmitting(false);

    if (success) {
      onClose();
    } else {
      setErrorMessage('Gagal menghapus tugas dari penyimpanan browser.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-task-title"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="bg-white border border-border rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 shadow-2xl relative my-auto space-y-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-slate-100 transition-colors"
          aria-label="Tutup detail tugas"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Global Error Banner if action fails */}
        {errorMessage && (
          <div
            role="alert"
            className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Operasi Gagal</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {isConfirmingDelete ? (
          <div
            role="alertdialog"
            aria-labelledby="confirm-delete-title"
            aria-describedby="confirm-delete-desc"
            className="p-5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-3 animate-in fade-in zoom-in-95 duration-100 text-left"
          >
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span id="confirm-delete-title">Konfirmasi Hapus Tugas</span>
            </div>
            <p id="confirm-delete-desc" className="text-xs sm:text-sm text-rose-900 leading-relaxed">
              Apakah kamu yakin ingin menghapus tugas <strong className="font-semibold">"{task.title}"</strong>?
              Tindakan ini permanen dan tugas akan dihapus dari dashboard.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                disabled={isSubmitting}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-rose-200 text-ink-secondary hover:bg-rose-100/50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Ya, Hapus Tugas</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* ===================== VIEW MODE ===================== */}
        {!isEditing && (
          <div className="space-y-6 text-left">
            {/* Context & Meta Header */}
            <div className="space-y-3 pr-8">
              <div className="flex flex-wrap items-center gap-2">
                {task.course ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-brand-primary border border-indigo-100">
                    <BookOpen className="w-3.5 h-3.5" />
                    {task.course}
                  </span>
                ) : (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-ink-muted">
                    Tugas Umum
                  </span>
                )}

                {/* Overdue Badge (Never displayed if task is done) */}
                {deadlineInfo.isOverdue && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    Terlambat
                  </span>
                )}

                {/* Deadline Text */}
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-ink-secondary">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{deadlineInfo.formattedDeadline}</span>
                </span>
              </div>

              {/* Title */}
              <h2 id="modal-task-title" className="text-xl sm:text-2xl font-bold text-ink-primary leading-tight">
                {task.title}
              </h2>

              {/* Description */}
              {task.description ? (
                <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed whitespace-pre-wrap">
                  {task.description}
                </p>
              ) : (
                <p className="text-xs text-ink-muted italic">Tidak ada deskripsi tambahan.</p>
              )}
            </div>

            {/* Status Selector Bar (US-04: not_started, in_progress, done) */}
            <div className="p-3.5 bg-slate-50 border border-border rounded-xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-brand-primary" />
                <span className="text-xs font-bold text-ink-primary">Status Pengerjaan:</span>
              </div>

              <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => handleStatusChange('not_started')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    task.status === 'not_started'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-ink-secondary hover:text-ink-primary hover:bg-slate-50'
                  }`}
                >
                  Belum mulai
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('in_progress')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    task.status === 'in_progress'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-ink-secondary hover:text-ink-primary hover:bg-slate-50'
                  }`}
                >
                  Dikerjakan
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('done')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    task.status === 'done'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-ink-secondary hover:text-ink-primary hover:bg-slate-50'
                  }`}
                >
                  Selesai
                </button>
              </div>
            </div>

            {/* Official Requirements Section */}
            {task.requirements && task.requirements.length > 0 && (
              <div className="border-l-4 border-brand-primary bg-slate-50 p-4 rounded-r-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-ink-primary">
                  <FileText className="w-4 h-4 text-brand-primary" />
                  <span>Ketentuan Tugas</span>
                </div>
                <ul className="text-xs sm:text-sm text-ink-secondary space-y-1 list-disc list-inside">
                  {task.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Task Management Actions (Edit & Delete) */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-border bg-white text-ink-secondary hover:text-ink-primary hover:bg-slate-50 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-ink-muted" />
                <span>Edit Tugas</span>
              </button>

              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Tugas</span>
              </button>
            </div>

            {/* Checklist Section (from Member Checklist) */}
            <div className="pt-2 border-t border-border">
              <TaskChecklist
                taskId={task.id}
                taskTitle={task.title}
                taskDescription={task.description}
                taskRequirements={task.requirements}
                initialChecklist={task.checklist}
                onUpdateChecklist={(newChecklist) => {
                  onUpdateChecklist(task.id, newChecklist);
                }}
              />
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-ink-muted">
              <span>
                Diperbarui: {new Date(task.updatedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-ink-primary text-xs font-semibold rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* ===================== EDIT MODE ===================== */}
        {isEditing && (
          <form onSubmit={handleSaveEdit} className="space-y-4 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-bold text-ink-primary flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand-primary" />
                <span>Edit Data Tugas</span>
              </h3>
              <span className="text-xs text-ink-muted">ID: {task.id}</span>
            </div>

            {/* Edit Judul */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="edit-title" className="text-xs font-semibold text-ink-primary">
                  Judul Tugas <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-ink-muted">
                  {editTitle.length}/150 karakter
                </span>
              </div>
              <input
                id="edit-title"
                type="text"
                required
                maxLength={150}
                value={editTitle}
                onChange={(e) => {
                  setEditTitle(e.target.value);
                  if (formErrors.title) setFormErrors((p) => ({ ...p, title: undefined }));
                }}
                className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-surface transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                  formErrors.title ? 'border-rose-400 focus:border-rose-500' : 'border-border focus:border-brand-primary'
                }`}
              />
              {formErrors.title && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formErrors.title}
                </p>
              )}
            </div>

            {/* Edit Mata Kuliah */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="edit-course" className="text-xs font-semibold text-ink-primary">
                  Mata Kuliah (Opsional)
                </label>
                <span className="text-[11px] text-ink-muted">
                  {editCourse.length}/100 karakter
                </span>
              </div>
              <input
                id="edit-course"
                type="text"
                maxLength={100}
                value={editCourse}
                onChange={(e) => {
                  setEditCourse(e.target.value);
                  if (formErrors.course) setFormErrors((p) => ({ ...p, course: undefined }));
                }}
                className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-surface transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                  formErrors.course ? 'border-rose-400 focus:border-rose-500' : 'border-border focus:border-brand-primary'
                }`}
              />
              {formErrors.course && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formErrors.course}
                </p>
              )}
            </div>

            {/* Edit Deskripsi */}
            <div>
              <label htmlFor="edit-desc" className="block text-xs font-semibold text-ink-primary mb-1">
                Deskripsi / Ringkasan
              </label>
              <textarea
                id="edit-desc"
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border bg-surface transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary leading-relaxed"
              />
            </div>

            {/* Edit Deadline: Tanggal, Jam & Zona Waktu */}
            <div className="p-3.5 bg-slate-50 border border-border rounded-xl space-y-3">
              <span className="text-xs font-bold text-ink-primary flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-primary" />
                <span>Batas Waktu Pengumpulan (Deadline)</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Tanggal */}
                <div>
                  <label htmlFor="edit-date" className="block text-[11px] font-semibold text-ink-secondary mb-1">
                    Tanggal
                  </label>
                  <input
                    id="edit-date"
                    type="date"
                    value={editDueDate}
                    onChange={(e) => {
                      setEditDueDate(e.target.value);
                      if (formErrors.dueTime) setFormErrors((p) => ({ ...p, dueTime: undefined }));
                    }}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-border bg-white text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  />
                </div>

                {/* Jam */}
                <div>
                  <label htmlFor="edit-time" className="block text-[11px] font-semibold text-ink-secondary mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-ink-muted" />
                    <span>Jam (Opsional)</span>
                  </label>
                  <input
                    id="edit-time"
                    type="time"
                    value={editDueTime}
                    onChange={(e) => {
                      setEditDueTime(e.target.value);
                      if (formErrors.dueTime) setFormErrors((p) => ({ ...p, dueTime: undefined }));
                    }}
                    className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg border bg-white text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                      formErrors.dueTime ? 'border-rose-400 focus:border-rose-500' : 'border-border focus:border-brand-primary'
                    }`}
                  />
                </div>

                {/* Zona Waktu */}
                <div>
                  <label htmlFor="edit-tz" className="block text-[11px] font-semibold text-ink-secondary mb-1">
                    Zona Waktu
                  </label>
                  <select
                    id="edit-tz"
                    value={editDisplayTimezone}
                    onChange={(e) => setEditDisplayTimezone(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-border bg-white text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  >
                    <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
                    <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
                    <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>

              {formErrors.dueTime && (
                <p className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {formErrors.dueTime}
                </p>
              )}
            </div>

            {/* Edit Ketentuan */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-ink-primary">
                  Ketentuan Resmi dari Pengumuman
                </label>
                <button
                  type="button"
                  onClick={handleAddRequirement}
                  className="text-xs font-semibold text-brand-primary hover:text-brand-hover inline-flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Tambah Baris</span>
                </button>
              </div>

              <div className="space-y-2">
                {editRequirements.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => handleUpdateRequirement(idx, e.target.value)}
                      placeholder={`Ketentuan ${idx + 1}`}
                      className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    />
                    {editRequirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRequirement(idx)}
                        className="p-2 text-ink-muted hover:text-rose-600 rounded-lg transition-colors"
                        aria-label={`Hapus baris ketentuan ${idx + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Edit Footer Controls */}
            <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelEdit}
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
                  <span>Simpan Perubahan</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
