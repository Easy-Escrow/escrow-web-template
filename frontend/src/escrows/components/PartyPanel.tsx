import { FormEvent, useState } from 'react';

import styles from '@/components/escrows.module.css';
import {
    useCreateParty,
    useDeleteParty,
    useParties,
} from '@/hooks/escrows';

interface PartyPanelProps {
    escrowId: number;
}

interface PartyFormState {
    name: string;
    email: string;
    role: 'BUYER' | 'SELLER' | 'BROKER';
}

export function PartyPanel({ escrowId }: PartyPanelProps) {
    const { data: parties, isLoading } = useParties(escrowId);
    const createParty = useCreateParty(escrowId);
    const deleteParty = useDeleteParty(escrowId);

    const [form, setForm] = useState<PartyFormState>({
        name: '',
        email: '',
        role: 'BUYER',
    });

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
                            <button
                                type="button"
                                onClick={() => deleteParty.mutate(party.id)}
                            >
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
                        onChange={(e) =>
                            setForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                        required
                    />
                </div>

                <div className={styles.formRow}>
                    <label htmlFor="party-email">Email</label>
                    <input
                        id="party-email"
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                            setForm((prev) => ({ ...prev, email: e.target.value }))
                        }
                    />
                </div>

                <div className={styles.formRow}>
                    <label htmlFor="party-role">Role</label>
                    <select
                        id="party-role"
                        value={form.role}
                        onChange={(e) =>
                            setForm((prev) => ({
                                ...prev,
                                role: e.target.value as PartyFormState['role'],
                            }))
                        }
                    >
                        <option value="BUYER">Buyer</option>
                        <option value="SELLER">Seller</option>
                        <option value="BROKER">Broker</option>
                    </select>
                </div>

                <button type="submit">Add party</button>
            </form>
        </div>
    );
}
