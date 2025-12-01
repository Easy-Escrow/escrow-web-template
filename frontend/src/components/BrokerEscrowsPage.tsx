import { Link } from 'react-router-dom';

import styles from './escrows.module.css';
import { useEscrows } from '@/hooks/escrows';

export function BrokerEscrowsPage() {
  const { data, isLoading, error } = useEscrows();

  return (
    <section className={styles.page}>
      <div className={styles.toolbar}>
        <h2>My Escrows</h2>
        <Link to="/broker/escrows/new">Start new escrow</Link>
      </div>
      {isLoading && <p>Loading escrows...</p>}
      {error && <p role="alert">Unable to load escrows.</p>}
      <div className={styles.grid}>
        {data?.results?.map((escrow) => (
          <div key={escrow.id} className={styles.card}>
            <div className={styles.toolbar}>
              <h3>{escrow.name}</h3>
              <span className={styles.badge}>{escrow.status}</span>
            </div>
            <p>{escrow.description || 'No description provided.'}</p>
            <p>
              Parties: <strong>{escrow.parties?.length ?? 0}</strong> | Brokers:{' '}
              <strong>{escrow.broker_representations?.length ?? 0}</strong>
            </p>
            <Link to={`/broker/escrows/${escrow.id}`}>Open</Link>
          </div>
        ))}
      </div>
    </section>
  );
}
