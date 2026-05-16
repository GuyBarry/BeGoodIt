import apiClient from '../client';

export interface SmartBuyMatch {
  itemId: string;
  compatibilityPct: number;
}

export interface SmartBuyAnalysisResponse {
  uploadedClassification: {
    category: string;
    colorGroup: string;
    season: string;
    style: string;
  };
  suggestedName: string;
  matches: SmartBuyMatch[];
  compatibilityPct: number;
  outfitCount: number;
}

export interface SmartBuyTestRecord {
  id: string;
  imageId: string | null;
  name: string;
  compatibilityPct: number;
  matchCount: number;
  outfitCount: number;
  matchedItems: SmartBuyMatch[];
  classification: { category: string; colorGroup: string; season: string; style: string } | null;
  testedAt: string;
}

export const smartBuyApi = {
  analyze: async (file: File, userId: string, productTitle?: string): Promise<SmartBuyAnalysisResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('userId', userId);
    if (productTitle) formData.append('productTitle', productTitle);
    const response = await apiClient.post<SmartBuyAnalysisResponse>('/smart-buy/analyze', formData);
    return response.data;
  },

  saveTest: async (
    userId: string,
    file: File | null,
    data: {
      name: string;
      compatibilityPct: number;
      matchCount: number;
      outfitCount: number;
      matchedItems: SmartBuyMatch[];
      classification: SmartBuyTestRecord['classification'];
    },
  ): Promise<SmartBuyTestRecord> => {
    const formData = new FormData();
    if (file) formData.append('image', file);
    formData.append('name', data.name);
    formData.append('compatibilityPct', String(data.compatibilityPct));
    formData.append('matchCount', String(data.matchCount));
    formData.append('outfitCount', String(data.outfitCount));
    formData.append('matchedItems', JSON.stringify(data.matchedItems));
    if (data.classification) formData.append('classification', JSON.stringify(data.classification));
    const response = await apiClient.post<SmartBuyTestRecord>(`/smart-buy/tests/${userId}`, formData);
    return response.data;
  },

  getTests: async (userId: string): Promise<SmartBuyTestRecord[]> => {
    const response = await apiClient.get<SmartBuyTestRecord[]>(`/smart-buy/tests/${userId}`);
    return response.data;
  },
};
