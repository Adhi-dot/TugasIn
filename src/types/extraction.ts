import { TaskDraft } from './task';

/**
 * Kontrak Backend Ekstraksi (POST /api/extract-task)
 */

export type ExtractionResultType = 'task' | 'no_task' | 'multiple_tasks';

export interface ExtractionRequest {
  text: string;                     // 1-5000 karakter, non-whitespace
  sourceMessageDate?: string | null;// Format YYYY-MM-DD
  displayTimezone: string;          // IANA timezone, e.g. "Asia/Jakarta"
}

export interface ExtractionResponse {
  resultType: ExtractionResultType;
  draft?: TaskDraft | null;
  warnings?: string[];
  criticalFieldEvidence?: Record<string, string>;
  message?: string;
  isSimulated?: boolean;
}

export type ExtractionErrorType = 
  | 'INVALID_INPUT'
  | 'RATE_LIMIT_OR_QUOTA'
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'INVALID_RESPONSE'
  | 'UNKNOWN_ERROR';

export interface ExtractionErrorState {
  type: ExtractionErrorType;
  message: string;
  actionableHint: string;
}
