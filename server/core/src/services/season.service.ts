import { Season } from '../db/entities';
import { seasonRepository } from '../repositories';

const getAll = async (): Promise<Season[]> => {
  return seasonRepository.find();
};

export const seasonService = {
  getAll,
};
