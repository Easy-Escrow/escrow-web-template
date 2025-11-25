import apiClient from './apiClient';

export interface AuthTokens {
  access: string;
  refresh: string;
  user?: AuthUser;
}

export interface AuthUser {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
}

export async function loginRequest(email: string, password: string): Promise<AuthTokens> {
  const response = await apiClient.post<AuthTokens>('/auth/login/', { email, password });
  return response.data;
}

export async function refreshTokenRequest(refresh: string): Promise<{ access: string; refresh?: string }> {
  const response = await apiClient.post('/auth/refresh/', { refresh });
  return response.data;
}

export async function logoutRequest(refresh: string) {
  return apiClient.post('/auth/logout/', { refresh });
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const response = await apiClient.get<AuthUser>('/users/me/');
  return response.data;
}
