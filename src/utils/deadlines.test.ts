import { describe, it, expect } from 'vitest';
import { checkDeadlineAmbiguity } from './deadlines';

describe('checkDeadlineAmbiguity - Aturan Ambigu Deadline (PRD Bagian 8)', () => {
  it('menandai ambigu jika pengumuman menyebutkan "besok" tanpa sourceMessageDate', () => {
    const text = 'Tugas UI/UX dikumpulkan besok pukul 14:00 di meja dosen.';
    const result = checkDeadlineAmbiguity(text, null);

    expect(result.isAmbiguous).toBe(true);
    expect(result.ambiguityType).toBe('relative_no_source_date');
    expect(result.reason).toContain('acuan tanggal pesan asal');
  });

  it('tidak menandai ambigu jika "besok" disertai tanggal pesan asal (sourceMessageDate)', () => {
    const text = 'Tugas UI/UX dikumpulkan besok pukul 14:00 di meja dosen.';
    const result = checkDeadlineAmbiguity(text, '2026-10-20');

    expect(result.isAmbiguous).toBe(false);
  });

  it('menandai ambigu untuk frasa relatif "Jumat depan"', () => {
    const text = 'Kumpulkan laporan praktikum pada hari Jumat depan.';
    const result = checkDeadlineAmbiguity(text, '2026-10-20');

    expect(result.isAmbiguous).toBe(true);
    expect(result.ambiguityType).toBe('ambiguous_relative_phrase');
    expect(result.reason).toContain('Jumat depan');
  });

  it('menandai ambigu jika tanggal disebutkan tanpa tahun', () => {
    const text = 'Tugas dikumpulkan paling lambat 28 Oktober jam 23:59 WIB.';
    const result = checkDeadlineAmbiguity(text, null);

    expect(result.isAmbiguous).toBe(true);
    expect(result.ambiguityType).toBe('no_year');
    expect(result.reason).toContain('tanpa tahun');
  });

  it('tidak menandai ambigu jika tanggal lengkap dengan tahun disebutkan', () => {
    const text = 'Tugas dikumpulkan paling lambat 28 Oktober 2026 jam 23:59 WIB.';
    const result = checkDeadlineAmbiguity(text, null);

    expect(result.isAmbiguous).toBe(false);
  });

  it('menandai ambigu jika ada konflik tenggat waktu (LMS vs pengumuman chat)', () => {
    const text = 'Pengumpulan di LMS tertulis 20 Oktober namun di chat diundur menjadi 25 Oktober 2026.';
    const result = checkDeadlineAmbiguity(text, null);

    expect(result.isAmbiguous).toBe(true);
    expect(result.ambiguityType).toBe('conflicting_deadlines');
  });
});
