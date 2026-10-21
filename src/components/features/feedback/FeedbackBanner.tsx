import React from 'react';
import { CalendarAlertIcon, CloseIcon } from '../../ui/icons';
import { ExtractionErrorState, ExtractionResultType } from '../../../types/extraction';

export interface FeedbackBannerProps {
  resultType?: ExtractionResultType | null;
  error?: ExtractionErrorState | null;
  onRetry?: () => void;
  onManualAdd?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const FeedbackBanner: React.FC<FeedbackBannerProps> = ({
  resultType,
  error,
  onRetry,
  onManualAdd,
  onDismiss,
  className = '',
}) => {
  if (!error && resultType !== 'no_task' && resultType !== 'multiple_tasks') {
    return null;
  }

  // 1. Kondisi Error Teknis (Timeout, Kuota, Jaringan, Respons Rusak)
  if (error) {
    return (
      <div
        role="alert"
        className={`bg-red-50 border border-red-200 text-red-900 rounded-card p-4 relative shadow-sm ${className}`}
      >
        <div className="flex items-start gap-3">
          <CalendarAlertIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <h4 className="font-semibold text-red-800 mb-1">
              {error.type === 'TIMEOUT' && 'Waktu Tunggu Pemrosesan Habis (30 Detik)'}
              {error.type === 'RATE_LIMIT_OR_QUOTA' && 'Layanan Sedang Sibuk / Kuota Tercapai'}
              {error.type === 'INVALID_INPUT' && 'Format Pengumuman Belum Sesuai'}
              {error.type === 'NETWORK_ERROR' && 'Gangguan Koneksi Jaringan'}
              {error.type === 'INVALID_RESPONSE' && 'Respons Tidak Dapat Diproses'}
              {error.type === 'UNKNOWN_ERROR' && 'Gagal Memproses Ekstraksi'}
            </h4>
            <p className="text-red-700 mb-2 leading-relaxed">{error.message}</p>
            <p className="text-xs text-red-600 mb-3">{error.actionableHint}</p>

            <div className="flex flex-wrap items-center gap-2">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="text-xs font-semibold bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-input transition-colors shadow-sm"
                >
                  Coba lagi
                </button>
              )}
              {onManualAdd && (
                <button
                  type="button"
                  onClick={onManualAdd}
                  className="text-xs font-medium bg-white hover:bg-red-50 text-red-800 border border-red-300 px-3 py-1.5 rounded-input transition-colors"
                >
                  Gunakan tambah manual
                </button>
              )}
            </div>
          </div>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="text-red-400 hover:text-red-700 p-1 transition-colors"
              aria-label="Tutup pesan"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2. Kondisi No Task (Tugas tidak ditemukan di teks)
  if (resultType === 'no_task') {
    return (
      <div
        role="alert"
        className={`bg-amber-50 border border-amber-200 text-amber-900 rounded-card p-4 relative shadow-sm ${className}`}
      >
        <div className="flex items-start gap-3">
          <CalendarAlertIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <h4 className="font-semibold text-amber-800 mb-1">
              Tugas Tidak Ditemukan dalam Pengumuman
            </h4>
            <p className="text-amber-700 mb-3 leading-relaxed">
              Gemini tidak mendeteksi adanya instruksi tugas kuliah atau pengumpulan pada teks yang ditempel.
              Silakan periksa kembali pesan yang Anda salin, atau masukkan langsung melalui formulir manual.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {onManualAdd && (
                <button
                  type="button"
                  onClick={onManualAdd}
                  className="text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-input transition-colors shadow-sm"
                >
                  Tambah manual
                </button>
              )}
            </div>
          </div>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="text-amber-400 hover:text-amber-700 p-1 transition-colors"
              aria-label="Tutup pesan"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. Kondisi Multiple Tasks (Lebih dari 1 tugas terdeteksi)
  if (resultType === 'multiple_tasks') {
    return (
      <div
        role="alert"
        className={`bg-blue-50 border border-blue-200 text-blue-900 rounded-card p-4 relative shadow-sm ${className}`}
      >
        <div className="flex items-start gap-3">
          <CalendarAlertIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <h4 className="font-semibold text-blue-800 mb-1">
              Beberapa Tugas Berbeda Terdeteksi
            </h4>
            <p className="text-blue-700 mb-3 leading-relaxed">
              Pengumuman ini tampaknya memuat lebih dari satu penugasan yang berbeda. Agar pencatatan tenggat dan checklist tetap akurat, mohon tempelkan satu per satu tugas secara terpisah.
            </p>
          </div>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="text-blue-400 hover:text-blue-700 p-1 transition-colors"
              aria-label="Tutup pesan"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};
