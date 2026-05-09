import apiClient from '../client';
import type { ClothingItem } from '../../entities/clothingItem';
import type { User } from '../../entities/user';

export interface ClosetFilters {
  search?: string;
  category?: string;
  color?: string;
  season?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedClothingItems {
  items: ClothingItem[];
  total: number;
}

export interface UploadClothingItemPayload {
  file: File;
  userId: User['id'];
  colorGroupId?: number | null;
  categoryId?: number | null;
  seasonId?: number | null;
  style?: string | null;
}

export const clothingItemsApi = {
  getByUserId: async (userId: User['id'], filters: ClosetFilters = {}): Promise<PaginatedClothingItems> => {
    const params = new URLSearchParams();
    if (filters.search)   params.set('search',   filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.color)    params.set('color',    filters.color);
    if (filters.season)   params.set('season',   filters.season);
    params.set('page',  String(filters.page  ?? 1));
    params.set('limit', String(filters.limit ?? 20));
    const { data } = await apiClient.get<PaginatedClothingItems>(`/closet/${userId}?${params}`);
    return data;
  },

  upload: async (payload: UploadClothingItemPayload): Promise<ClothingItem> => {
    const formData = new FormData();
    formData.append('file', payload.file);
    if (payload.colorGroupId != null) formData.append('colorGroupId', String(payload.colorGroupId));
    if (payload.categoryId != null) formData.append('categoryId', String(payload.categoryId));
    if (payload.seasonId != null) formData.append('seasonId', String(payload.seasonId));
    if (payload.style) formData.append('style', payload.style);
    const { data } = await apiClient.post<ClothingItem>(`/closet/${payload.userId}/items`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  deleteById: async (userId: User['id'], id: ClothingItem['id']): Promise<void> => {
    await apiClient.delete(`/closet/${userId}/items/${id}`);
  },
};
