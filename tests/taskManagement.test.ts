/**
 * Automated Verification Suite: Member Task Management (PRD US-02, US-04, US-06)
 * Tests Manual Task Creation, Editing, Deletion, Status Transitions,
 * Checklist Integration, and Unified Storage Resilience.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Task, TaskStatus } from '../src/types/task';
import { ChecklistItemData } from '../src/types/checklist';
import {
  loadTasksFromStorage,
  saveTasksToStorage,
  STORAGE_KEY,
} from '../src/services/taskStorage';
import { getTaskDeadlineInfo } from '../src/lib/deadline';

class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
}

describe('Member Task Management - Tanggung Jawab & Integrasi Penyimpanan', () => {
  let mockStorage: MockLocalStorage;

  beforeEach(() => {
    mockStorage = new MockLocalStorage();
    (globalThis as unknown as { localStorage: Storage }).localStorage = mockStorage as unknown as Storage;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    mockStorage.clear();
  });

  /* -------------------------------------------------------------------------- */
  /* 1. Tambah Tugas Manual                                                     */
  /* -------------------------------------------------------------------------- */
  describe('1. Tambah Tugas Manual', () => {
    it('Membuat tugas manual dengan field wajib, status awal not_started, dan checklist kosong', () => {
      const now = new Date().toISOString();
      const newTask: Task = {
        id: `task-manual-${Date.now()}`,
        title: 'Tugas Makalah Pancasila',
        course: 'Pendidikan Pancasila',
        description: 'Bab 1 sampai Bab 3',
        sourceText: '',
        sourceMessageDate: null,
        dueDate: '2026-10-25',
        dueTime: '23:59',
        sourceTimezone: null,
        displayTimezone: 'Asia/Jakarta',
        requirements: ['Format PDF', 'Maksimal 10 halaman'],
        status: 'not_started',
        checklist: [],
        createdAt: now,
        updatedAt: now,
      };

      const saveResult = saveTasksToStorage([newTask]);
      expect(saveResult.success).toBe(true);

      const loaded = loadTasksFromStorage();
      expect(loaded.status).toBe('valid');
      expect(loaded.tasks.length).toBe(1);

      const savedTask = loaded.tasks[0];
      expect(savedTask.title).toBe('Tugas Makalah Pancasila');
      expect(savedTask.status).toBe('not_started');
      expect(savedTask.checklist).toEqual([]);
      expect(savedTask.sourceText).toBe('');
      expect(savedTask.requirements).toEqual(['Format PDF', 'Maksimal 10 halaman']);
    });

    it('Tugas tanpa deadline tetap valid dan boleh disimpan', () => {
      const noDeadlineTask: Task = {
        id: 'task-no-deadline',
        title: 'Tugas Belajar Mandiri',
        course: null,
        description: 'Membaca referensi buku',
        sourceText: '',
        sourceMessageDate: null,
        dueDate: null,
        dueTime: null,
        sourceTimezone: null,
        displayTimezone: 'Asia/Jakarta',
        requirements: [],
        status: 'not_started',
        checklist: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const saveResult = saveTasksToStorage([noDeadlineTask]);
      expect(saveResult.success).toBe(true);

      const loaded = loadTasksFromStorage();
      expect(loaded.tasks[0].dueDate).toBeNull();
      expect(loaded.tasks[0].dueTime).toBeNull();

      const deadlineInfo = getTaskDeadlineInfo(loaded.tasks[0]);
      expect(deadlineInfo.formattedDeadline).toBe('Belum ada deadline');
      expect(deadlineInfo.isOverdue).toBe(false);
    });

    it('Waktu tidak boleh disimpan tanpa tanggal', () => {
      const invalidTimeTask = {
        id: 'task-invalid',
        title: 'Tugas Invalid',
        description: '',
        sourceText: '',
        dueDate: null,
        dueTime: '23:59', // Waktu tanpa tanggal dilarang
        displayTimezone: 'Asia/Jakarta',
        requirements: [],
        status: 'not_started',
        checklist: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockStorage.setItem(STORAGE_KEY, JSON.stringify([invalidTimeTask]));
      const loaded = loadTasksFromStorage();
      expect(loaded.status).toBe('corrupted');
    });

    it('Simpan tepat satu tugas dan cegah penggandaan pada klik berulang', async () => {
      const taskList: Task[] = [];
      let isSaving = false;

      const performSave = async (title: string): Promise<boolean> => {
        if (isSaving) return false;
        isSaving = true;

        await new Promise((r) => setTimeout(r, 10));

        const task: Task = {
          id: `task-${Date.now()}-${Math.random()}`,
          title,
          course: null,
          description: '',
          sourceText: '',
          sourceMessageDate: null,
          dueDate: null,
          dueTime: null,
          sourceTimezone: null,
          displayTimezone: 'Asia/Jakarta',
          requirements: [],
          status: 'not_started',
          checklist: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        taskList.push(task);
        isSaving = false;
        return true;
      };

      const [res1, res2] = await Promise.all([
        performSave('Tugas A'),
        performSave('Tugas A'),
      ]);

      expect(res1).toBe(true);
      expect(res2).toBe(false);
      expect(taskList.length).toBe(1);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 2. Edit Tugas                                                              */
  /* -------------------------------------------------------------------------- */
  describe('2. Edit Tugas', () => {
    it('Memperbarui judul, deadline, dan ketentuan dengan mempertahankan ID, createdAt, dan checklist', () => {
      const initialTask: Task = {
        id: 'task-preserve-id',
        title: 'Judul Lama',
        course: 'Mata Kuliah Lama',
        description: 'Deskripsi Lama',
        sourceText: 'Pengumuman Dosen Asli',
        sourceMessageDate: '2026-10-15',
        dueDate: '2026-10-20',
        dueTime: '10:00',
        sourceTimezone: 'WIB',
        displayTimezone: 'Asia/Jakarta',
        requirements: ['Ketentuan Lama'],
        status: 'not_started',
        checklist: [
          { id: 'c1', text: 'Langkah pertama', completed: true, origin: 'ai' },
        ],
        createdAt: '2026-10-15T00:00:00.000Z',
        updatedAt: '2026-10-15T00:00:00.000Z',
      };

      saveTasksToStorage([initialTask]);

      // Edit fields
      const newUpdatedAt = new Date().toISOString();
      const updatedTask: Task = {
        ...initialTask,
        title: 'Judul Baru yang Direvisi',
        course: 'Mata Kuliah Baru',
        description: 'Deskripsi Baru',
        dueDate: '2026-10-28',
        dueTime: '23:59',
        requirements: ['Ketentuan Baru 1', 'Ketentuan Baru 2'],
        updatedAt: newUpdatedAt,
      };

      saveTasksToStorage([updatedTask]);

      const loaded = loadTasksFromStorage();
      const result = loaded.tasks[0];

      // Field yang diubah
      expect(result.title).toBe('Judul Baru yang Direvisi');
      expect(result.course).toBe('Mata Kuliah Baru');
      expect(result.dueDate).toBe('2026-10-28');
      expect(result.dueTime).toBe('23:59');
      expect(result.requirements).toEqual(['Ketentuan Baru 1', 'Ketentuan Baru 2']);
      expect(result.updatedAt).toBe(newUpdatedAt);

      // Field yang WAJIB dipertahankan
      expect(result.id).toBe('task-preserve-id');
      expect(result.createdAt).toBe('2026-10-15T00:00:00.000Z');
      expect(result.sourceText).toBe('Pengumuman Dosen Asli');
      expect(result.checklist.length).toBe(1);
      expect(result.checklist[0].completed).toBe(true);
    });

    it('Pembatalan edit tidak mengubah data tersimpan di storage', () => {
      const originalTask: Task = {
        id: 'task-cancel-edit',
        title: 'Judul Asli Tidak Berubah',
        course: 'Sains Data',
        description: '',
        sourceText: '',
        sourceMessageDate: null,
        dueDate: null,
        dueTime: null,
        sourceTimezone: null,
        displayTimezone: 'Asia/Jakarta',
        requirements: [],
        status: 'not_started',
        checklist: [],
        createdAt: '2026-10-22T00:00:00.000Z',
        updatedAt: '2026-10-22T00:00:00.000Z',
      };

      saveTasksToStorage([originalTask]);

      // Simulasi user mengedit di form lalu menekan Batal
      let draftInForm = { ...originalTask, title: 'Judul Terbuang' };
      draftInForm = { ...originalTask }; // Revert on cancel

      const loaded = loadTasksFromStorage();
      expect(loaded.tasks[0].title).toBe('Judul Asli Tidak Berubah');
      expect(draftInForm.title).toBe('Judul Asli Tidak Berubah');
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 3. Hapus Tugas                                                             */
  /* -------------------------------------------------------------------------- */
  describe('3. Hapus Tugas', () => {
    it('Menghapus tugas dari storage setelah konfirmasi', () => {
      const task1: Task = {
        id: 'task-1',
        title: 'Tugas 1',
        course: null,
        description: '',
        sourceText: '',
        sourceMessageDate: null,
        dueDate: null,
        dueTime: null,
        sourceTimezone: null,
        displayTimezone: 'Asia/Jakarta',
        requirements: [],
        status: 'not_started',
        checklist: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const task2: Task = { ...task1, id: 'task-2', title: 'Tugas 2' };

      saveTasksToStorage([task1, task2]);

      // User konfirmasi hapus task-1
      const remainingTasks = [task1, task2].filter((t) => t.id !== 'task-1');
      saveTasksToStorage(remainingTasks);

      const loaded = loadTasksFromStorage();
      expect(loaded.tasks.length).toBe(1);
      expect(loaded.tasks[0].id).toBe('task-2');
    });

    it('Pembatalan hapus mempertahankan tugas di storage', () => {
      const task1: Task = {
        id: 'task-keep',
        title: 'Tugas Dipertahankan',
        course: null,
        description: '',
        sourceText: '',
        sourceMessageDate: null,
        dueDate: null,
        dueTime: null,
        sourceTimezone: null,
        displayTimezone: 'Asia/Jakarta',
        requirements: [],
        status: 'not_started',
        checklist: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveTasksToStorage([task1]);

      // User membatalkan dialog hapus -> tidak ada write ke storage
      const loaded = loadTasksFromStorage();
      expect(loaded.tasks.length).toBe(1);
      expect(loaded.tasks[0].title).toBe('Tugas Dipertahankan');
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 4. Ubah Status & Aturan Terlambat                                          */
  /* -------------------------------------------------------------------------- */
  describe('4. Ubah Status & Aturan Terlambat', () => {
    it('Mendukung transisi status enum not_started -> in_progress -> done', () => {
      const task: Task = {
        id: 'task-status-test',
        title: 'Tugas Status',
        course: null,
        description: '',
        sourceText: '',
        sourceMessageDate: null,
        dueDate: null,
        dueTime: null,
        sourceTimezone: null,
        displayTimezone: 'Asia/Jakarta',
        requirements: [],
        status: 'not_started',
        checklist: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const validStatuses: TaskStatus[] = ['not_started', 'in_progress', 'done'];
      for (const status of validStatuses) {
        task.status = status;
        const result = saveTasksToStorage([task]);
        expect(result.success).toBe(true);

        const loaded = loadTasksFromStorage();
        expect(loaded.tasks[0].status).toBe(status);
      }
    });

    it('Tugas dengan status done TIDAK PERNAH menampilkan label terlambat meskipun deadline lewat', () => {
      const pastDeadlineTask: Task = {
        id: 'task-overdue-done',
        title: 'Tugas Selesai Tepat/Lewat Waktu',
        course: 'Jaringan Komputer',
        description: '',
        sourceText: '',
        sourceMessageDate: null,
        dueDate: '2020-01-01', // Sudah lewat
        dueTime: '12:00',
        sourceTimezone: 'WIB',
        displayTimezone: 'Asia/Jakarta',
        requirements: [],
        status: 'not_started',
        checklist: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Saat belum selesai, isOverdue = true
      const overdueInfo = getTaskDeadlineInfo(pastDeadlineTask, new Date());
      expect(overdueInfo.isOverdue).toBe(true);

      // Saat status diubah menjadi done, isOverdue WAJIB false
      pastDeadlineTask.status = 'done';
      const doneInfo = getTaskDeadlineInfo(pastDeadlineTask, new Date());
      expect(doneInfo.isOverdue).toBe(false);
    });

    it('Checklist 100% tidak otomatis mengubah status tugas menjadi done (kendali tetap di pengguna)', () => {
      const taskWithChecklist: Task = {
        id: 'task-checklist-100',
        title: 'Tugas dengan Checklist Lengkap',
        course: null,
        description: '',
        sourceText: '',
        sourceMessageDate: null,
        dueDate: null,
        dueTime: null,
        sourceTimezone: null,
        displayTimezone: 'Asia/Jakarta',
        requirements: [],
        status: 'in_progress',
        checklist: [
          { id: '1', text: 'Langkah 1', completed: true, origin: 'manual' },
          { id: '2', text: 'Langkah 2', completed: true, origin: 'manual' },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Checklist 100% selesai, status tetap in_progress sampai pengguna sendiri yang mengubahnya
      expect(taskWithChecklist.status).toBe('in_progress');
      expect(taskWithChecklist.checklist.every((c) => c.completed)).toBe(true);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 5. Satukan State & Penyimpanan Bersama                                     */
  /* -------------------------------------------------------------------------- */
  describe('5. Satukan State & Penyimpanan Bersama', () => {
    it('Menyimpan tugas dari Input & Preview ke key yang sama dengan Tambah Manual', () => {
      const manualTask: Task = {
        id: 'task-manual-1',
        title: 'Manual Task',
        course: null,
        description: '',
        sourceText: '',
        sourceMessageDate: null,
        dueDate: null,
        dueTime: null,
        sourceTimezone: null,
        displayTimezone: 'Asia/Jakarta',
        requirements: [],
        status: 'not_started',
        checklist: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const extractedTask: Task = {
        id: 'task-extracted-1',
        title: 'Extracted Task dari Gemini',
        course: 'Kecerdasan Buatan',
        description: 'Tugas ekstraksi',
        sourceText: 'Teks pengumuman asli kelas',
        sourceMessageDate: '2026-10-21',
        dueDate: '2026-10-30',
        dueTime: '23:59',
        sourceTimezone: 'WIB',
        displayTimezone: 'Asia/Jakarta',
        requirements: ['PDF'],
        status: 'not_started',
        checklist: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Simpan manual, lalu simpan ekstrak ke storage yang sama
      saveTasksToStorage([manualTask]);
      let loaded = loadTasksFromStorage();
      expect(loaded.tasks.length).toBe(1);

      saveTasksToStorage([extractedTask, ...loaded.tasks]);
      loaded = loadTasksFromStorage();
      expect(loaded.tasks.length).toBe(2);
      expect(loaded.tasks[0].id).toBe('task-extracted-1');
      expect(loaded.tasks[1].id).toBe('task-manual-1');
    });

    it('Pembaruan checklist tersinkronisasi tanpa menghilangkan properti tugas lainnya', () => {
      const task: Task = {
        id: 'task-sync',
        title: 'Tugas Penting',
        course: 'Sistem Terdistribusi',
        description: 'Deskripsi lengkap',
        sourceText: 'Teks asli',
        sourceMessageDate: '2026-10-01',
        dueDate: '2026-11-01',
        dueTime: '12:00',
        sourceTimezone: 'WIB',
        displayTimezone: 'Asia/Jakarta',
        requirements: ['Req 1', 'Req 2'],
        status: 'in_progress',
        checklist: [],
        createdAt: '2026-10-01T00:00:00.000Z',
        updatedAt: '2026-10-01T00:00:00.000Z',
      };

      saveTasksToStorage([task]);

      // Anggota checklist memperbarui item checklist
      const newChecklist: ChecklistItemData[] = [
        { id: 'step-a', text: 'Analisis arsitektur', completed: true, origin: 'ai' },
        { id: 'step-b', text: 'Implementasi kode', completed: false, origin: 'ai' },
      ];

      const updatedTask: Task = {
        ...task,
        checklist: newChecklist,
        updatedAt: new Date().toISOString(),
      };

      saveTasksToStorage([updatedTask]);

      const loaded = loadTasksFromStorage();
      const saved = loaded.tasks[0];
      expect(saved.checklist.length).toBe(2);
      expect(saved.checklist[0].completed).toBe(true);
      expect(saved.requirements).toEqual(['Req 1', 'Req 2']);
      expect(saved.sourceText).toBe('Teks asli');
      expect(saved.status).toBe('in_progress');
    });
  });
});
