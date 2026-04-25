import { clothingItemService } from '../../services/clothingItem.service';
import { clothingItemRepository } from '../../repositories/clothingItem.repository';
import { ClothingItem } from '../../db/entities';

jest.mock('../../repositories/clothingItem.repository', () => ({
  clothingItemRepository: {
    getAllByUserId: jest.fn(),
  },
}));

describe('clothingItemService', () => {
  const createMockItem = (overrides?: Partial<ClothingItem>): ClothingItem =>
    ({
      id: 'item-uuid-1',
      userId: 'user-uuid-1',
      imageUrl: 'https://example.com/img1.jpg',
      style: 'casual',
      colorGroup: { id: 1, name: 'Blue' },
      category: { id: 2, name: 'Tops' },
      season: { id: 1, name: 'Summer' },
      colorGroupId: 1,
      categoryId: 2,
      seasonId: 1,
      imageEmbedding: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      outfits: [],
      ...overrides,
    } as unknown as ClothingItem);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllByUserId', () => {
    it('should return mapped ClothingItemDtos for a user', async () => {
      const mockItems = [createMockItem(), createMockItem({ id: 'item-uuid-2', style: null })];
      (clothingItemRepository.getAllByUserId as jest.Mock).mockResolvedValue(mockItems);

      const result = await clothingItemService.getAllByUserId('user-uuid-1');

      expect(clothingItemRepository.getAllByUserId).toHaveBeenCalledWith('user-uuid-1');
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'item-uuid-1',
        userId: 'user-uuid-1',
        imageUrl: 'https://example.com/img1.jpg',
        style: 'casual',
        colorGroup: { id: 1, name: 'Blue' },
        category: { id: 2, name: 'Tops' },
        season: { id: 1, name: 'Summer' },
      });
      expect((result[0] as any).imageEmbedding).toBeUndefined();
    });

    it('should map null relations to null in the DTO', async () => {
      const mockItem = createMockItem({ colorGroup: null, category: null, season: null });
      (clothingItemRepository.getAllByUserId as jest.Mock).mockResolvedValue([mockItem]);

      const result = await clothingItemService.getAllByUserId('user-uuid-1');

      expect(result[0].colorGroup).toBeNull();
      expect(result[0].category).toBeNull();
      expect(result[0].season).toBeNull();
    });

    it('should return empty array when user has no clothing items', async () => {
      (clothingItemRepository.getAllByUserId as jest.Mock).mockResolvedValue([]);

      const result = await clothingItemService.getAllByUserId('user-uuid-1');

      expect(result).toEqual([]);
    });

    it('should propagate repository errors', async () => {
      (clothingItemRepository.getAllByUserId as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(clothingItemService.getAllByUserId('user-uuid-1')).rejects.toThrow('DB error');
    });
  });
});
