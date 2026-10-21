import { useState, useRef, useCallback } from 'react';
import { ExtractionRequest, ExtractionResponse, ExtractionErrorState } from '../types/extraction';
import { extractTaskFromAnnouncement } from '../services/extractionService';

export interface UseExtractionReturn {
  isLoading: boolean;
  error: ExtractionErrorState | null;
  result: ExtractionResponse | null;
  extract: (request: ExtractionRequest) => Promise<ExtractionResponse | null>;
  cancelExtraction: () => void;
  clearError: () => void;
  resetResult: () => void;
}

export function useExtraction(): UseExtractionReturn {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ExtractionErrorState | null>(null);
  const [result, setResult] = useState<ExtractionResponse | null>(null);

  // Menyimpan id request aktif untuk mencegah late-arrival response menimpa state terbaru
  const currentRequestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancelExtraction = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetResult = useCallback(() => {
    setResult(null);
  }, []);

  const extract = useCallback(
    async (request: ExtractionRequest): Promise<ExtractionResponse | null> => {
      // Batalkan request yang sedang berlangsung jika ada (cegah race condition / double request)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const newAbortController = new AbortController();
      abortControllerRef.current = newAbortController;

      const requestId = ++currentRequestIdRef.current;
      setIsLoading(true);
      setError(null);

      try {
        const response = await extractTaskFromAnnouncement(request, newAbortController.signal);

        // Abaikan respons jika id request sudah bukan yang terbaru (late-arrival protection)
        if (requestId !== currentRequestIdRef.current) {
          return null;
        }

        setIsLoading(false);
        setResult(response);
        return response;
      } catch (err: unknown) {
        // Abaikan jika request dibatalkan secara sengaja atau bukan request terbaru
        if (requestId !== currentRequestIdRef.current) {
          return null;
        }

        setIsLoading(false);

        if (err instanceof Error && err.message === 'USER_ABORT') {
          return null;
        }

        if (typeof err === 'object' && err !== null && 'type' in err) {
          setError(err as ExtractionErrorState);
        } else {
          setError({
            type: 'UNKNOWN_ERROR',
            message: 'Terjadi kesalahan yang tidak terduga saat mengekstrak tugas.',
            actionableHint: 'Silakan coba lagi beberapa saat lagi.',
          });
        }

        return null;
      }
    },
    []
  );

  return {
    isLoading,
    error,
    result,
    extract,
    cancelExtraction,
    clearError,
    resetResult,
  };
}
