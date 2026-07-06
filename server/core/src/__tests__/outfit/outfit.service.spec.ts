import { outfitService } from '../../services/outfit.service';
import { outfitRepository } from '../../repositories';
import { clothingItemService } from '../../services/clothingItem.service';

jest.mock('../../repositories', () => ({
  outfitRepository: {
    createOutfit: jest.fn(),
    findByUserId: jest.fn(),
    findExactMatch: jest.fn(),
    replaceImage: jest.fn(),
    deleteByIdAndUserId: jest.fn(),
  },
}));

jest.mock('../../services/clothingItem.service', () => ({
  clothingItemService: {
    getMultipleByIds: jest.fn(),
  },
}));

describe('outfitService', () => {
  const mockOutfit = {
    id: 'outfit-uuid-1',
    userId: 'user-uuid-1',
    name: null,
    isFavorite: false,
    imageId: 'image-uuid-1',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    items: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveOutfit', () => {
    it('should fetch the clothing items and create the outfit', async () => {
      (clothingItemService.getMultipleByIds as jest.Mock).mockResolvedValue([]);
      (outfitRepository.createOutfit as jest.Mock).mockResolvedValue(mockOutfit);

      const result = await outfitService.saveOutfit('user-uuid-1', 'image-uuid-1', ['item-uuid-1']);

      expect(clothingItemService.getMultipleByIds).toHaveBeenCalledWith(['item-uuid-1']);
      expect(outfitRepository.createOutfit).toHaveBeenCalledWith('user-uuid-1', [], 'image-uuid-1');
      expect(result).toMatchObject({ id: mockOutfit.id, userId: mockOutfit.userId });
    });
  });

  describe('getUserOutfits', () => {
    it('should return outfits for the given user', async () => {
      (outfitRepository.findByUserId as jest.Mock).mockResolvedValue([mockOutfit]);

      const result = await outfitService.getUserOutfits('user-uuid-1');

      expect(outfitRepository.findByUserId).toHaveBeenCalledWith('user-uuid-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('deleteOutfit', () => {
    it('should call outfitRepository.deleteByIdAndUserId with outfitId and userId', async () => {
      (outfitRepository.deleteByIdAndUserId as jest.Mock).mockResolvedValue(true);

      await outfitService.deleteOutfit('user-uuid-1', 'outfit-uuid-1');

      expect(outfitRepository.deleteByIdAndUserId).toHaveBeenCalledWith('outfit-uuid-1', 'user-uuid-1');
    });

    it('should throw NotFoundException when the outfit does not exist or does not belong to the user', async () => {
      (outfitRepository.deleteByIdAndUserId as jest.Mock).mockResolvedValue(false);

      await expect(outfitService.deleteOutfit('user-uuid-1', 'nonexistent-id')).rejects.toThrow('Outfit not found');
    });

    it('should propagate errors from outfitRepository.deleteByIdAndUserId', async () => {
      (outfitRepository.deleteByIdAndUserId as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(outfitService.deleteOutfit('user-uuid-1', 'outfit-uuid-1')).rejects.toThrow('DB error');
    });
  });
});
