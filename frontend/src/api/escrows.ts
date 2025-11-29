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
  status: string;
  created_by: { id: number; email: string };
  created_at: string;
  updated_at: string;
  parties: Party[];
  broker_representations: BrokerRepresentation[];
  commission_pool?: CommissionPool;
}

export async function listEscrows(params?: { status?: string }) {
  const response = await apiClient.get<PaginatedResponse<Escrow>>('/escrows/', { params });
  return response.data;
}

export async function getEscrow(id: number) {
  const response = await apiClient.get<Escrow>(`/escrows/${id}/`);
  return response.data;
}

export async function createEscrow(payload: { name: string; description?: string }) {
  const response = await apiClient.post<Escrow>('/escrows/', payload);
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
