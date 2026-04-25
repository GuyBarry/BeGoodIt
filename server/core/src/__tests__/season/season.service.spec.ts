import { seasonService } from '../../services/season.service';
import { seasonRepository } from '../../repositories/season.repository';

jest.mock('../../repositories/season.repository', () => ({
  seasonRepository: {
    find: jest.fn(),
  },
}));

describe('seasonService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all seasons from the repository', async () => {
      const mockData = [{ id: 1, name: 'Summer' }, { id: 2, name: 'Winter' }];
      (seasonRepository.find as jest.Mock).mockResolvedValue(mockData);

      const result = await seasonService.getAll();

      expect(seasonRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockData);
    });

    it('should return empty array when no seasons exist', async () => {
      (seasonRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await seasonService.getAll();

      expect(result).toEqual([]);
    });

    it('should propagate repository errors', async () => {
      (seasonRepository.find as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(seasonService.getAll()).rejects.toThrow('DB error');
    });
  });
});
