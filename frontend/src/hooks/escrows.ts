import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createEscrow,
  createParty,
  deleteParty,
  getEscrow,
  listEscrows,
  listParties,
  updateParty,
  type Escrow,
  type CreateEscrowPayload,
  type Party,
} from '@/api/escrows';
import { inviteBroker, listBrokers, respondToInvitation } from '@/api/brokers';
import {
  getCommissionPool,
  lockCommissionPool,
  updateCommissionPool,
} from '@/api/commissionPools';
import type { BrokerRepresentation, CommissionPool } from '@/api/escrows';

export function useEscrows(filters?: { status?: string }) {
  return useQuery({
    queryKey: ['escrows', filters?.status ?? 'all'],
    queryFn: () => listEscrows(filters),
  });
}

export function useEscrow(escrowId?: number) {
  return useQuery({
    queryKey: ['escrow', escrowId],
    enabled: Boolean(escrowId),
    queryFn: () => getEscrow(escrowId as number),
  });
}

export function useCreateEscrow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEscrowPayload) => createEscrow(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escrows'] });
    },
  });
}

export function useParties(escrowId?: number, role?: string) {
  return useQuery({
    queryKey: ['escrow', escrowId, 'parties', role],
    enabled: Boolean(escrowId),
    queryFn: () => listParties(escrowId as number, role),
  });
}

export function useCreateParty(escrowId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Party, 'id' | 'escrow' | 'created_at'>) =>
      createParty(escrowId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escrow', escrowId, 'parties'] });
      queryClient.invalidateQueries({ queryKey: ['escrow', escrowId] });
    },
  });
}

export function useUpdateParty(escrowId: number, partyId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Omit<Party, 'id' | 'escrow' | 'created_at'>>) =>
      updateParty(escrowId, partyId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escrow', escrowId, 'parties'] });
      queryClient.invalidateQueries({ queryKey: ['escrow', escrowId] });
    },
  });
}

export function useDeleteParty(escrowId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (partyId: number) => deleteParty(escrowId, partyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escrow', escrowId, 'parties'] });
      queryClient.invalidateQueries({ queryKey: ['escrow', escrowId] });
    },
  });
}

export function useBrokers(escrowId?: number, filters?: { invited_as?: string; status?: string }) {
  return useQuery({
    queryKey: ['escrow', escrowId, 'brokers', filters?.invited_as, filters?.status],
    enabled: Boolean(escrowId),
    queryFn: () => listBrokers(escrowId as number, filters),
  });
}

export function useInviteBroker(escrowId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { invited_email: string; invited_as: string }) =>
      inviteBroker(escrowId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escrow', escrowId, 'brokers'] });
      queryClient.invalidateQueries({ queryKey: ['escrow', escrowId] });
    },
  });
}

export function useRespondToBroker(escrowId: number, brokerId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Pick<BrokerRepresentation, 'status'>>) =>
      respondToInvitation(escrowId, brokerId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escrow', escrowId, 'brokers'] });
      queryClient.invalidateQueries({ queryKey: ['escrow', escrowId] });
    },
  });
}

export function useRespondToBrokerInvitation(escrowId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ brokerId, status }: { brokerId: number; status: string }) =>
      respondToInvitation(escrowId, brokerId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escrow', escrowId, 'brokers'] });
      queryClient.invalidateQueries({ queryKey: ['escrows'] });
      queryClient.invalidateQueries({ queryKey: ['escrow', escrowId] });
    },
  });
}

export function useCommissionPool(escrowId?: number) {
  return useQuery({
    queryKey: ['escrow', escrowId, 'commission-pool'],
    enabled: Boolean(escrowId),
    queryFn: () => getCommissionPool(escrowId as number),
  });
}

export function useUpdateCommissionPool(escrowId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      payload: Partial<Pick<CommissionPool, 'total_amount' | 'shares'>>,
    ) => updateCommissionPool(escrowId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escrow', escrowId, 'commission-pool'] });
      queryClient.invalidateQueries({ queryKey: ['escrow', escrowId, 'brokers'] });
    },
  });
}

export function useLockCommissionPool(escrowId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => lockCommissionPool(escrowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escrow', escrowId, 'commission-pool'] });
      queryClient.invalidateQueries({ queryKey: ['escrows'] });
    },
  });
}
