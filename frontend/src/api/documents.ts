import apiClient from './apiClient';

export interface Document {
  id: number;
  escrow: number;
  name: string;
  document_type: string;
  storage_key: string;
  storage_url: string;
  status: string;
  uploaded_by?: number | null;
  docu_sign_envelope_id?: string;
  docu_sign_status?: string;
  uploaded_at: string;
  updated_at: string;
}

export interface PresignResponse {
  upload_url: string;
  storage_key: string;
}

export async function listDocuments(escrowId: number) {
  const response = await apiClient.get<Document[]>(`/escrows/${escrowId}/documents/`);
  return response.data;
}

export async function createDocument(
  escrowId: number,
  payload: Pick<Document, 'name' | 'document_type'>,
) {
  const response = await apiClient.post<Document>(`/escrows/${escrowId}/documents/`, payload);
  return response.data;
}

export async function requestPresign(escrowId: number, fileName: string, contentType?: string) {
  const response = await apiClient.post<PresignResponse>(`/escrows/${escrowId}/documents/presign/`, {
    file_name: fileName,
    content_type: contentType,
  });
  return response.data;
}

export async function markUploaded(escrowId: number, documentId: number, storageKey: string, storageUrl: string) {
  const response = await apiClient.post<Document>(
    `/escrows/${escrowId}/documents/${documentId}/mark-uploaded/`,
    { storage_key: storageKey, storage_url: storageUrl },
  );
  return response.data;
}

export async function triggerEnvelope(escrowId: number, documentId: number) {
  const response = await apiClient.post<Document>(
    `/escrows/${escrowId}/documents/${documentId}/trigger-envelope/`,
  );
  return response.data;
}
