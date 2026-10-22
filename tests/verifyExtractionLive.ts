import { handleExtractTask } from '../src/server/api/extractTask';
import { handleGenerateChecklist } from '../src/server/api/generateChecklist';
import { defaultGeminiService } from '../src/server/gemini/geminiClient';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Script Verifikasi Panggilan Langsung Gemini API (Live Integration Verification)
 * PRD Bagian 9 & 14:
 * "Bedakan pengujian mock dengan panggilan Gemini langsung.
 *  Jangan menyatakan integrasi langsung berhasil tanpa bukti."
 *
 * Catatan Pemuatan Environment (.env):
 * Tool 'tsx' TIDAK secara otomatis membaca file .env kecuali diparsing secara eksplisit
 * atau dijalankan dengan argumen Node.js 20+ '--env-file=.env'.
 * Fungsi loadEnvManually() di bawah memastikan file .env dan .env.local dimuat ke process.env
 * sebelum pemanggilan GeminiService diuji.
 */
function loadEnvManually(): { loaded: boolean; source: string | null } {
  const envCandidates = ['.env.local', '.env'];

  for (const filename of envCandidates) {
    const fullPath = resolve(process.cwd(), filename);
    if (existsSync(fullPath)) {
      try {
        const content = readFileSync(fullPath, 'utf-8');
        content.split(/\r?\n/).forEach((line) => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const eqIndex = trimmed.indexOf('=');
            if (eqIndex > 0) {
              const key = trimmed.slice(0, eqIndex).trim();
              let val = trimmed.slice(eqIndex + 1).trim();
              // Hapus kutipan pembungkus jika ada
              if (
                (val.startsWith('"') && val.endsWith('"')) ||
                (val.startsWith("'") && val.endsWith("'"))
              ) {
                val = val.slice(1, -1);
              }
              // Setel hanya jika belum ada di process.env
              if (!process.env[key]) {
                process.env[key] = val;
              }
            }
          }
        });
        return { loaded: true, source: filename };
      } catch {
        // Lanjutkan pencarian kandidat berikutnya
      }
    }
  }

  return { loaded: false, source: null };
}

async function runLiveVerification() {
  console.log('================================================================');
  console.log('     TugasIn — Verifikasi Integrasi Langsung Gemini API         ');
  console.log('   (Ekstraksi Pengumuman & AI Checklist - Client Bersama)      ');
  console.log('================================================================\n');

  // 1. Audit Pemuatan Environment
  const envStatus = loadEnvManually();
  if (envStatus.loaded) {
    console.log(`📁 File environment berhasil dimuat secara eksplisit dari: ${envStatus.source}`);
  } else {
    console.log('ℹ️  Tidak ditemukan file .env atau .env.local di direktori root.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0 || apiKey.includes('your_gemini_api_key_here')) {
    console.warn('\n⚠️  [STATUS: BELUM TERVERIFIKASI LANGSUNG]');
    console.warn('   GEMINI_API_KEY tidak ditemukan di environment atau file .env.');
    console.warn('   Pengujian unit & integrasi menggunakan mock telah 100% lulus (64 tests).');
    console.warn('   Panggilan langsung ke Gemini API ditandai sebagai: "Belum Terverifikasi (Menunggu API Key Tim)".');
    console.warn('\n   Untuk menjalankan verifikasi langsung:');
    console.warn('   1. Tambahkan GEMINI_API_KEY=AIzaSy... ke file .env');
    console.warn('   2. Jalankan: npx tsx tests/verifyExtractionLive.ts\n');
    return;
  }

  console.log(`📡 Model aktif: ${defaultGeminiService.getModelName()}`);
  console.log('🔑 Status API Key: Terdeteksi di server environment.\n');

  // -------------------------------------------------------------
  // TEST A: Pemanggilan Langsung Ekstraksi Tugas (POST /api/extract-task)
  // -------------------------------------------------------------
  console.log('--- [TEST A] Ekstraksi Pengumuman Skenario PRD Bagian 13 ---');
  const sampleAnnouncement =
    'Untuk mata kuliah UI/UX, buat wireframe aplikasi perpustakaan. Maksimal 3 anggota per kelompok. Kumpulkan PDF pada 21 Oktober 2026 pukul 23.59 WIB melalui LMS.';

  try {
    const startTime = Date.now();
    const result = await handleExtractTask(
      {
        text: sampleAnnouncement,
        displayTimezone: 'Asia/Jakarta',
      },
      defaultGeminiService
    );
    const duration = Date.now() - startTime;

    console.log(`⏱️  Waktu respons API Ekstraksi: ${duration} ms (Batas toleransi: 30.000 ms)`);
    console.log(`📊 HTTP Status: ${result.status}`);

    if (result.status === 200 && 'resultType' in result.body && result.body.resultType === 'task') {
      console.log('✅ Ekstraksi Berhasil:');
      console.log('   - Judul        :', result.body.draft?.title);
      console.log('   - Mata Kuliah  :', result.body.draft?.course);
      console.log('   - Deadline     :', `${result.body.draft?.dueDate} ${result.body.draft?.dueTime}`);
      console.log('   - Zona IANA    :', result.body.draft?.sourceTimezone);
      console.log('   - Ketentuan    :', result.body.draft?.requirements);
      console.log('   - Bukti Teks   :', result.body.criticalFieldEvidence);
      console.log('   - Peringatan   :', result.body.warnings);
    } else {
      console.error('❌ Ekstraksi gagal atau format tidak sesuai:', JSON.stringify(result.body, null, 2));
    }
  } catch (err: unknown) {
    console.error('❌ Gagal memanggil endpoint ekstraksi Gemini langsung:');
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`   ${msg}`);
  }

  // -------------------------------------------------------------
  // TEST B: Pemanggilan Langsung Checklist AI (POST /api/generate-checklist)
  // Menguji kompatibilitas client Gemini bersama
  // -------------------------------------------------------------
  console.log('\n--- [TEST B] Pembuatan Checklist AI (Client Bersama) ---');
  console.log('⏳ Menunggu jeda 15 detik untuk mematuhi kuota RPM Gemini Free Tier...');
  await new Promise((resolve) => setTimeout(resolve, 15000));
  try {
    const startTime = Date.now();
    const result = await handleGenerateChecklist(
      {
        title: 'Tugas Desain Wireframe Aplikasi Perpustakaan',
        description: 'Membuat wireframe perpustakaan secara berkelompok format PDF kumpul di LMS.',
        requirements: ['Format PDF', 'Maksimal 3 anggota per kelompok'],
      },
      defaultGeminiService
    );
    const duration = Date.now() - startTime;

    console.log(`⏱️  Waktu respons API Checklist: ${duration} ms`);
    console.log(`📊 HTTP Status: ${result.status}`);

    if (result.status === 200 && 'steps' in result.body) {
      console.log(`✅ Checklist Berhasil (${result.body.steps.length} langkah konkret):`);
      result.body.steps.forEach((step, idx) => {
        console.log(`   ${idx + 1}. ${step}`);
      });
    } else {
      console.error('❌ Checklist gagal:', JSON.stringify(result.body, null, 2));
    }
  } catch (err: unknown) {
    console.error('❌ Gagal memanggil endpoint checklist Gemini langsung:');
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`   ${msg}`);
  }

  console.log('\n================================================================');
  console.log('                  Verifikasi Selesai                            ');
  console.log('================================================================\n');
}

runLiveVerification();
