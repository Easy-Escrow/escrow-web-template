import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  createDocument,
  listDocuments,
  markUploaded,
  requestPresign,
  triggerEnvelope,
  type Document,
} from '@/api/documents';
import styles from './escrows.module.css';

export function DocumentManager() {
  const params = useParams();
  const escrowId = Number(params.id);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listDocuments(escrowId);
      setDocuments(data);
    } catch (err) {
      console.error(err);
      setError('Unable to load documents');
    } finally {
      setLoading(false);
    }
  }, [escrowId]);

  useEffect(() => {
    if (Number.isFinite(escrowId)) {
      load();
    }
  }, [escrowId, load]);

  async function handleCreate(type: string) {
    setError(null);
    try {
      await createDocument(escrowId, { name: `${type} file`, document_type: type });
      await load();
    } catch (err) {
      console.error(err);
      setError('Could not create document placeholder');
    }
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>, documentId: number) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingId(documentId);
    try {
      const presign = await requestPresign(escrowId, file.name, file.type);
      // Simulate S3 upload with fetch
      await fetch(presign.upload_url, { method: 'PUT', body: file });
      await markUploaded(escrowId, documentId, presign.storage_key, presign.upload_url);
      await load();
    } catch (err) {
      console.error(err);
      setError('Upload failed');
    } finally {
      setUploadingId(null);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  async function handleEnvelope(documentId: number) {
    setError(null);
    try {
      await triggerEnvelope(escrowId, documentId);
      await load();
    } catch (err) {
      console.error(err);
      setError('Unable to trigger DocuSign envelope');
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.toolbar}>
        <h3>Documents</h3>
        <Link to={`/escrows/${escrowId}`}>Back to escrow</Link>
      </div>
      {loading && <p>Loading documents...</p>}
      {error && <p role="alert">{error}</p>}
      <div className={styles.actions}>
        <button type="button" onClick={() => handleCreate('ID')}>
          Request ID
        </button>
        <button type="button" onClick={() => handleCreate('Proof of funds')}>
          Request Proof of Funds
        </button>
      </div>
      <ul className={styles.list}>
        {documents.map((doc) => (
          <li key={doc.id} className={styles.listItem}>
            <div>
              <strong>{doc.name}</strong> <small>({doc.document_type})</small>
              <div className={styles.badge}>Status: {doc.status}</div>
              {doc.docu_sign_envelope_id && <div className={styles.badge}>Envelope: {doc.docu_sign_status}</div>}
            </div>
            <div className={styles.actions}>
              <input
                ref={fileInput}
                type="file"
                onChange={(e) => handleUpload(e, doc.id)}
                disabled={uploadingId === doc.id}
              />
              <button type="button" onClick={() => handleEnvelope(doc.id)}>
                Send DocuSign
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
