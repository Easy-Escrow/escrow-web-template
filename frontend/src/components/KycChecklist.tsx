import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { createKyc, listKyc, runAml, type KYCRecord } from '@/api/kyc';
import styles from './escrows.module.css';

export function KycChecklist() {
  const params = useParams();
  const escrowId = Number(params.id);
  const [records, setRecords] = useState<KYCRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runningAml, setRunningAml] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listKyc(escrowId);
      setRecords(data);
    } catch (err) {
      console.error(err);
      setError('Unable to load KYC records');
    } finally {
      setLoading(false);
    }
  }, [escrowId]);

  useEffect(() => {
    if (Number.isFinite(escrowId)) {
      load();
    }
  }, [escrowId, load]);

  async function handleStart() {
    setError(null);
    try {
      await createKyc(escrowId, {
        subject_name: 'Primary participant',
        subject_email: '',
        status: 'STARTED',
        checklist: {},
      });
      await load();
    } catch (err) {
      console.error(err);
      setError('Could not start KYC');
    }
  }

  async function handleRunAml(recordId: number) {
    setRunningAml(recordId);
    try {
      await runAml(recordId, escrowId);
      await load();
    } catch (err) {
      console.error(err);
      setError('Failed to trigger AML check');
    } finally {
      setRunningAml(null);
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.toolbar}>
        <h3>KYC Checklist</h3>
        <Link to={`/escrows/${escrowId}`}>Back to escrow</Link>
      </div>
      {loading && <p>Loading KYC...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && records.length === 0 && (
        <button type="button" onClick={handleStart} className={styles.primary}>
          Start KYC
        </button>
      )}
      <ul className={styles.list}>
        {records.map((record) => (
          <li key={record.id} className={styles.listItem}>
            <div>
              <strong>{record.subject_name}</strong>
              <div className={styles.badge}>Status: {record.status}</div>
              <small>AML runs: {record.aml_checks.length}</small>
            </div>
            <div className={styles.actions}>
              <button type="button" onClick={() => handleRunAml(record.id)} disabled={runningAml === record.id}>
                {runningAml === record.id ? 'Running AML...' : 'Run AML/OFAC'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
