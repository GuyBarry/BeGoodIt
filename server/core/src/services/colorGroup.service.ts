import { ColorGroup } from '../entities';
import { colorGroupRepository } from '../repositories';

const getAll = async (): Promise<ColorGroup[]> => {
  return colorGroupRepository.find();
};

export const colorGroupService = {
  getAll,
};
