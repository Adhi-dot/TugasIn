import React, { useState, useEffect, useRef } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { ChecklistItemData } from '../../types/checklist';

export interface ChecklistItemProps {
  readonly item: ChecklistItemData;
  readonly isEditing: boolean;
  readonly onToggle: (id: string) => void;
  readonly onStartEdit: (id: string) => void;
  readonly onSaveEdit: (id: string, text: string) => boolean;
  readonly onCancelEdit: () => void;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({
  item,
  isEditing,
  onToggle,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
}) => {
  const [editText, setEditText] = useState(item.text);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setEditText(item.text);
      setValidationError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isEditing, item.text]);

  const handleSave = () => {
    const trimmed = editText.trim();
    if (trimmed.length === 0) {
      setValidationError('Teks langkah tidak boleh kosong.');
      return;
    }
    if (trimmed.length > 250) {
      setValidationError('Maksimal 250 karakter.');
      return;
    }
    const success = onSaveEdit(item.id, trimmed);
    if (!success) {
      setValidationError('Gagal menyimpan perubahan.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancelEdit();
    }
  };

  if (isEditing) {
    return (
      <div className="p-3 bg-surface-container-low border border-outline-variant/50 rounded-xl space-y-2 transition-all">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={editText}
            onChange={(e) => {
              setEditText(e.target.value);
              if (validationError) setValidationError(null);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 px-3 py-1.5 text-xs sm:text-sm bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-dark-ink focus:outline-none focus:ring-2 focus:ring-forest-green"
            placeholder="Tuliskan langkah pengerjaan..."
            maxLength={250}
          />
          <button
            type="button"
            onClick={handleSave}
            className="px-3 py-1.5 bg-forest-green hover:bg-[#193e31] text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm transition"
            aria-label="Simpan teks langkah"
          >
            <Check className="w-3.5 h-3.5 text-lime-accent" />
            <span>Simpan</span>
          </button>
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-2.5 py-1.5 text-outline hover:text-dark-ink text-xs font-semibold rounded-lg hover:bg-surface-container-high transition"
            aria-label="Batal edit langkah"
          >
            <X className="w-3.5 h-3.5" />
            <span>Batal</span>
          </button>
        </div>
        {validationError && (
          <p className="text-xs text-rose-600 font-medium">{validationError}</p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`group flex items-start justify-between gap-3 p-3 rounded-xl border transition-all ${
        item.completed
          ? 'bg-surface-container-low/70 border-outline-variant/30'
          : 'bg-surface-container-lowest hover:bg-surface-container-low/50 border-outline-variant/40 hover:border-outline-variant/80'
      }`}
    >
      <label className="flex items-start gap-3 flex-1 cursor-pointer select-none">
        <div className="pt-0.5 relative">
          <input
            type="checkbox"
            checked={item.completed}
            onChange={() => onToggle(item.id)}
            className="sr-only"
            aria-label={`Tandai langkah "${item.text}" sebagai ${item.completed ? 'belum selesai' : 'selesai'}`}
          />
          <div
            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
              item.completed
                ? 'bg-forest-green border-forest-green text-lime-accent'
                : 'bg-surface-container-lowest border-outline-variant/60 group-hover:border-forest-green'
            }`}
          >
            {item.completed && (
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.5 4.5L6.5 11.5L3 8"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>

        <span
          className={`text-xs sm:text-sm leading-relaxed transition-colors ${
            item.completed
              ? 'line-through text-outline'
              : 'text-dark-ink font-normal'
          }`}
        >
          {item.text}
        </span>
      </label>

      <button
        type="button"
        onClick={() => onStartEdit(item.id)}
        className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 text-outline hover:text-dark-ink hover:bg-surface-container-high rounded-lg transition"
        title="Edit teks langkah"
        aria-label={`Edit teks langkah: ${item.text}`}
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
