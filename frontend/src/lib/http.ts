import apiClient from '../api/apiClient';

export const http = apiClient;

export type ApiHealth = {
  status: string;
};

export async function fetchHealth(): Promise<ApiHealth> {
  const response = await http.get('/health/');
  return response.data;
}
