import apiClient from './apiClient';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Party {
  id: number;
  escrow: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface BrokerRepresentation {
  id: number;
  escrow: number;
  invited_email: string;
  invited_as: string;
  status: string;
  invited_at: string;
  responded_at: string | null;
  invited_by?: { id: number; email: string } | null;
  user?: { id: number; email: string } | null;
}

export interface CommissionShare {
  id: number;
  broker_representation: number;
  amount: string;
}

export interface CommissionPool {
  id: number;
  escrow: number;
  total_amount: string;
  locked: boolean;
  locked_at: string | null;
  shares: CommissionShare[];
}

export interface Escrow {
  id: number;
  name: string;
  description: string;
  participant_role: string;
  currency: string;
  transaction_type: string;
  property_type: string;
  property_value: string;
  closing_date: string | null;
  property_address: string;
  commission_percentage?: string | null;
  commission_payer?: string | null;
  commission_payment_date?: string | null;
  broker_a_name?: string | null;
  broker_a_percentage?: string | null;
  broker_b_name?: string | null;
  broker_b_percentage?: string | null;
  due_diligence_scope?: string | null;
  due_diligence_days?: number | null;
  due_diligence_deadline?: string | null;
  due_diligence_fee?: string | null;
  hidden_defects_description?: string | null;
  retention_amount?: string | null;
  resolution_days?: number | null;
  responsible_party?: string | null;
  agreement_upload?: string | null;
  status: string;
  created_by: { id: number; email: string };
  created_at: string;
  updated_at: string;
  parties: Party[];
  broker_representations: BrokerRepresentation[];
  commission_pool?: CommissionPool;
}

export interface CreateEscrowPayload {
  name: string;
  description?: string;
  participant_role: string;
  currency: string;
  transaction_type: string;
  property_type: string;
  property_value: string | number;
  closing_date: string;
  property_address: string;
  commission_percentage?: string | number;
  commission_payer?: string;
  commission_payment_date?: string;
  broker_a_name?: string;
  broker_a_percentage?: string | number;
  broker_b_name?: string;
  broker_b_percentage?: string | number;
  due_diligence_scope?: string;
  due_diligence_days?: number | string;
  due_diligence_deadline?: string;
  due_diligence_fee?: string | number;
  hidden_defects_description?: string;
  retention_amount?: string | number;
  resolution_days?: number | string;
  responsible_party?: string;
  agreement_upload?: File | null;
}

export async function listEscrows(params?: { status?: string }) {
  const response = await apiClient.get<PaginatedResponse<Escrow>>('/escrows/', { params });
  return response.data;
}

export async function getEscrow(id: number) {
  const response = await apiClient.get<Escrow>(`/escrows/${id}/`);
  return response.data;
}

export async function createEscrow(payload: CreateEscrowPayload) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value as any);
    }
  });

  const response = await apiClient.post<Escrow>('/escrows/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function listParties(escrowId: number, role?: string) {
  const response = await apiClient.get<Party[]>(`/escrows/${escrowId}/parties/`, {
    params: role ? { role } : undefined,
  });
  return response.data;
}

export async function createParty(escrowId: number, payload: Omit<Party, 'id' | 'escrow' | 'created_at'>) {
  const response = await apiClient.post<Party>(`/escrows/${escrowId}/parties/`, payload);
  return response.data;
}

export async function updateParty(
  escrowId: number,
  partyId: number,
  payload: Partial<Omit<Party, 'id' | 'escrow' | 'created_at'>>,
) {
  const response = await apiClient.patch<Party>(
    `/escrows/${escrowId}/parties/${partyId}/`,
    payload,
  );
  return response.data;
}

export async function deleteParty(escrowId: number, partyId: number) {
  await apiClient.delete(`/escrows/${escrowId}/parties/${partyId}/`);
}
