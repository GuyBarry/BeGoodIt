import apiClient from '../client';
import type { ClothingItem } from '../../entities/clothingItem';
import type { User } from '../../entities/user';

export interface ClosetFilters {
  search?: string;
  category?: string;
  color?: string;
  season?: string;
  style?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedClothingItems {
  items: ClothingItem[];
  total: number;
}

export interface ClothingClassification {
  category: string;
  colorGroup: string;
  season: string;
  style: string;
}

export interface UploadClothingItemPayload {
  file: File;
  userId: User['id'];
  colorGroupIds?: number[];
  categoryId?: number | null;
  seasonIds?: number[];
  styles?: string[];
}

export const clothingItemsApi = {
  getByUserId: async (userId: User['id'], filters: ClosetFilters = {}): Promise<PaginatedClothingItems> => {
    const params = new URLSearchParams();
    if (filters.search)   params.set('search',   filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.color)    params.set('color',    filters.color);
    if (filters.season)   params.set('season',   filters.season);
    if (filters.style)    params.set('style',    filters.style);
    params.set('page',  String(filters.page  ?? 1));
    params.set('limit', String(filters.limit ?? 20));
    const { data } = await apiClient.get<PaginatedClothingItems>(`/closet/${userId}?${params}`);
    return data;
  },

  upload: async (payload: UploadClothingItemPayload): Promise<ClothingItem> => {
    const formData = new FormData();
    formData.append('file', payload.file);
    for (const id of payload.colorGroupIds ?? []) formData.append('colorGroupIds', String(id));
    if (payload.categoryId != null) formData.append('categoryId', String(payload.categoryId));
    for (const id of payload.seasonIds ?? []) formData.append('seasonIds', String(id));
    for (const style of payload.styles ?? []) formData.append('styles', style);
    const { data } = await apiClient.post<ClothingItem>(`/closet/${payload.userId}/items`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  deleteById: async (userId: User['id'], id: ClothingItem['id']): Promise<void> => {
    await apiClient.delete(`/closet/${userId}/items/${id}`);
  },

  classify: async (file: File): Promise<ClothingClassification> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<ClothingClassification>(`/clothing-items/classify`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
