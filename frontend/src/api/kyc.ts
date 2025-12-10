import apiClient from './apiClient';

export interface AMLCheck {
  id: number;
  record: number;
  provider: string;
  status: string;
  requested_by?: number | null;
  requested_at: string;
  completed_at: string | null;
  notes?: string;
  result_payload?: Record<string, unknown>;
}

export interface KYCRecord {
  id: number;
  escrow: number;
  subject_name: string;
  subject_email?: string;
  status: string;
  checklist: Record<string, unknown>;
  aml_checks: AMLCheck[];
}

export async function listKyc(escrowId: number) {
  const response = await apiClient.get<KYCRecord[]>(`/escrows/${escrowId}/kyc/`);
  return response.data;
}

export async function createKyc(escrowId: number, payload: Omit<KYCRecord, 'id' | 'aml_checks' | 'escrow'>) {
  const response = await apiClient.post<KYCRecord>(`/escrows/${escrowId}/kyc/`, payload);
  return response.data;
}

export async function runAml(recordId: number, escrowId: number) {
  const response = await apiClient.post(`/escrows/${escrowId}/kyc/${recordId}/run-aml/`);
  return response.data as AMLCheck;
}

export async function createAmlCheck(recordId: number, provider: string) {
  const response = await apiClient.post<AMLCheck>(`/kyc/${recordId}/aml-checks/`, { provider });
  return response.data;
}
