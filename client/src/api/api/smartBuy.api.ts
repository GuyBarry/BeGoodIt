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
  matches: SmartBuyMatch[];
  compatibilityPct: number;
  outfitCount: number;
}

export const smartBuyApi = {
  analyze: async (file: File, userId: string): Promise<SmartBuyAnalysisResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('userId', userId);
    const response = await apiClient.post<SmartBuyAnalysisResponse>('/smart-buy/analyze', formData);
    return response.data;
  },
};
