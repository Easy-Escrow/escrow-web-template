import apiClient from './apiClient';
import {CommissionPool, CommissionShare} from './escrows';

export async function getCommissionPool(escrowId: number) {
  const response = await apiClient.get<CommissionPool>(`/escrows/${escrowId}/commission-pool/`);
  return response.data;
}

export async function updateCommissionPool(
    escrowId: number,
    payload: UpdateCommissionPoolPayload,
): Promise<CommissionPool> {
    return apiClient.patch(`/escrows/${escrowId}/commission-pool/`, payload);
}

export async function lockCommissionPool(escrowId: number) {
  const response = await apiClient.post<CommissionPool>(
    `/escrows/${escrowId}/commission-pool/lock/`,
  );
  return response.data;
}

export type CommissionSharePayload = Pick<
    CommissionShare,
    'broker_representation' | 'amount'
>;

export interface UpdateCommissionPoolPayload {
    total_amount: string;
    shares: CommissionSharePayload[];
}

