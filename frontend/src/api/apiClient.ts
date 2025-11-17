import axios, { type AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/';
const REFRESH_TOKEN_KEY = 'refresh_token';

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string | null) {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function clearTokens() {
  accessToken = null;
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

async function requestTokenRefresh(): Promise<string | null> {
  const existingRefresh = getRefreshToken();
  if (!existingRefresh) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_BASE_URL}auth/refresh/`, { refresh: existingRefresh })
      .then((response) => {
        const { access, refresh } = response.data;
        setAccessToken(access ?? null);
        if (refresh) {
          setRefreshToken(refresh);
        }
        return access ?? null;
      })
      .catch(() => {
        clearTokens();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      const newAccess = await requestTokenRefresh();
      if (newAccess) {
        setAccessToken(newAccess);
        originalRequest.headers = {
          ...(originalRequest.headers ?? {}),
          Authorization: `Bearer ${newAccess}`,
        };
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
