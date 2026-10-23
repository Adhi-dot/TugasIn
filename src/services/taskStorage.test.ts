import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  loadTasksFromStorage,
  saveTasksToStorage,
  resetStorage,
  isValidTask,
  STORAGE_KEY,
} from './taskStorage';
import { Task } from '../types/task';

// In-memory mock for localStorage in Node/Vitest environment
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

  get length(): number {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }
}

describe('taskStorage Service (PRD US-06 & Safe Persistence)', () => {
  let mockStorage: MockLocalStorage;

  const sampleTask: Task = {
    id: 'task-test-1',
    title: 'Tugas Kalkulus Dasar',
    course: 'Kalkulus I',
    description: 'Latihan bab 3 halaman 45',
    sourceText: '',
    sourceMessageDate: null,
    dueDate: '2026-10-30',
    dueTime: '14:00',
    sourceTimezone: 'WIB',
    displayTimezone: 'Asia/Jakarta',
    requirements: ['Tulis tangan rapi', 'Format PDF'],
    status: 'not_started',
    checklist: [
      { id: 'step-1', text: 'Baca bab 3', completed: false, origin: 'manual' },
    ],
    createdAt: '2026-10-22T08:00:00.000Z',
    updatedAt: '2026-10-22T08:00:00.000Z',
  };

  beforeEach(() => {
    mockStorage = new MockLocalStorage();
    (globalThis as unknown as { localStorage: Storage }).localStorage = mockStorage as unknown as Storage;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    mockStorage.clear();
  });

  it('Mengembalikan status empty jika localStorage kosong', () => {
    const result = loadTasksFromStorage();
    expect(result.status).toBe('empty');
    expect(result.tasks).toEqual([]);
  });

  it('Memuat tugas yang valid dari localStorage', () => {
    mockStorage.setItem(STORAGE_KEY, JSON.stringify([sampleTask]));
    const result = loadTasksFromStorage();

    expect(result.status).toBe('valid');
    expect(result.tasks.length).toBe(1);
    expect(result.tasks[0].id).toBe('task-test-1');
    expect(result.tasks[0].title).toBe('Tugas Kalkulus Dasar');
    expect(result.tasks[0].checklist.length).toBe(1);
  });

  it('Mendeteksi data rusak (corrupted) jika JSON parse gagal tanpa menghapus otomatis', () => {
    mockStorage.setItem(STORAGE_KEY, '{ invalid json string');
    const result = loadTasksFromStorage();

    expect(result.status).toBe('corrupted');
    expect(result.tasks).toEqual([]);
    // Verifikasi data mentah tetap bertahan di localStorage untuk penyelidikan/konfirmasi
    expect(mockStorage.getItem(STORAGE_KEY)).toBe('{ invalid json string');
  });

  it('Mendeteksi data rusak jika bentuk array tidak memenuhi kontrak Task (misal status invalid)', () => {
    const invalidTask = {
      ...sampleTask,
      status: 'unknown_status', // status tidak ada di enum
    };
    mockStorage.setItem(STORAGE_KEY, JSON.stringify([invalidTask]));
    const result = loadTasksFromStorage();

    expect(result.status).toBe('corrupted');
    expect(result.rawError).toContain('tidak memenuhi kontrak data Task');
  });

  it('Mendeteksi data rusak jika dueTime ada tetapi dueDate kosong', () => {
    const invalidTask = {
      ...sampleTask,
      dueDate: null,
      dueTime: '14:00', // waktu tanpa tanggal dilarang
    };
    mockStorage.setItem(STORAGE_KEY, JSON.stringify([invalidTask]));
    const result = loadTasksFromStorage();

    expect(result.status).toBe('corrupted');
  });

  it('isValidTask memvalidasi batasan panjang judul dan mata kuliah', () => {
    expect(isValidTask(sampleTask)).toBe(true);

    // Judul > 150 karakter
    const longTitleTask = { ...sampleTask, title: 'a'.repeat(151) };
    expect(isValidTask(longTitleTask)).toBe(false);

    // Mata kuliah > 100 karakter
    const longCourseTask = { ...sampleTask, course: 'c'.repeat(101) };
    expect(isValidTask(longCourseTask)).toBe(false);
  });

  it('saveTasksToStorage berhasil menyimpan data yang valid', () => {
    const saveResult = saveTasksToStorage([sampleTask]);
    expect(saveResult.success).toBe(true);
    expect(saveResult.error).toBeUndefined();

    const stored = JSON.parse(mockStorage.getItem(STORAGE_KEY)!);
    expect(stored.length).toBe(1);
    expect(stored[0].title).toBe('Tugas Kalkulus Dasar');
  });

  it('Menangani kegagalan QuotaExceededError saat penyimpanan penuh', () => {
    vi.spyOn(mockStorage, 'setItem').mockImplementation(() => {
      const err = new Error('Quota exceeded');
      err.name = 'QuotaExceededError';
      throw err;
    });

    const saveResult = saveTasksToStorage([sampleTask]);
    expect(saveResult.success).toBe(false);
    expect(saveResult.isQuotaExceeded).toBe(true);
    expect(saveResult.error).toContain('QuotaExceededError');
  });

  it('resetStorage menghapus data dari localStorage secara eksplisit', () => {
    mockStorage.setItem(STORAGE_KEY, 'bad data');
    const success = resetStorage();

    expect(success).toBe(true);
    expect(mockStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
