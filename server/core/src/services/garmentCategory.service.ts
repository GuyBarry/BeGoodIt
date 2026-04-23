import { GarmentCategory } from '../db/entities';
import { garmentCategoryRepository } from '../repositories';

const getAll = async (): Promise<GarmentCategory[]> => {
  return garmentCategoryRepository.find();
};

export const garmentCategoryService = {
  getAll,
};
