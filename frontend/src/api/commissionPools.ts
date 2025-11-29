import apiClient from './apiClient';
import { CommissionPool } from './escrows';

export async function getCommissionPool(escrowId: number) {
  const response = await apiClient.get<CommissionPool>(`/escrows/${escrowId}/commission-pool/`);
  return response.data;
}

export async function updateCommissionPool(
  escrowId: number,
  payload: Partial<Pick<CommissionPool, 'total_amount' | 'shares'>>,
) {
  const response = await apiClient.patch<CommissionPool>(
    `/escrows/${escrowId}/commission-pool/`,
    payload,
  );
  return response.data;
}

export async function lockCommissionPool(escrowId: number) {
  const response = await apiClient.post<CommissionPool>(
    `/escrows/${escrowId}/commission-pool/lock/`,
  );
  return response.data;
}
