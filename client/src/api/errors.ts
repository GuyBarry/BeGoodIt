import axios from 'axios';

export const getConflictDetail = <T>(err: unknown, key: string): T | undefined => {
  if (!axios.isAxiosError(err) || err.response?.status !== 409) return undefined;
  const details = err.response.data?.details as Record<string, unknown> | undefined;
  return details?.[key] as T | undefined;
};
