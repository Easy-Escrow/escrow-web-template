import { FormEvent, useEffect, useMemo, useState } from 'react';

import styles from './escrows.module.css';
import {
  useBrokers,
  useCommissionPool,
  useCreateParty,
  useDeleteParty,
  useInviteBroker,
  useLockCommissionPool,
  useParties,
  useUpdateCommissionPool,
} from '@/hooks/escrows';
import type { BrokerRepresentation } from '@/api/escrows';

interface EscrowWorkspaceProps {
  escrowId: number;
}

export function EscrowWorkspace({ escrowId }: EscrowWorkspaceProps) {
  return (
    <div className={styles.grid}>
      <PartyPanel escrowId={escrowId} />
      <BrokerPanel escrowId={escrowId} />
      <CommissionPanel escrowId={escrowId} />
    </div>
  );
}

function PartyPanel({ escrowId }: { escrowId: number }) {
  const { data: parties, isLoading } = useParties(escrowId);
  const createParty = useCreateParty(escrowId);
  const deleteParty = useDeleteParty(escrowId);
  const [form, setForm] = useState({ name: '', email: '', role: 'BUYER' });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await createParty.mutateAsync(form);
    setForm({ name: '', email: '', role: 'BUYER' });
  };

  return (
    <div className={styles.card}>
      <div className={styles.toolbar}>
        <h3>Parties</h3>
        <span className={styles.badge}>{parties?.length ?? 0}</span>
      </div>
      {isLoading && <p>Loading parties...</p>}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(parties ?? []).map((party) => (
            <tr key={party.id}>
              <td>{party.name}</td>
              <td>{party.role}</td>
              <td>{party.email || '—'}</td>
              <td>
                <button type="button" onClick={() => deleteParty.mutate(party.id)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={handleSubmit}>
        <div className={styles.formRow}>
          <label htmlFor="party-name">Name</label>
          <input
            id="party-name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div className={styles.formRow}>
          <label htmlFor="party-email">Email</label>
          <input
            id="party-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
        </div>
        <div className={styles.formRow}>
          <label htmlFor="party-role">Role</label>
          <select
            id="party-role"
            value={form.role}
            onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
          >
            <option value="BUYER">Buyer</option>
            <option value="SELLER">Seller</option>
            <option value="LENDER">Lender</option>
          </select>
        </div>
        <button type="submit">Add party</button>
      </form>
    </div>
  );
}

function BrokerPanel({ escrowId }: { escrowId: number }) {
  const { data: brokers } = useBrokers(escrowId);
  const inviteBroker = useInviteBroker(escrowId);
  const [invitation, setInvitation] = useState({ invited_email: '', invited_as: 'CO_BROKER' });

  const handleInvite = async (event: FormEvent) => {
    event.preventDefault();
    await inviteBroker.mutateAsync(invitation);
    setInvitation({ invited_email: '', invited_as: 'CO_BROKER' });
  };

  return (
    <div className={styles.card}>
      <div className={styles.toolbar}>
        <h3>Broker invitations</h3>
        <span className={styles.badge}>{brokers?.length ?? 0}</span>
      </div>
      <ul>
        {(brokers ?? []).map((broker) => (
          <li key={broker.id}>
            <strong>{broker.invited_email || broker.user?.email}</strong> — {broker.invited_as}
            <span className={styles.badge}>{broker.status}</span>
          </li>
        ))}
      </ul>
      <form onSubmit={handleInvite}>
        <div className={styles.formRow}>
          <label htmlFor="broker-email">Invite co-broker</label>
          <input
            id="broker-email"
            type="email"
            value={invitation.invited_email}
            onChange={(e) => setInvitation((prev) => ({ ...prev, invited_email: e.target.value }))}
            required
          />
        </div>
        <div className={styles.formRow}>
          <label htmlFor="invited-as">Invite as</label>
          <select
            id="invited-as"
            value={invitation.invited_as}
            onChange={(e) => setInvitation((prev) => ({ ...prev, invited_as: e.target.value }))}
          >
            <option value="CO_BROKER">Co-Broker</option>
            <option value="LISTING">Listing</option>
          </select>
        </div>
        <button type="submit">Send invitation</button>
      </form>
    </div>
  );
}

function CommissionPanel({ escrowId }: { escrowId: number }) {
  const { data: brokers = [] } = useBrokers(escrowId);
  const { data: pool } = useCommissionPool(escrowId);
  const updatePool = useUpdateCommissionPool(escrowId);
  const lockPool = useLockCommissionPool(escrowId);
  const [totalAmount, setTotalAmount] = useState('');
  const [shareInputs, setShareInputs] = useState<Record<number, string>>({});

  useEffect(() => {
    if (pool) {
      setTotalAmount(pool.total_amount);
      setShareInputs(
        pool.shares.reduce<Record<number, string>>((acc, share) => {
          acc[share.broker_representation] = share.amount;
          return acc;
        }, {}),
      );
    }
  }, [pool]);

  const brokerOptions = useMemo(() => brokers ?? [], [brokers]);

  const handleShareChange = (brokerId: number, value: string) => {
    setShareInputs((prev) => ({ ...prev, [brokerId]: value }));
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!pool) return;
    const shares = brokerOptions.map((broker: BrokerRepresentation) => ({
      broker_representation: broker.id,
      amount: shareInputs[broker.id] ?? '0',
    }));
    await updatePool.mutateAsync({
      total_amount: totalAmount,
      shares,
    });
  };

  return (
    <div className={styles.card}>
      <div className={styles.toolbar}>
        <h3>Commission pool</h3>
        {pool?.locked && <span className={styles.badge}>Locked</span>}
      </div>
      {pool ? (
        <form onSubmit={handleSave}>
          <div className={styles.formRow}>
            <label htmlFor="total-amount">Total commission</label>
            <input
              id="total-amount"
              type="number"
              step="0.01"
              value={totalAmount}
              disabled={pool.locked}
              onChange={(e) => setTotalAmount(e.target.value)}
            />
          </div>
          <div className={styles.formRow}>
            <label>Share allocations</label>
            {(brokerOptions ?? []).map((broker) => (
              <div key={broker.id} className={styles.formRow}>
                <span>{broker.invited_email || broker.user?.email}</span>
                <input
                  type="number"
                  step="0.01"
                  value={shareInputs[broker.id] ?? ''}
                  disabled={pool.locked}
                  onChange={(e) => handleShareChange(broker.id, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className={styles.actions}>
            <button type="submit" disabled={pool.locked}>
              Save commission
            </button>
            <button type="button" onClick={() => lockPool.mutate()} disabled={pool.locked}>
              Lock commissions
            </button>
          </div>
        </form>
      ) : (
        <p>Loading commission pool...</p>
      )}
    </div>
  );
}
