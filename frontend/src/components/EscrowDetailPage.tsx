import { Link, useParams } from 'react-router-dom';

import styles from './escrows.module.css';
import { EscrowWorkspace } from './EscrowWorkspace';
import { useEscrow } from '@/hooks/escrows';

export function EscrowDetailPage() {
  const params = useParams();
  const escrowId = Number(params.id);
  const { data, isLoading, error } = useEscrow(escrowId);

  return (
    <section className={styles.page}>
      <div className={styles.toolbar}>
        <h2>{data?.name ?? 'Escrow details'}</h2>
        <Link to="/broker/escrows">Back</Link>
      </div>
      {isLoading && <p>Loading escrow...</p>}
      {error && <p role="alert">Unable to load escrow.</p>}
      {data && (
        <>
          <p>{data.description || 'No description available.'}</p>
          <div className={styles.badge}>Status: {data.status}</div>
          <EscrowWorkspace escrowId={escrowId} />
        </>
      )}
    </section>
  );
}
