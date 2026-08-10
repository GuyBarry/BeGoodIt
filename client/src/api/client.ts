import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import {
  clearTokens,
  emitSessionExpired,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '../auth/tokenStorage';
import { emitImageTooLarge } from '../lib/imageUpload';

const baseURL = `${import.meta.env.VITE_API_URL || window.location.origin}/api`;

const apiClient = axios.create({ baseURL });

// Attach the access token to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A bare axios instance for the refresh call so it doesn't loop through the
// interceptors below.
const refreshClient = axios.create({ baseURL });

type RetriableRequest = InternalAxiosRequestConfig & { _retried?: boolean };

// On a 401, try once to exchange the refresh token for a new pair, then replay
// the original request. If that fails, drop the tokens and surface the error.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 413) {
      emitImageTooLarge();
    }

    const original = error.config as RetriableRequest | undefined;
    const refreshToken = getRefreshToken();

    if (
      error.response?.status === 401 &&
      original &&
      !original._retried &&
      refreshToken
    ) {
      original._retried = true;
      try {
        const { data } = await refreshClient.post<{
          token: string;
          refreshToken: string;
        }>('/auth/refresh', { refreshToken });
        setTokens(data);
        original.headers.Authorization = `Bearer ${data.token}`;
        return apiClient(original);
      } catch (refreshError) {
        clearTokens();
        emitSessionExpired();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
