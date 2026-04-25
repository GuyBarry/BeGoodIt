import { garmentCategoryService } from '../../services/garmentCategory.service';
import { garmentCategoryRepository } from '../../repositories/garmentCategory.repository';

jest.mock('../../repositories/garmentCategory.repository', () => ({
  garmentCategoryRepository: {
    find: jest.fn(),
  },
}));

describe('garmentCategoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all garment categories from the repository', async () => {
      const mockData = [{ id: 1, name: 'Tops' }, { id: 2, name: 'Bottoms' }];
      (garmentCategoryRepository.find as jest.Mock).mockResolvedValue(mockData);

      const result = await garmentCategoryService.getAll();

      expect(garmentCategoryRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockData);
    });

    it('should return empty array when no garment categories exist', async () => {
      (garmentCategoryRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await garmentCategoryService.getAll();

      expect(result).toEqual([]);
    });

    it('should propagate repository errors', async () => {
      (garmentCategoryRepository.find as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(garmentCategoryService.getAll()).rejects.toThrow('DB error');
    });
  });
});
