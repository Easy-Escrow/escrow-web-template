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
          <div className={styles.card}>
            <h3>Deal summary</h3>
            <p>
              Role: <strong>{data.participant_role}</strong> | Moneda: <strong>{data.currency}</strong> | Tipo:{' '}
              <strong>{data.transaction_type}</strong>
            </p>
            <p>
              Propiedad: <strong>{data.property_type}</strong> — Valor: <strong>{data.currency} {data.property_value}</strong>
            </p>
            <p>Dirección: {data.property_address}</p>
            <p>Fecha estimada de cierre: {data.closing_date}</p>
          </div>
          <EscrowWorkspace escrowId={escrowId} />
        </>
      )}
    </section>
  );
}
