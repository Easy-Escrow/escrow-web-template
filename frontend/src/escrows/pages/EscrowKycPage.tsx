import { KycChecklist } from '@/components/KycChecklist';
import styles from '@/components/escrows.module.css';

export function EscrowKycPage() {
  return (
    <section className={styles.page}>
      <KycChecklist />
    </section>
  );
}
