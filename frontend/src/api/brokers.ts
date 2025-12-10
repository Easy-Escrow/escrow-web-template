import apiClient from './apiClient';
import { BrokerRepresentation } from './escrows';

export async function listBrokers(
  escrowId: number,
  params?: { invited_as?: string; status?: string },
) {
  const response = await apiClient.get<BrokerRepresentation[]>(
    `/escrows/${escrowId}/brokers/`,
    { params },
  );
  return response.data;
}

export async function inviteBroker(escrowId: number, payload: { invited_email: string; invited_as: string }) {
  const response = await apiClient.post<BrokerRepresentation>(
    `/escrows/${escrowId}/brokers/`,
    payload,
  );
  return response.data;
}

export async function respondToInvitation(
  escrowId: number,
  brokerId: number,
  payload: Partial<Pick<BrokerRepresentation, 'status'>>,
) {
  const response = await apiClient.patch<BrokerRepresentation>(
    `/escrows/${escrowId}/brokers/${brokerId}/`,
    payload,
  );
  return response.data;
}
