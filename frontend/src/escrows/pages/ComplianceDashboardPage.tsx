import { Link } from 'react-router-dom';

import styles from '@/components/escrows.module.css';

export function ComplianceDashboardPage() {
  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <h2>Compliance</h2>
        <p>Review KYC and document status for current escrows.</p>
        <div className={styles.list}>
          <div className={styles.listItem}>
            <div>
              <strong>KYC queue</strong>
              <p>Monitor participant KYC checklists and trigger AML/OFAC runs.</p>
            </div>
            <Link to="/broker/escrows">Open escrows</Link>
          </div>
          <div className={styles.listItem}>
            <div>
              <strong>Documents</strong>
              <p>Approve uploads and DocuSign envelopes from participants.</p>
            </div>
            <Link to="/broker/escrows">Review documents</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
