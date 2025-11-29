import styles from './escrows.module.css';
import { useEscrows, useRespondToBrokerInvitation } from '@/hooks/escrows';
import { useAuth } from '@/auth/authHooks';

export function CoBrokerInvitationsPage() {
  const { user } = useAuth();
  const { data, isLoading } = useEscrows();

  const invitations = (data?.results ?? [])
    .flatMap((escrow) =>
      escrow.broker_representations
        .filter(
          (broker) =>
            broker.status === 'PENDING' &&
            (broker.invited_email === user?.email || broker.user?.email === user?.email),
        )
        .map((broker) => ({ escrow, broker })),
    )
    .flat();

  return (
    <section className={styles.page}>
      <h2>Co-broker invitations</h2>
      {isLoading && <p>Loading invitations...</p>}
      {invitations.length === 0 && <p>No pending invitations.</p>}
      <div className={styles.grid}>
        {invitations.map(({ escrow, broker }) => (
          <InvitationCard key={broker.id} escrowId={escrow.id} escrowName={escrow.name} brokerId={broker.id} />
        ))}
      </div>
    </section>
  );
}

function InvitationCard({
  escrowId,
  escrowName,
  brokerId,
}: {
  escrowId: number;
  escrowName: string;
  brokerId: number;
}) {
  const respond = useRespondToBrokerInvitation(escrowId);

  return (
    <div className={styles.card}>
      <h3>{escrowName}</h3>
      <p>You have been invited to collaborate on this escrow.</p>
      <div className={styles.actions}>
        <button type="button" onClick={() => respond.mutate({ brokerId, status: 'ACCEPTED' })}>
          Accept
        </button>
        <button type="button" onClick={() => respond.mutate({ brokerId, status: 'DECLINED' })}>
          Decline
        </button>
      </div>
    </div>
  );
}
