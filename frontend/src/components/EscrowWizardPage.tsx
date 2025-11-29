import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';

import styles from './escrows.module.css';
import { EscrowWorkspace } from './EscrowWorkspace';
import { useCreateEscrow } from '@/hooks/escrows';

export function EscrowWizardPage() {
  const createEscrow = useCreateEscrow();
  const [escrowId, setEscrowId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const escrow = await createEscrow.mutateAsync(form);
    setEscrowId(escrow.id);
  };

  return (
    <section className={styles.page}>
      <div className={styles.toolbar}>
        <h2>Create escrow</h2>
        <Link to="/broker/escrows">Back to list</Link>
      </div>

      {!escrowId && (
        <form onSubmit={handleSubmit} className={styles.card}>
          <div className={styles.formRow}>
            <label htmlFor="escrow-name">Name</label>
            <input
              id="escrow-name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className={styles.formRow}>
            <label htmlFor="escrow-description">Description</label>
            <textarea
              id="escrow-description"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <button type="submit">Create and continue</button>
        </form>
      )}

      {escrowId && (
        <>
          <p>Escrow created. Continue by adding parties, inviting co-brokers, and defining commissions.</p>
          <EscrowWorkspace escrowId={escrowId} />
        </>
      )}
    </section>
  );
}
