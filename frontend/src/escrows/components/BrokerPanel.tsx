import { FormEvent, useState } from 'react';

import styles from '@/components/escrows.module.css';
import { useBrokers, useInviteBroker } from '@/hooks/escrows';

interface BrokerPanelProps {
    escrowId: number;
}

interface BrokerInvitationState {
    invited_email: string;
    invited_as: 'CO_BROKER' | 'LISTING';
}

export function BrokerPanel({ escrowId }: BrokerPanelProps) {
    const { data: brokers } = useBrokers(escrowId);
    const inviteBroker = useInviteBroker(escrowId);

    const [invitation, setInvitation] = useState<BrokerInvitationState>({
        invited_email: '',
        invited_as: 'CO_BROKER',
    });

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
                        <strong>{broker.invited_email || broker.user?.email}</strong> —{' '}
                        {broker.invited_as}
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
                        onChange={(e) =>
                            setInvitation((prev) => ({
                                ...prev,
                                invited_email: e.target.value,
                            }))
                        }
                        required
                    />
                </div>

                <div className={styles.formRow}>
                    <label htmlFor="invited-as">Invite as</label>
                    <select
                        id="invited-as"
                        value={invitation.invited_as}
                        onChange={(e) =>
                            setInvitation((prev) => ({
                                ...prev,
                                invited_as: e.target.value as BrokerInvitationState['invited_as'],
                            }))
                        }
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
