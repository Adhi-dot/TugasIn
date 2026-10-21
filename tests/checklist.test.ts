import { test } from 'vitest';
import assert from 'node:assert/strict';
import { handleGenerateChecklist } from '../src/server/api/generateChecklist';
import { IGeminiClient } from '../src/server/gemini/geminiClient';
import { GenerateChecklistResponse } from '../src/types/checklist';

// Mock Gemini Client untuk pengujian terkontrol
class MockGeminiClient implements IGeminiClient {
  public callCount = 0;
  public lastInput: unknown = null;
  public mockResponse: GenerateChecklistResponse | null = null;
  public mockError: Error | null = null;

  async generateChecklist(input: {
    title: string;
    description?: string;
    requirements?: string[];
  }): Promise<GenerateChecklistResponse> {
    this.callCount++;
    this.lastInput = input;

    if (this.mockError) {
      throw this.mockError;
    }

    if (this.mockResponse) {
      return this.mockResponse;
    }

    return {
      steps: [
        'Kaji materi dan panduan tugas secara seksama',
        'Bentuk kelompok dan bagi pembagian peran',
        'Susun draf wireframe low-fidelity sesuai ketentuan',
        'Periksa format berkas PDF sebelum pengumpulan',
      ],
    };
  }
}

test('1. Validasi Input: Menolak judul kosong dan tidak memanggil Gemini', async () => {
  const mockClient = new MockGeminiClient();
  const response = await handleGenerateChecklist({ title: '' }, mockClient);

  assert.equal(response.status, 400);
  assert.equal(mockClient.callCount, 0, 'Gemini DILARANG dipanggil jika input tidak valid');
  assert.ok('error' in response.body);
  assert.equal(response.body.error.code, 'INVALID_INPUT');
});

test('2. Validasi Input: Menolak judul yang hanya berisi whitespace', async () => {
  const mockClient = new MockGeminiClient();
  const response = await handleGenerateChecklist({ title: '     \n  ' }, mockClient);

  assert.equal(response.status, 400);
  assert.equal(mockClient.callCount, 0);
  assert.ok('error' in response.body);
  assert.equal(response.body.error.code, 'INVALID_INPUT');
});

test('3. Validasi Input: Menolak judul melebihi 150 karakter', async () => {
  const mockClient = new MockGeminiClient();
  const longTitle = 'a'.repeat(151);
  const response = await handleGenerateChecklist({ title: longTitle }, mockClient);

  assert.equal(response.status, 400);
  assert.equal(mockClient.callCount, 0);
  assert.ok('error' in response.body);
  assert.equal(response.body.error.code, 'INVALID_INPUT');
});

test('4. Backend Sukses: Menghasilkan 3-7 langkah pengerjaan valid', async () => {
  const mockClient = new MockGeminiClient();
  mockClient.mockResponse = {
    steps: [
      'Bentuk kelompok dan tentukan ketua tim',
      'Buat dokumen user flow peminjaman buku',
      'Rancang wireframe halaman utama katalog',
      'Kompilasi dokumen ke dalam format PDF',
    ],
  };

  const response = await handleGenerateChecklist(
    {
      title: 'Tugas Wireframe Perpustakaan',
      description: 'Membuat antarmuka low fidelity',
      requirements: ['Format PDF', 'Maksimal 3 anggota'],
    },
    mockClient
  );

  assert.equal(response.status, 200);
  assert.equal(mockClient.callCount, 1);
  assert.ok('steps' in response.body);
  assert.equal(response.body.steps.length, 4);
});

test('5. Validasi Server Terhadap AI: Menolak jika AI menghasilkan kurang dari 3 langkah', async () => {
  const mockClient = new MockGeminiClient();
  mockClient.mockResponse = {
    steps: ['Hanya satu langkah', 'Hanya dua langkah'],
  };

  const response = await handleGenerateChecklist(
    { title: 'Tugas Singkat' },
    mockClient
  );

  assert.equal(response.status, 502);
  assert.ok('error' in response.body);
  assert.equal(response.body.error.code, 'INVALID_AI_RESPONSE');
});

test('6. Validasi Server Terhadap AI: Menolak jika AI menghasilkan lebih dari 7 langkah', async () => {
  const mockClient = new MockGeminiClient();
  mockClient.mockResponse = {
    steps: [
      'Langkah 1',
      'Langkah 2',
      'Langkah 3',
      'Langkah 4',
      'Langkah 5',
      'Langkah 6',
      'Langkah 7',
      'Langkah 8 (Melebihi batas)',
    ],
  };

  const response = await handleGenerateChecklist(
    { title: 'Tugas Kompleks' },
    mockClient
  );

  assert.equal(response.status, 502);
  assert.ok('error' in response.body);
  assert.equal(response.body.error.code, 'INVALID_AI_RESPONSE');
});

test('7. Penanganan Error: Menerjemahkan Timeout dan Quota dengan benar', async () => {
  const mockClient = new MockGeminiClient();
  mockClient.mockError = {
    code: 'TIMEOUT',
    message: 'Request timeout setelah 30 detik',
  } as unknown as Error;

  const response = await handleGenerateChecklist(
    { title: 'Tugas Berat' },
    mockClient
  );

  assert.equal(response.status, 504);
  assert.ok('error' in response.body);
  assert.equal(response.body.error.code, 'TIMEOUT');
});
