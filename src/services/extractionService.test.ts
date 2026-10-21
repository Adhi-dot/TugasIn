import { describe, it, expect } from 'vitest';
import { extractTaskFromAnnouncement } from './extractionService';
import { ExtractionRequest } from '../types/extraction';

describe('extractionService - Verifikasi Seluruh Kasus Batas & Kontrak', () => {
  it('menolak input kosong dengan pesan INVALID_INPUT', async () => {
    const request: ExtractionRequest = {
      text: '',
      displayTimezone: 'Asia/Jakarta',
    };

    await expect(extractTaskFromAnnouncement(request)).rejects.toMatchObject({
      type: 'INVALID_INPUT',
    });
  });

  it('menolak input yang hanya berisi whitespace', async () => {
    const request: ExtractionRequest = {
      text: '    \n\t   ',
      displayTimezone: 'Asia/Jakarta',
    };

    await expect(extractTaskFromAnnouncement(request)).rejects.toMatchObject({
      type: 'INVALID_INPUT',
    });
  });

  it('menolak input melebihi 5.000 karakter', async () => {
    const request: ExtractionRequest = {
      text: 'A'.repeat(5001),
      displayTimezone: 'Asia/Jakarta',
    };

    await expect(extractTaskFromAnnouncement(request)).rejects.toMatchObject({
      type: 'INVALID_INPUT',
    });
  });

  it('menerima input tepat 5.000 karakter tanpa error validasi panjang', async () => {
    const request: ExtractionRequest = {
      text: 'Tugas: ' + 'A'.repeat(4990),
      displayTimezone: 'Asia/Jakarta',
    };

    // Tidak boleh melempar INVALID_INPUT karena masih <= 5000 karakter
    const result = await extractTaskFromAnnouncement(request);
    expect(result).toBeDefined();
    expect(result.resultType).toBe('task');
  });

  it('mengidentifikasi no_task jika teks tidak memuat tugas kuliah', async () => {
    const request: ExtractionRequest = {
      text: 'Halo teman-teman, hari ini jangan lupa makan siang ya di kantin.',
      displayTimezone: 'Asia/Jakarta',
    };

    const result = await extractTaskFromAnnouncement(request);
    expect(result.resultType).toBe('no_task');
  });

  it('mengidentifikasi multiple_tasks jika terdapat lebih dari satu tugas berbeda', async () => {
    const request: ExtractionRequest = {
      text: 'Tugas Sistem Basis Data dikumpulkan besok dan tugas Kalkulus dikumpulkan lusa.',
      displayTimezone: 'Asia/Jakarta',
    };

    const result = await extractTaskFromAnnouncement(request);
    expect(result.resultType).toBe('multiple_tasks');
    expect(result.warnings).toBeDefined();
  });

  it('menandai tenggat ambigu jika menggunakan istilah relatif seperti "Jumat depan"', async () => {
    const request: ExtractionRequest = {
      text: 'Tugas UI/UX dikumpulkan Jumat depan via LMS.',
      displayTimezone: 'Asia/Jakarta',
    };

    const result = await extractTaskFromAnnouncement(request);
    expect(result.resultType).toBe('task');
    expect(result.draft?.isAmbiguousDeadline).toBe(true);
    // Tenggat ambigu tidak boleh di-autofill sembarangan
    expect(result.draft?.dueDate).toBeNull();
  });

  it('menangani pembatalan pengguna (AbortSignal)', async () => {
    const controller = new AbortController();
    controller.abort();

    const request: ExtractionRequest = {
      text: 'Tugas Algoritma Pemrograman dikumpulkan besok.',
      displayTimezone: 'Asia/Jakarta',
    };

    await expect(extractTaskFromAnnouncement(request, controller.signal)).rejects.toThrow('USER_ABORT');
  });
});
