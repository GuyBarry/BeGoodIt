import { colorGroupService } from '../../services/colorGroup.service';
import { colorGroupRepository } from '../../repositories/colorGroup.repository';

jest.mock('../../repositories/colorGroup.repository', () => ({
  colorGroupRepository: {
    find: jest.fn(),
  },
}));

describe('colorGroupService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all color groups from the repository', async () => {
      const mockData = [{ id: 1, name: 'Blue' }, { id: 2, name: 'Green' }];
      (colorGroupRepository.find as jest.Mock).mockResolvedValue(mockData);

      const result = await colorGroupService.getAll();

      expect(colorGroupRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockData);
    });

    it('should return empty array when no color groups exist', async () => {
      (colorGroupRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await colorGroupService.getAll();

      expect(result).toEqual([]);
    });

    it('should propagate repository errors', async () => {
      (colorGroupRepository.find as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(colorGroupService.getAll()).rejects.toThrow('DB error');
    });
  });
});
