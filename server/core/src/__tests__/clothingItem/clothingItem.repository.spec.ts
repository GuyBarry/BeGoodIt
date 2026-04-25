import { clothingItemRepository } from '../../repositories/clothingItem.repository';
import { ClothingItem } from '../../db/entities';

const mockFind = jest.fn();

jest.mock('../../db/datasource', () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      find: mockFind,
      extend: jest.fn((methods) => ({ find: mockFind, ...methods })),
    }),
  },
}));

describe('clothingItemRepository', () => {
  const mockItems: Partial<ClothingItem>[] = [
    {
      id: 'item-uuid-1',
      userId: 'user-uuid-1',
      imageUrl: 'https://example.com/img1.jpg',
      colorGroup: { id: 1, name: 'Blue' } as any,
      category: { id: 2, name: 'Tops' } as any,
      season: { id: 1, name: 'Summer' } as any,
    },
    {
      id: 'item-uuid-2',
      userId: 'user-uuid-1',
      imageUrl: 'https://example.com/img2.jpg',
      colorGroup: null,
      category: null,
      season: null,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllByUserId', () => {
    it('should call find with userId and all lookup relations', async () => {
      mockFind.mockResolvedValue(mockItems);

      const result = await clothingItemRepository.getAllByUserId('user-uuid-1');

      expect(mockFind).toHaveBeenCalledWith({
        where: { userId: 'user-uuid-1' },
        relations: ['colorGroup', 'category', 'season'],
      });
      expect(result).toEqual(mockItems);
    });

    it('should return empty array when user has no clothing items', async () => {
      mockFind.mockResolvedValue([]);

      const result = await clothingItemRepository.getAllByUserId('user-uuid-1');

      expect(result).toEqual([]);
    });

    it('should propagate datasource errors', async () => {
      mockFind.mockRejectedValue(new Error('DB error'));

      await expect(clothingItemRepository.getAllByUserId('user-uuid-1')).rejects.toThrow('DB error');
    });
  });
});
