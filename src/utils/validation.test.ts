import { describe, it, expect } from 'vitest';
import { validateTaskDraft } from './validation';
import { TaskDraft } from '../types/task';

describe('validateTaskDraft - Validasi Ketat Draft & Deadline (PRD Bagian 8)', () => {
  it('menolak draft dengan judul kosong atau hanya spasi', () => {
    const draft: TaskDraft = {
      title: '   ',
      course: 'UI/UX',
      description: 'Deskripsi tugas',
      dueDate: null,
      dueTime: null,
      sourceTimezone: null,
      requirements: [],
    };

    const result = validateTaskDraft(draft);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBeDefined();
  });

  it('menolak draft dengan judul melebihi 150 karakter', () => {
    const draft: TaskDraft = {
      title: 'A'.repeat(151),
      course: null,
      description: '',
      dueDate: null,
      dueTime: null,
      sourceTimezone: null,
      requirements: [],
    };

    const result = validateTaskDraft(draft);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toContain('150 karakter');
  });

  it('menolak draft dengan mata kuliah melebihi 100 karakter', () => {
    const draft: TaskDraft = {
      title: 'Tugas Valid',
      course: 'M'.repeat(101),
      description: '',
      dueDate: null,
      dueTime: null,
      sourceTimezone: null,
      requirements: [],
    };

    const result = validateTaskDraft(draft);
    expect(result.isValid).toBe(false);
    expect(result.errors.course).toContain('100 karakter');
  });

  it('mengizinkan tugas tanpa deadline untuk disimpan (dueDate: null, dueTime: null)', () => {
    const draft: TaskDraft = {
      title: 'Tugas Tanpa Deadline',
      course: 'Kalkulus',
      description: 'Soal latihan bab 3',
      dueDate: null,
      dueTime: null,
      sourceTimezone: null,
      requirements: ['Tulis tangan'],
    };

    const result = validateTaskDraft(draft);
    expect(result.isValid).toBe(true);
    expect(result.cleanedDraft?.dueDate).toBeNull();
    expect(result.cleanedDraft?.dueTime).toBeNull();
  });

  it('menolak jika jam diisi tetapi tanggal kosong (waktu tidak boleh tanpa tanggal)', () => {
    const draft: TaskDraft = {
      title: 'Tugas Jam Saja',
      course: null,
      description: '',
      dueDate: null,
      dueTime: '23:59',
      sourceTimezone: null,
      requirements: [],
    };

    const result = validateTaskDraft(draft);
    expect(result.isValid).toBe(false);
    expect(result.errors.dueTime).toBeDefined();
  });

  it('mengizinkan tanggal tanpa jam dan tidak otomatis mengisi jam 23.59', () => {
    const draft: TaskDraft = {
      title: 'Tugas Tanggal Saja',
      course: 'Metode Penelitian',
      description: '',
      dueDate: '2026-10-25',
      dueTime: null,
      sourceTimezone: null,
      requirements: [],
    };

    const result = validateTaskDraft(draft);
    expect(result.isValid).toBe(true);
    expect(result.cleanedDraft?.dueDate).toBe('2026-10-25');
    expect(result.cleanedDraft?.dueTime).toBeNull(); // Tidak diisi 23:59 secara diam-diam!
  });

  it('membersihkan whitespace dan memformat draft yang valid secara konsisten', () => {
    const draft: TaskDraft = {
      title: '  Tugas Desain Grafis  ',
      course: '  DKV  ',
      description: '  Membuat poster  ',
      dueDate: '2026-11-01',
      dueTime: '15:00',
      sourceTimezone: ' WIB ',
      requirements: [' Poster A3 ', ' '],
    };

    const result = validateTaskDraft(draft);
    expect(result.isValid).toBe(true);
    expect(result.cleanedDraft?.title).toBe('Tugas Desain Grafis');
    expect(result.cleanedDraft?.course).toBe('DKV');
    expect(result.cleanedDraft?.description).toBe('Membuat poster');
    expect(result.cleanedDraft?.sourceTimezone).toBe('WIB');
    expect(result.cleanedDraft?.requirements).toEqual([' Poster A3 ']);
  });
});
