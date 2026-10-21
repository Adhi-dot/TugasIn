import React, { useState } from 'react';
import { ShieldLockIcon } from '../../ui/icons';

export const HeroSection: React.FC = () => {
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-8">
      {/* Kolom Kiri: Headline & Nilai Tambah (7 Kolom Desktop) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Trust Badge Enkripsi */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-emerald-200 text-xs font-medium text-brand-700">
          <ShieldLockIcon className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
          <span>Didukung Gemini AI • Diproses Aman & Transparan</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight leading-tight">
          Ubah Pengumuman Kelas Menjadi <span className="text-brand-600">Tugas Terjadwal</span>
        </h1>

        <p className="text-sm sm:text-base text-ink-muted leading-relaxed max-w-xl">
          Cukup tempelkan pesan broadcast dari grup WhatsApp, Telegram, atau LMS kampus. TugasIn mengekstrak judul, mata kuliah, tenggat waktu, dan kriteria tugas secara otomatis ke checklist harianmu.
        </p>

        {/* Value Proposition Pills */}
        <div className="flex flex-wrap gap-2 pt-1 text-xs">
          <span className="inline-flex items-center gap-1.5 bg-surface border border-hairline px-3 py-1 rounded-full text-ink-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
            Dari chat jadi checklist
          </span>
          <span className="inline-flex items-center gap-1.5 bg-surface border border-hairline px-3 py-1 rounded-full text-ink-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
            Verifikasi sebelum simpan
          </span>
          <span className="inline-flex items-center gap-1.5 bg-surface border border-hairline px-3 py-1 rounded-full text-ink-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
            Deteksi tenggat ambigu
          </span>
        </div>
      </div>

      {/* Kolom Kanan: Aset Foto Mahasiswa Nyata (5 Kolom Desktop) */}
      <div className="lg:col-span-5 relative">
        <div className="relative rounded-2xl overflow-hidden border border-hairline shadow-sm bg-surface aspect-[16/9] lg:aspect-[4/3]">
          {/* Skeleton Shimmer Fallback saat gambar memuat */}
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center">
              <span className="text-xs text-ink-subtle">Memuat visual akademis...</span>
            </div>
          )}

          <img
            src="/assets/images/hero-student-study.jpg"
            alt="Mahasiswa Indonesia modern sedang belajar dan mengorganisir tugas kuliah dengan laptop"
            loading="eager"
            onLoad={() => setIsImageLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Floating Pill Status Ekstraksi di atas foto */}
          <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-sm border border-hairline p-2.5 rounded-xl shadow-sm text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-ping flex-shrink-0" />
              <span className="font-semibold text-ink truncate">Contoh: UI/UX Wireframe</span>
            </div>
            <span className="text-[11px] font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-emerald-100 flex-shrink-0">
              Siap Diekstrak
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
