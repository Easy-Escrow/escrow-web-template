import { DocumentManager } from '@/components/DocumentManager';
import styles from '@/components/escrows.module.css';

export function EscrowDocumentsPage() {
  return (
    <section className={styles.page}>
      <DocumentManager />
    </section>
  );
}
