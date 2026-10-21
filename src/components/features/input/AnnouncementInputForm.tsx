import React, { useState, useId } from 'react';
import { SparkleScanIcon, ShieldLockIcon, SpinnerIcon, PlusIcon } from '../../ui/icons';
import { ExtractionRequest } from '../../../types/extraction';

export interface AnnouncementInputFormProps {
  onExtract: (request: ExtractionRequest) => void;
  isLoading: boolean;
  onManualAdd?: () => void;
  initialText?: string;
  className?: string;
}

const MAX_CHAR_COUNT = 5000;

export const AnnouncementInputForm: React.FC<AnnouncementInputFormProps> = ({
  onExtract,
  isLoading,
  onManualAdd,
  initialText = '',
  className = '',
}) => {
  const [text, setText] = useState<string>(initialText);
  const [sourceMessageDate, setSourceMessageDate] = useState<string>('');
  const [displayTimezone, setDisplayTimezone] = useState<string>(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta';
    } catch {
      return 'Asia/Jakarta';
    }
  });

  const textareaId = useId();
  const dateInputId = useId();
  const timezoneId = useId();

  const trimmedText = text.trim();
  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHAR_COUNT;
  const isEmpty = trimmedText.length === 0;
  const isSubmitDisabled = isEmpty || isOverLimit || isLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    onExtract({
      text: text,
      sourceMessageDate: sourceMessageDate || null,
      displayTimezone: displayTimezone,
    });
  };

  const handleApplyTemplate = (sampleText: string) => {
    setText(sampleText);
  };

  return (
    <div className={`bg-surface rounded-card border border-hairline p-6 shadow-sm ${className}`}>
      {/* Template Quick Chips */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor={textareaId} className="text-sm font-semibold text-ink">
            Tempel Teks Pengumuman Tugas
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                handleApplyTemplate(
                  'Untuk mata kuliah UI/UX, buat wireframe aplikasi perpustakaan. Maksimal 3 anggota per kelompok. Kumpulkan PDF pada 21 Oktober 2026 pukul 23.59 WIB melalui LMS.'
                )
              }
              className="text-xs text-brand-700 bg-brand-50 hover:bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200 transition-colors"
            >
              Contoh 1: UI/UX (Lengkap)
            </button>
            <button
              type="button"
              onClick={() =>
                handleApplyTemplate(
                  'Halo teman-teman, tugas Sistem Basis Data dikumpulkan besok ya via LMS. Format PDF.'
                )
              }
              className="text-xs text-slate-600 bg-surface-subtle hover:bg-slate-200 px-2.5 py-1 rounded-full border border-hairline transition-colors"
            >
              Contoh 2: Relatif ("Besok")
            </button>
          </div>
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            id={textareaId}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
            rows={5}
            placeholder="Tempel pengumuman tugas dari WhatsApp, Telegram, Google Classroom, atau LMS kampus di sini..."
            className={`w-full rounded-input border p-3.5 text-sm text-ink bg-surface placeholder:text-ink-subtle focus:outline-none focus:ring-2 transition-all resize-y min-h-[140px] ${
              isOverLimit
                ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                : 'border-hairline focus:border-brand-600 focus:ring-emerald-100'
            }`}
          />
        </div>

        {/* Counter & Validation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-xs">
          <div className="flex items-center gap-1.5 text-ink-muted">
            <ShieldLockIcon className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
            <span>Teks pengumuman dikirim ke Gemini untuk diproses.</span>
          </div>

          <div
            className={`font-medium ${
              isOverLimit
                ? 'text-red-600'
                : charCount > 4500
                ? 'text-amber-600'
                : 'text-ink-muted'
            }`}
          >
            {charCount.toLocaleString('id-ID')} / {MAX_CHAR_COUNT.toLocaleString('id-ID')} karakter
          </div>
        </div>

        {isOverLimit && (
          <p className="mt-1.5 text-xs text-red-600">
            Teks melebihi batas 5.000 karakter. Mohon perpendek pengumuman sebelum memproses.
          </p>
        )}
      </div>

      {/* Context Parameter Controls (Horizontal Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 pb-5 border-t border-hairline">
        <div>
          <label htmlFor={dateInputId} className="block text-xs font-medium text-ink-muted mb-1.5">
            Tanggal Pesan Asal (Opsional)
          </label>
          <input
            id={dateInputId}
            type="date"
            value={sourceMessageDate}
            onChange={(e) => setSourceMessageDate(e.target.value)}
            disabled={isLoading}
            className="w-full text-xs rounded-input border border-hairline bg-surface p-2.5 text-ink focus:border-brand-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
            title="Membantu menafsirkan tanggal relatif seperti 'besok' atau 'lusa'"
          />
          <span className="block mt-1 text-[11px] text-ink-subtle">
            Isi jika pengumuman memakai istilah relatif seperti “besok”.
          </span>
        </div>

        <div>
          <label htmlFor={timezoneId} className="block text-xs font-medium text-ink-muted mb-1.5">
            Zona Waktu Tampilan
          </label>
          <select
            id={timezoneId}
            value={displayTimezone}
            onChange={(e) => setDisplayTimezone(e.target.value)}
            disabled={isLoading}
            className="w-full text-xs rounded-input border border-hairline bg-surface p-2.5 text-ink focus:border-brand-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
          >
            <option value="Asia/Jakarta">WIB — Waktu Indonesia Barat (UTC+7)</option>
            <option value="Asia/Makassar">WITA — Waktu Indonesia Tengah (UTC+8)</option>
            <option value="Asia/Jayapura">WIT — Waktu Indonesia Timur (UTC+9)</option>
          </select>
          <span className="block mt-1 text-[11px] text-ink-subtle">
            Awalnya mengikuti browser dan dapat dikoreksi.
          </span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-hairline">
        <div className="flex items-center gap-2">
          {onManualAdd && (
            <button
              type="button"
              onClick={onManualAdd}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-ink bg-surface border border-hairline hover:bg-slate-50 px-3.5 py-2.5 rounded-input transition-colors disabled:opacity-50"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>Tambah manual</span>
            </button>
          )}

          {text && (
            <button
              type="button"
              onClick={() => setText('')}
              disabled={isLoading}
              className="text-xs text-ink-subtle hover:text-red-600 px-2.5 py-2 transition-colors disabled:opacity-50"
            >
              Hapus teks
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-input text-sm font-semibold transition-all shadow-sm ${
            isSubmitDisabled
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-brand-600 hover:bg-brand-700 text-white active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <>
              <SpinnerIcon className="w-4 h-4 text-white animate-spin" />
              <span>Mengekstrak tugas...</span>
            </>
          ) : (
            <>
              <SparkleScanIcon className="w-4 h-4 text-white" />
              <span>Ambil tugas</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
