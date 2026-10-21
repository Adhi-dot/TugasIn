/**
 * Model Data & Kontrak Tipe Checklist TugasIn
 * Sesuai PRD-TugasIn.md Bagian 9 (Kebutuhan Data & Integrasi)
 */

export type ChecklistOrigin = 'ai' | 'manual';

export interface ChecklistItemData {
  id: string;
  text: string;
  completed: boolean;
  origin: ChecklistOrigin;
}

export interface GenerateChecklistRequest {
  title: string;
  description?: string;
  requirements?: string[];
}

export interface GenerateChecklistResponse {
  steps: string[];
}

export type ChecklistErrorCode =
  | 'INVALID_INPUT'
  | 'UNCONFIGURED_SERVER'
  | 'SERVICE_OVERLOAD_OR_QUOTA'
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'INVALID_AI_RESPONSE';

export interface ChecklistApiError {
  code: ChecklistErrorCode;
  message: string;
}

export interface GenerateChecklistErrorResponse {
  error: ChecklistApiError;
}
