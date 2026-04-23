import { ColorGroup } from '../db/entities';
import { colorGroupRepository } from '../repositories';

const getAll = async (): Promise<ColorGroup[]> => {
  return colorGroupRepository.find();
};

export const colorGroupService = {
  getAll,
};
