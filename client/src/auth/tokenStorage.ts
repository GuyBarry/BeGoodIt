// Central place for persisting the JWT access + refresh tokens issued by the
// server. Kept separate from React state so the axios interceptors can read
// them synchronously outside of the component tree.

const ACCESS_TOKEN_KEY = 'begoodit.auth.token';
const REFRESH_TOKEN_KEY = 'begoodit.auth.refreshToken';

export type Tokens = { token: string; refreshToken: string };

export const getAccessToken = (): string | null =>
  localStorage.getItem(ACCESS_TOKEN_KEY);

export const getRefreshToken = (): string | null =>
  localStorage.getItem(REFRESH_TOKEN_KEY);

export const setTokens = ({ token, refreshToken }: Tokens): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Fired when the session can no longer be refreshed (refresh token expired or
// rejected). The AuthProvider listens for this to force a full logout, since
// the axios interceptor lives outside the React tree.
export const SESSION_EXPIRED_EVENT = 'begoodit:session-expired';

export const emitSessionExpired = (): void => {
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
};
