import { Gender } from '../entities';
import { genderRepository } from '../repositories';

const getAll = async (): Promise<Gender[]> => {
  return genderRepository.find();
};

export const genderService = {
  getAll,
};
