import { genderService } from '../../services/gender.service';
import { genderRepository } from '../../repositories/gender.repository';

jest.mock('../../repositories/gender.repository', () => ({
  genderRepository: {
    find: jest.fn(),
  },
}));

describe('genderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all genders from the repository', async () => {
      const mockData = [{ id: 1, name: 'Male' }, { id: 2, name: 'Female' }];
      (genderRepository.find as jest.Mock).mockResolvedValue(mockData);

      const result = await genderService.getAll();

      expect(genderRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockData);
    });

    it('should return empty array when no genders exist', async () => {
      (genderRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await genderService.getAll();

      expect(result).toEqual([]);
    });

    it('should propagate repository errors', async () => {
      (genderRepository.find as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(genderService.getAll()).rejects.toThrow('DB error');
    });
  });
});
