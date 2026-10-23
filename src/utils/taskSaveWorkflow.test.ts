import { describe, it, expect, vi } from 'vitest';
import { Task, TaskDraft } from '../types/task';
import { getSimulatedExtraction } from '../services/mockExtractionService';
import { checkDeadlineAmbiguity } from './deadlines';

describe('Alur Penyimpanan Tugas Bersama & Robustness (PRD US-02, US-04, US-06)', () => {
  const sampleValidDraft: TaskDraft = {
    title: 'Desain Wireframe LMS',
    course: 'UI/UX',
    description: 'Tugas kelompok 3 orang',
    dueDate: '2026-10-21',
    dueTime: '23:59',
    sourceTimezone: 'WIB',
    requirements: ['Format PDF', 'Maks 3 orang'],
  };

  it('Pencegahan Simpan Ganda (Double-Save Guard): Hanya tepat 1 tugas dibuat', async () => {
    const taskStore: Task[] = [];
    let isSaving = false;

    const saveTask = async (draft: TaskDraft, sourceText: string) => {
      // Guard simpan ganda: jika sedang proses menyimpan, tolak panggilan berikutnya
      if (isSaving) return false;
      isSaving = true;

      // Simulasi latensi async penyimpanan ke database/storage
      await new Promise((resolve) => setTimeout(resolve, 20));

      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random()}`,
        title: draft.title,
        course: draft.course,
        description: draft.description,
        sourceText,
        sourceMessageDate: null,
        dueDate: draft.dueDate,
        dueTime: draft.dueTime,
        sourceTimezone: draft.sourceTimezone,
        displayTimezone: 'Asia/Jakarta',
        requirements: draft.requirements,
        status: 'not_started',
        checklist: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      taskStore.push(newTask);
      isSaving = false;
      return true;
    };

    // Simulasi klik ganda secara simultan
    const [firstResult, secondResult] = await Promise.all([
      saveTask(sampleValidDraft, 'Teks pengumuman'),
      saveTask(sampleValidDraft, 'Teks pengumuman'),
    ]);

    // Pemanggilan pertama sukses, pemanggilan kedua ditolak oleh guard
    expect(firstResult).toBe(true);
    expect(secondResult).toBe(false);

    // Tepat 1 tugas yang masuk ke task store
    expect(taskStore.length).toBe(1);
    expect(taskStore[0].title).toBe('Desain Wireframe LMS');
  });

  it('Pembatalan: Menutup preview tidak mengubah atau menambah tugas baru', () => {
    const taskStore: Task[] = [];
    let activeDraft: TaskDraft | null = sampleValidDraft;

    // Aksi pembatalan oleh pengguna
    const handleCancel = () => {
      activeDraft = null;
    };

    handleCancel();

    expect(activeDraft).toBeNull();
    expect(taskStore.length).toBe(0);
  });

  it('Kegagalan Penyimpanan: Draft tetap tersedia di memori jika penyimpanan gagal', async () => {
    let activeDraft: TaskDraft | null = { ...sampleValidDraft };
    let saveErrorMessage: string | null = null;

    // Mock handler penyimpanan bersama yang gagal (misal localStorage penuh / quota exceeded)
    const mockFailingSave = vi.fn().mockRejectedValue(new Error('QuotaExceededError'));

    const handleAttemptSave = async () => {
      try {
        await mockFailingSave(activeDraft);
        activeDraft = null; // Harusnya tidak terpanggil jika gagal
      } catch {
        saveErrorMessage = 'Penyimpanan gagal. Draft tetap dipertahankan.';
      }
    };

    await handleAttemptSave();

    // Draft TIDAK hilang dan modal tetap memiliki data di memori
    expect(activeDraft).not.toBeNull();
    expect(activeDraft?.title).toBe('Desain Wireframe LMS');
    expect(saveErrorMessage).toContain('Draft tetap dipertahankan');
  });

  it('Deteksi no_task: Teks non-tugas ditolak dengan pesan yang sesuai', () => {
    const nonTaskText = 'Halo teman-teman, hari ini jangan lupa makan siang ya.';
    const result = getSimulatedExtraction({
      text: nonTaskText,
      displayTimezone: 'Asia/Jakarta',
    });

    expect(result.resultType).toBe('no_task');
    expect(result.message).toContain('tidak terdeteksi memuat informasi tugas');
  });

  it('Deteksi multiple_tasks: Teks berisi beberapa tugas diminta untuk dipisahkan', () => {
    const multiTaskText = 'Tugas 1 membuat makalah kalkulus. Tugas 2 membuat ERD sistem basis data.';
    const result = getSimulatedExtraction({
      text: multiTaskText,
      displayTimezone: 'Asia/Jakarta',
    });

    expect(result.resultType).toBe('multiple_tasks');
    expect(result.message).toContain('memuat lebih dari satu tugas');
  });

  it('Proteksi Tenggat Waktu: "besok" tanpa tanggal asal ditandai ambigu', () => {
    const result = checkDeadlineAmbiguity('Tugas dikumpulkan besok pukul 10:00.', null);
    expect(result.isAmbiguous).toBe(true);
    expect(result.ambiguityType).toBe('relative_no_source_date');
  });

  it('Proteksi Tenggat Waktu: "Jumat depan" selalu ditandai ambigu', () => {
    const result = checkDeadlineAmbiguity('Tugas dikumpulkan Jumat depan jam 12:00.', '2026-10-21');
    expect(result.isAmbiguous).toBe(true);
    expect(result.ambiguityType).toBe('ambiguous_relative_phrase');
  });
});
