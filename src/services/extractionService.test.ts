import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { extractTaskFromAnnouncement, API_ENDPOINT } from './extractionService';
import { ExtractionRequest } from '../types/extraction';

describe('extractTaskFromAnnouncement - Jalur Produksi & Proteksi Fallback (PRD Bagian 9)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('menolak pengumuman kosong atau hanya spasi sebelum memanggil API', async () => {
    const request: ExtractionRequest = {
      text: '   \n  \t ',
      displayTimezone: 'Asia/Jakarta',
    };

    await expect(extractTaskFromAnnouncement(request)).rejects.toMatchObject({
      type: 'INVALID_INPUT',
    });
  });

  it('menolak pengumuman yang melebihi batas 5.000 karakter sebelum memanggil API', async () => {
    const request: ExtractionRequest = {
      text: 'A'.repeat(5001),
      displayTimezone: 'Asia/Jakarta',
    };

    await expect(extractTaskFromAnnouncement(request)).rejects.toMatchObject({
      type: 'INVALID_INPUT',
    });
  });

  it('memanggil endpoint resmi /api/extract-task dengan payload yang tepat pada jalur produksi', async () => {
    const mockResponseData = {
      resultType: 'task',
      draft: {
        title: 'Tugas Jaringan Komputer',
        course: 'Jaringan Komputer',
        description: 'Simulasi subnetting Cisco Packet Tracer',
        dueDate: '2026-10-25',
        dueTime: '23:59',
        sourceTimezone: 'WIB',
        requirements: ['Format PKT', 'Laporan PDF'],
      },
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponseData,
    } as Response);

    const request: ExtractionRequest = {
      text: 'Tugas Jaringan Komputer simulasi subnetting kumpul 25 Oktober 2026 jam 23.59 WIB.',
      sourceMessageDate: '2026-10-20',
      displayTimezone: 'Asia/Jakarta',
    };

    const result = await extractTaskFromAnnouncement(request);

    expect(fetchSpy).toHaveBeenCalledWith(
      API_ENDPOINT,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })
    );
    expect(result.resultType).toBe('task');
    expect(result.draft?.title).toBe('Tugas Jaringan Komputer');
  });

  it('TIDAK MELAKUKAN FALLBACK DIAM-DIAM ke simulasi saat jaringan gagal (melempar NETWORK_ERROR)', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const request: ExtractionRequest = {
      text: 'Tugas desain wireframe UI/UX kumpul 21 Oktober 2026.',
      displayTimezone: 'Asia/Jakarta',
    };

    // Jalur produksi WAJIB melempar error dan BUKAN mengembalikan fixture simulasi!
    await expect(extractTaskFromAnnouncement(request)).rejects.toMatchObject({
      type: 'NETWORK_ERROR',
      message: expect.stringContaining('/api/extract-task'),
    });
  });

  it('menangani error kuota / rate limit (HTTP 429) dengan error RATE_LIMIT_OR_QUOTA', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 429,
    } as Response);

    const request: ExtractionRequest = {
      text: 'Tugas Kalkulus bab 4.',
      displayTimezone: 'Asia/Jakarta',
    };

    await expect(extractTaskFromAnnouncement(request)).rejects.toMatchObject({
      type: 'RATE_LIMIT_OR_QUOTA',
    });
  });

  it('menangani error server (HTTP 500) dengan error INVALID_RESPONSE', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    const request: ExtractionRequest = {
      text: 'Tugas Kalkulus bab 4.',
      displayTimezone: 'Asia/Jakarta',
    };

    await expect(extractTaskFromAnnouncement(request)).rejects.toMatchObject({
      type: 'INVALID_RESPONSE',
    });
  });

  it('dapat menggunakan mock eksplisit ketika opsi useMock diaktifkan secara sengaja', async () => {
    const request: ExtractionRequest = {
      text: 'Tugas Desain Wireframe aplikasi perpustakaan.',
      displayTimezone: 'Asia/Jakarta',
    };

    const result = await extractTaskFromAnnouncement(request, { useMock: true });
    expect(result.isSimulated).toBe(true);
    expect(result.resultType).toBe('task');
  });
});
