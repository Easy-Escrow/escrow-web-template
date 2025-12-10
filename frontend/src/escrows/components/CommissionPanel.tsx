import { FormEvent, useEffect, useMemo, useState } from 'react';

import styles from '@/components/escrows.module.css';
import {
    useBrokers,
    useCommissionPool,
    useLockCommissionPool,
    useUpdateCommissionPool,
} from '@/hooks/escrows';
import type { BrokerRepresentation } from '@/api/escrows';

interface CommissionPanelProps {
    escrowId: number;
}

export function CommissionPanel({ escrowId }: CommissionPanelProps) {
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

    const brokerOptions = useMemo(
        () => brokers ?? [],
        [brokers],
    );

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
                        <button
                            type="button"
                            onClick={() => lockPool.mutate()}
                            disabled={pool.locked}
                        >
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
