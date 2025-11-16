import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export const http = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

export type ApiHealth = {
  status: string;
};

export async function fetchHealth(): Promise<ApiHealth> {
  const response = await http.get('/health/');
  return response.data;
}
