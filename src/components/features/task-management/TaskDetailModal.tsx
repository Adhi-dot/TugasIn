/**
 * Component: TaskDetailModal
 * Modal Detail, Status, Edit, Hapus, dan Checklist Tugas Terpadu
 * Sesuai PRD US-02, US-04, US-05 & Tanggung Jawab Member Task Management
 * Styled to align with Stitch Screen 3 (TugasIn - Detail Tugas & AI Checklist)
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Edit3,
  Trash2,
  Calendar,
  BookOpen,
  FileText,
  AlertCircle,
  CheckSquare,
  Loader2,
  AlertTriangle,
  Plus,
  ArrowLeft,
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

export const TaskDetailModal: React.FC<Readonly<TaskDetailModalProps>> = ({
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
  const handleAddRequirementField = () => {
    setEditRequirements([...editRequirements, '']);
  };

  const handleUpdateRequirementField = (index: number, value: string) => {
    const updated = [...editRequirements];
    updated[index] = value;
    setEditRequirements(updated);
  };

  const handleRemoveRequirementField = (index: number) => {
    const updated = editRequirements.filter((_, i) => i !== index);
    setEditRequirements(updated.length > 0 ? updated : ['']);
  };

  // Form Validation
  const validateEditForm = (): boolean => {
    const errors: { title?: string; course?: string; dueTime?: string } = {};

    if (!editTitle.trim()) {
      errors.title = 'Judul tugas wajib diisi.';
    } else if (editTitle.trim().length > 150) {
      errors.title = 'Judul tugas maksimal 150 karakter.';
    }

    if (editCourse.trim().length > 100) {
      errors.course = 'Nama mata kuliah maksimal 100 karakter.';
    }

    if (editDueTime && !editDueDate) {
      errors.dueTime = 'Jam pengumpulan membutuhkan tanggal tenggat.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Edit Handler
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEditForm() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const cleanedRequirements = editRequirements
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const updates: Partial<Task> = {
      title: editTitle.trim(),
      course: editCourse.trim() ? editCourse.trim() : null,
      description: editDescription.trim(),
      dueDate: editDueDate ? editDueDate : null,
      dueTime: editDueDate && editDueTime ? editDueTime : null,
      displayTimezone: editDisplayTimezone,
      requirements: cleanedRequirements,
    };

    const res = await onUpdateTask(task.id, updates);
    setIsSubmitting(false);

    if (res.success) {
      setIsEditing(false);
    } else {
      setErrorMessage(res.error || 'Gagal menyimpan perubahan ke penyimpanan lokal.');
    }
  };

  // Delete Handler
  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    const success = await onDeleteTask(task.id);
    setIsSubmitting(false);
    if (!success) {
      setErrorMessage('Gagal menghapus tugas dari penyimpanan lokal.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-task-title"
      className="fixed inset-0 z-50 bg-dark-ink/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 shadow-2xl relative my-auto space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-outline hover:text-dark-ink hover:bg-surface-container-high transition-colors"
          aria-label="Tutup detail tugas"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Global Error Banner */}
        {errorMessage && (
          <div
            role="alert"
            className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Operasi Gagal</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Delete Confirmation Alert */}
        {isConfirmingDelete && (
          <div
            role="alertdialog"
            aria-labelledby="confirm-delete-title"
            aria-describedby="confirm-delete-desc"
            className="p-5 bg-rose-50/80 border border-rose-200 rounded-xl space-y-3 animate-in fade-in zoom-in-95 duration-100 text-left"
          >
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span id="confirm-delete-title">Konfirmasi Hapus Tugas</span>
            </div>
            <p id="confirm-delete-desc" className="text-xs sm:text-sm text-rose-900 leading-relaxed">
              Apakah kamu yakin ingin menghapus tugas <strong className="font-bold">"{task.title}"</strong>?
              Tindakan ini permanen dan tugas akan dihapus dari penyimpanan browser.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                disabled={isSubmitting}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-dark-ink hover:bg-surface-container-high transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-rose-500"
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
        )}

        {/* ===================== VIEW MODE ===================== */}
        {!isEditing && (
          <div className="space-y-6 text-left">
            {/* Context & Meta Header */}
            <div className="space-y-3 pr-8">
              <div className="flex flex-wrap items-center gap-2">
                {task.course ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded bg-surface-container-low text-dark-ink border border-outline-variant/30">
                    <BookOpen className="w-3.5 h-3.5 text-forest-green" />
                    {task.course}
                  </span>
                ) : (
                  <span className="text-xs font-medium px-2.5 py-1 rounded bg-surface-container-low text-outline border border-outline-variant/20">
                    Tugas Umum
                  </span>
                )}

                {/* Overdue Badge */}
                {deadlineInfo.isOverdue && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded bg-rose-100 text-rose-800 border border-rose-200">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                    Terlambat
                  </span>
                )}

                {/* Deadline Text */}
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded bg-surface-container-low text-on-surface-variant border border-outline-variant/30">
                  <Calendar className="w-3.5 h-3.5 text-forest-green" />
                  <span>{deadlineInfo.formattedDeadline}</span>
                </span>
              </div>

              {/* Title */}
              <h2 id="modal-task-title" className="text-xl sm:text-2xl font-bold text-dark-ink leading-tight">
                {task.title}
              </h2>

              {/* Description */}
              {task.description ? (
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                  {task.description}
                </p>
              ) : (
                <p className="text-xs text-outline italic">Tidak ada deskripsi tambahan.</p>
              )}
            </div>

            {/* Status Selector Bar (US-04: not_started, in_progress, done) */}
            <div className="p-3.5 bg-surface-container-low border border-outline-variant/40 rounded-xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-forest-green" />
                <span className="text-xs font-bold text-dark-ink">Status Pengerjaan:</span>
              </div>

              <div className="flex items-center gap-1.5 bg-surface-container-lowest p-1 rounded-lg border border-outline-variant/40">
                <button
                  type="button"
                  onClick={() => handleStatusChange('not_started')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    task.status === 'not_started'
                      ? 'bg-dark-ink text-white shadow-sm'
                      : 'text-on-surface-variant hover:text-dark-ink hover:bg-surface-container-high'
                  }`}
                >
                  Belum mulai
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('in_progress')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    task.status === 'in_progress'
                      ? 'bg-lime-accent text-dark-ink shadow-sm'
                      : 'text-on-surface-variant hover:text-dark-ink hover:bg-surface-container-high'
                  }`}
                >
                  Dikerjakan
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('done')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    task.status === 'done'
                      ? 'bg-forest-green text-white shadow-sm'
                      : 'text-on-surface-variant hover:text-dark-ink hover:bg-surface-container-high'
                  }`}
                >
                  Selesai
                </button>
              </div>
            </div>

            {/* Ketentuan dari Pengumuman */}
            {task.requirements && task.requirements.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-dark-ink flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-forest-green" />
                  <span>Ketentuan dari Pengumuman</span>
                </h3>
                <ul className="space-y-1.5">
                  {task.requirements.map((req, index) => (
                    <li
                      key={index}
                      className="text-xs text-dark-ink flex items-start gap-2 bg-surface-container-low border border-outline-variant/30 p-2.5 rounded-lg"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-forest-green mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Checklist Langkah Pengerjaan AI */}
            <div className="pt-2">
              <TaskChecklist
                taskId={task.id}
                taskTitle={task.title}
                taskDescription={task.description}
                taskRequirements={task.requirements}
                initialChecklist={task.checklist}
                onUpdateChecklist={(newChecklist) => onUpdateChecklist(task.id, newChecklist)}
              />
            </div>

            {/* Footer Action Buttons */}
            <div className="pt-4 border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:text-rose-900 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Tugas</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-outline-variant/50 bg-surface-container-lowest hover:bg-surface-container-high text-dark-ink transition-colors shadow-sm"
                >
                  <Edit3 className="w-4 h-4 text-forest-green" />
                  <span>Edit Data</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-forest-green hover:bg-[#193e31] text-white transition-colors shadow-sm"
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== EDIT MODE ===================== */}
        {isEditing && (
          <form onSubmit={handleSaveEdit} className="space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="p-1 rounded text-outline hover:text-dark-ink transition-colors"
                  aria-label="Kembali ke tampilan detail"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h3 className="text-base font-bold text-dark-ink">Edit Data Tugas</h3>
              </div>
              <span className="text-xs text-outline">* Wajib diisi</span>
            </div>

            {/* Title Input */}
            <div>
              <label htmlFor="edit-task-title" className="block text-xs font-bold text-dark-ink mb-1">
                Judul Tugas <span className="text-rose-600">*</span>
              </label>
              <input
                id="edit-task-title"
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={150}
                className="w-full text-xs sm:text-sm rounded-lg border border-outline-variant/50 bg-surface-container-lowest p-2.5 text-dark-ink focus:outline-none focus:ring-2 focus:ring-forest-green"
              />
              {formErrors.title && <p className="mt-1 text-xs text-rose-600 font-medium">{formErrors.title}</p>}
            </div>

            {/* Course Input */}
            <div>
              <label htmlFor="edit-task-course" className="block text-xs font-bold text-dark-ink mb-1">
                Mata Kuliah
              </label>
              <input
                id="edit-task-course"
                type="text"
                value={editCourse}
                onChange={(e) => setEditCourse(e.target.value)}
                maxLength={100}
                placeholder="Contoh: Desain Antarmuka"
                className="w-full text-xs sm:text-sm rounded-lg border border-outline-variant/50 bg-surface-container-lowest p-2.5 text-dark-ink focus:outline-none focus:ring-2 focus:ring-forest-green"
              />
            </div>

            {/* Due Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="edit-task-date" className="block text-xs font-bold text-dark-ink mb-1">
                  Tanggal Tenggat
                </label>
                <input
                  id="edit-task-date"
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-lg border border-outline-variant/50 bg-surface-container-lowest p-2.5 text-dark-ink focus:outline-none focus:ring-2 focus:ring-forest-green"
                />
              </div>
              <div>
                <label htmlFor="edit-task-time" className="block text-xs font-bold text-dark-ink mb-1">
                  Waktu (Jam)
                </label>
                <input
                  id="edit-task-time"
                  type="time"
                  value={editDueTime}
                  onChange={(e) => setEditDueTime(e.target.value)}
                  disabled={!editDueDate}
                  className="w-full text-xs sm:text-sm rounded-lg border border-outline-variant/50 bg-surface-container-lowest p-2.5 text-dark-ink focus:outline-none focus:ring-2 focus:ring-forest-green disabled:opacity-50"
                />
              </div>
            </div>
            {formErrors.dueTime && <p className="text-xs text-rose-600 font-medium">{formErrors.dueTime}</p>}

            {/* Description */}
            <div>
              <label htmlFor="edit-task-desc" className="block text-xs font-bold text-dark-ink mb-1">
                Deskripsi
              </label>
              <textarea
                id="edit-task-desc"
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full text-xs sm:text-sm rounded-lg border border-outline-variant/50 bg-surface-container-lowest p-2.5 text-dark-ink focus:outline-none focus:ring-2 focus:ring-forest-green resize-y"
              />
            </div>

            {/* Requirements Editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-dark-ink">Ketentuan Pengumuman</label>
                <button
                  type="button"
                  onClick={handleAddRequirementField}
                  className="text-xs font-semibold text-forest-green hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Baris
                </button>
              </div>
              <div className="space-y-2">
                {editRequirements.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => handleUpdateRequirementField(idx, e.target.value)}
                      placeholder={`Ketentuan ${idx + 1}`}
                      className="flex-1 text-xs sm:text-sm rounded-lg border border-outline-variant/50 bg-surface-container-lowest p-2 text-dark-ink focus:outline-none focus:ring-2 focus:ring-forest-green"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirementField(idx)}
                      className="p-1.5 text-outline hover:text-rose-600 transition-colors"
                      aria-label={`Hapus ketentuan ${idx + 1}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Edit Actions */}
            <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-outline-variant/50 bg-surface-container-lowest text-dark-ink hover:bg-surface-container-high transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-forest-green hover:bg-[#193e31] text-white shadow-sm transition-all"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
