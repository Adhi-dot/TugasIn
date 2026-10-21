import { describe, it, expect } from 'vitest';
import { validateTaskDraft } from './validation';
import { TaskDraft } from '../types/task';

describe('validateTaskDraft - Validasi Ketat Sesuai PRD Bagian 8 & 9', () => {
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
    expect(result.errors.title).toContain('wajib diisi');
  });

  it('menerima judul pendek 1 atau 2 karakter (misal "PR" atau "T1") asalkan tidak kosong setelah trim', () => {
    const draft: TaskDraft = {
      title: 'PR',
      course: null,
      description: '',
      dueDate: null,
      dueTime: null,
      sourceTimezone: null,
      requirements: [],
    };

    const result = validateTaskDraft(draft);
    expect(result.isValid).toBe(true);
    expect(result.cleanedDraft?.title).toBe('PR');
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
      requirements: [],
    };

    const result = validateTaskDraft(draft);
    expect(result.isValid).toBe(true);
    expect(result.cleanedDraft?.dueDate).toBeNull();
    expect(result.cleanedDraft?.dueTime).toBeNull();
  });

  it('MENOLAK jika waktu diisi tetapi tanggal kosong (dueTime tanpa dueDate)', () => {
    const draft: TaskDraft = {
      title: 'Tugas Invalid Waktu',
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
    expect(result.errors.dueTime).toContain('tanpa tanggal');
  });

  it('menerima tanggal dan waktu lengkap yang valid', () => {
    const draft: TaskDraft = {
      title: 'Tugas Desain Final',
      course: 'UI/UX',
      description: 'Kumpul file Figma dan PDF',
      dueDate: '2026-10-21',
      dueTime: '23:59',
      sourceTimezone: 'WIB',
      requirements: ['Format PDF', 'Kelompok maks 3'],
    };

    const result = validateTaskDraft(draft);
    expect(result.isValid).toBe(true);
    expect(result.cleanedDraft?.dueDate).toBe('2026-10-21');
    expect(result.cleanedDraft?.dueTime).toBe('23:59');
  });
});
