import React, { useState, useId } from 'react';
import { Sparkles, Plus, Bolt, Lock, AlertCircle } from 'lucide-react';
import { ExtractionRequest } from '../../../types/extraction';

export interface AnnouncementInputFormProps {
  onExtract: (request: ExtractionRequest) => void;
  isLoading: boolean;
  onManualAdd?: () => void;
  initialText?: string;
  className?: string;
}

const MAX_CHAR_COUNT = 5000;

export const AnnouncementInputForm: React.FC<Readonly<AnnouncementInputFormProps>> = ({
  onExtract,
  isLoading,
  onManualAdd,
  initialText = '',
  className = '',
}) => {
  const [text, setText] = useState<string>(initialText);
  const [sourceMessageDate, setSourceMessageDate] = useState<string>('');
  const [displayTimezone] = useState<string>(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta';
    } catch {
      return 'Asia/Jakarta';
    }
  });

  const textareaId = useId();
  const dateInputId = useId();

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

  const handleApplyTemplate = (sampleText: string, sampleDate?: string) => {
    setText(sampleText);
    if (sampleDate) {
      setSourceMessageDate(sampleDate);
    }
  };

  return (
    <section
      id="announcement-extractor-section"
      aria-label="Panel Ekstraksi Pengumuman Tugas"
      className={`bg-forest-green rounded-2xl p-6 text-white border border-emerald-900 shadow-sm ${className}`}
    >
      <form onSubmit={handleSubmit}>
        {/* Top bar: Extractor title & AI Model Tag */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-lime-accent text-dark-ink flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5 text-forest-green" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
                Tempel Pengumuman Tugas
              </h2>
              <p className="text-xs text-on-primary-container mt-0.5">
                Konversi bahasa pengumuman santai menjadi sub-tugas terstruktur &amp; tenggat pasti
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-lime-accent border border-emerald-700/80 flex items-center gap-1.5 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-accent" />
              Gemini AI Extractor
            </span>
          </div>
        </div>

        {/* Textarea Input */}
        <div className="relative">
          <label htmlFor={textareaId} className="sr-only">
            Teks Pengumuman Tugas Kuliah
          </label>
          <textarea
            id={textareaId}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
            rows={4}
            placeholder="Tempel pengumuman dari WhatsApp grup kelas atau LMS di sini... Contoh: 'Halo rek tugas Desain Antarmuka wireframe app perpustakaan dikumpul Jumat 16 Okt jam 23.59 via LMS format PDF maks 3 orang ya'"
            className={`w-full rounded-xl border bg-white/10 text-white placeholder-emerald-200/60 p-4 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-lime-accent focus:border-transparent transition resize-y min-h-[120px] ${
              isOverLimit ? 'border-rose-400 focus:ring-rose-400' : 'border-white/20'
            }`}
          />
        </div>

        {/* Counter & Privacy Notice */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-xs text-emerald-100/90">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-lime-accent shrink-0" />
            <span>Teks pengumuman dikirim aman ke Gemini untuk diproses.</span>
          </div>

          <div className={isOverLimit ? 'text-rose-300 font-bold' : 'text-emerald-200/80'}>
            {charCount.toLocaleString('id-ID')} / {MAX_CHAR_COUNT.toLocaleString('id-ID')} karakter
          </div>
        </div>

        {isOverLimit && (
          <p className="mt-2 text-xs text-rose-300 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Teks melebihi batas 5.000 karakter. Mohon perpendek pengumuman sebelum memproses.
          </p>
        )}

        {/* Extractor Control Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4 pt-3.5 border-t border-white/15">
          {/* Date reference input */}
          <div className="flex items-center gap-2.5">
            <label htmlFor={dateInputId} className="text-xs text-emerald-100/90 whitespace-nowrap">
              Tanggal pesan asal (opsional):
            </label>
            <div className="relative flex items-center">
              <input
                id={dateInputId}
                type="date"
                value={sourceMessageDate}
                onChange={(e) => setSourceMessageDate(e.target.value)}
                disabled={isLoading}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-lime-accent w-40 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {onManualAdd && (
              <button
                type="button"
                onClick={onManualAdd}
                disabled={isLoading}
                className="h-11 px-4 rounded-xl border border-white/30 text-white hover:bg-white/10 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 active:opacity-90 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Manual</span>
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="h-11 px-6 rounded-xl font-bold bg-lime-accent hover:bg-lime-300 text-dark-ink text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-dark-ink border-t-transparent rounded-full animate-spin" />
                  <span>Mengekstrak via Gemini...</span>
                </>
              ) : (
                <>
                  <Bolt className="w-4 h-4 text-forest-green" />
                  <span>Ambil Tugas via Gemini</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Sample Template Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/10">
          <span className="text-xs text-emerald-200/80 font-medium">Coba contoh:</span>
          <button
            type="button"
            onClick={() =>
              handleApplyTemplate(
                'Untuk mata kuliah UI/UX, buat wireframe aplikasi perpustakaan. Maksimal 3 anggota per kelompok. Kumpulkan PDF pada 21 Oktober 2026 pukul 23.59 WIB melalui LMS.'
              )
            }
            className="px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-xs text-white transition-colors flex items-center gap-1.5 border border-white/10"
          >
            <span>Tugas UI/UX Wireframe</span>
          </button>
          <button
            type="button"
            onClick={() =>
              handleApplyTemplate(
                'Halo rek tugas Jaringan Komputer laporan subnetting dikumpul besok ya jam 17.00 di meja dosen format hardcopy.',
                new Date().toISOString().split('T')[0]
              )
            }
            className="px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-xs text-white transition-colors flex items-center gap-1.5 border border-white/10"
          >
            <span>Laporan Jaringan ("Besok")</span>
          </button>
          <button
            type="button"
            onClick={() =>
              handleApplyTemplate(
                'Tugas Review Paper Kecerdasan Buatan minimal 5 halaman rangkuman arsitektur transformer, deadline belum ditentukan dosen.'
              )
            }
            className="px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-xs text-white transition-colors flex items-center gap-1.5 border border-white/10"
          >
            <span>Review Paper (Tanpa Deadline)</span>
          </button>
        </div>
      </form>
    </section>
  );
};
