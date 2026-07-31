import { isAxiosError } from 'axios';
import apiClient from '../client';
import type { User } from '../../entities/user';

export type GenerateLookResult = {
  url: string;
  imageId: string;
};

/**
 * When the request is made with `responseType: 'blob'`, axios error responses
 * can come back either as a `Blob` (XHR adapter) or as an already-parsed plain
 * object (fetch adapter, or when the server didn't actually send a body as blob).
 * This normalizes both cases into a regular Error with the server's message so
 * callers can inspect `error.message` / a `status` property normally.
 */
async function normalizeBlobError(error: unknown): Promise<never> {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    let message: string | undefined;
    if (data instanceof Blob) {
      try {
        const parsed = JSON.parse(await data.text()) as { message?: string };
        message = parsed.message;
      } catch {
        // ignore parse failure, fall back to axios message below
      }
    } else if (data && typeof data === 'object' && 'message' in data) {
      message = (data as { message?: string }).message;
    }

    const normalized = new Error(message ?? error.message) as Error & { status?: number };
    normalized.status = status;
    throw normalized;
  }
  throw error;
}

export const fittingRoomApi = {
  findMatches: async (userId: User['id'], file: File): Promise<string[]> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<{ matchedItemIds: string[] }>(
      `/fitting-room/${userId}/find-matches`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data.matchedItemIds;
  },

  generateLook: async (
    userId: User['id'],
    clothingItemIds: string[],
    recreate?: boolean,
  ): Promise<GenerateLookResult> => {
    try {
      const response = await apiClient.post<Blob>(
        `/fitting-room/${userId}/outfit`,
        { clothingItemIds, recreate },
        { responseType: 'blob' },
      );
      return {
        url: URL.createObjectURL(response.data),
        imageId: response.headers['x-image-id'] as string,
      };
    } catch (error) {
      return normalizeBlobError(error);
    }
  },

  tryOnProduct: async (userId: User['id'], file: File, itemDescription?: string): Promise<GenerateLookResult> => {
    const formData = new FormData();
    formData.append('file', file);
    if (itemDescription) formData.append('itemDescription', itemDescription);
    const response = await apiClient.post<Blob>(
      `/fitting-room/${userId}/try-on-product`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' }, responseType: 'blob' },
    );
    return {
      url: URL.createObjectURL(response.data),
      imageId: response.headers['x-image-id'] as string,
    };
  },
};
