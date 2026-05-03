import { fittingRoomService } from '../../services/fittingRoom.service';
import { bodyMappingRepository } from '../../repositories/bodyMapping.repository';
import { imagesService } from '../../services/images.service';
import { clothingItemService } from '../../services/clothingItem.service';
import { generateOutfit } from '../../ai/prompt.manager';
import { NotFoundException } from '../../exceptions/httpExceptions';
import { BodyMapping } from '../../db/entities/BodyMapping.entity';
import { ClothingItem } from '../../db/entities/ClothingItem.entity';
import { Image } from '../../db/entities/Image.entity';

jest.mock('../../repositories/bodyMapping.repository', () => ({
  bodyMappingRepository: {
    findOne: jest.fn(),
  },
}));

jest.mock('../../services/images.service', () => ({
  imagesService: {
    getImageById: jest.fn(),
  },
}));

jest.mock('../../services/clothingItem.service', () => ({
  clothingItemService: {
    getMultipleByIds: jest.fn(),
  },
}));

jest.mock('../../ai/prompt.manager', () => ({
  generateOutfit: jest.fn(),
}));

describe('fittingRoomService', () => {
  const createMockImage = (overrides?: Partial<Image>): Image => ({
    id: 'image-uuid-1',
    data: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
    mimeType: 'image/png',
    originalName: 'body.png',
    size: 1024,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  });

  const createMockBodyMapping = (overrides?: Partial<BodyMapping>): BodyMapping => ({
    id: 'body-uuid-1',
    userId: 'user-uuid-1',
    imageId: 'image-uuid-1',
    picture: null,
    heightCm: null,
    weightKg: null,
    bodyType: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    user: null as any,
    image: null as any,
    ...overrides,
  });

  const createMockClothingItem = (overrides?: Partial<ClothingItem>): ClothingItem => ({
    id: 'item-uuid-1',
    userId: 'user-uuid-1',
    imageId: 'clothing-image-uuid-1',
    style: 'casual',
    colorGroupId: null,
    categoryId: null,
    seasonId: null,
    imageEmbedding: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    user: null as any,
    colorGroup: null,
    category: null,
    season: null,
    outfits: [],
    ...overrides,
  });

  const mockOutfitImageBuffer = Buffer.from('fake-outfit-png-data');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createFit', () => {
    it('should return an image buffer on success', async () => {
      const bodyMapping = createMockBodyMapping();
      const bodyImageEntity = createMockImage({ id: 'image-uuid-1' });
      const clothingItem = createMockClothingItem();
      const clothingImageEntity = createMockImage({
        id: 'clothing-image-uuid-1',
        originalName: 'shirt.png',
      });

      (bodyMappingRepository.findOne as jest.Mock).mockResolvedValue(bodyMapping);
      (imagesService.getImageById as jest.Mock).mockImplementation((id: string) => {
        if (id === 'image-uuid-1') return Promise.resolve(bodyImageEntity);
        if (id === 'clothing-image-uuid-1') return Promise.resolve(clothingImageEntity);
      });
      (clothingItemService.getMultipleByIds as jest.Mock).mockResolvedValue([clothingItem]);
      (generateOutfit as jest.Mock).mockResolvedValue(mockOutfitImageBuffer);

      const result = await fittingRoomService.createFit('user-uuid-1', ['item-uuid-1']);

      expect(result).toBe(mockOutfitImageBuffer);
      expect(bodyMappingRepository.findOne).toHaveBeenCalledWith({ where: { userId: 'user-uuid-1' } });
      expect(imagesService.getImageById).toHaveBeenCalledWith('image-uuid-1');
      expect(clothingItemService.getMultipleByIds).toHaveBeenCalledWith(['item-uuid-1']);
      expect(imagesService.getImageById).toHaveBeenCalledWith('clothing-image-uuid-1');
      expect(generateOutfit).toHaveBeenCalledWith(
        expect.objectContaining({
          bodyImage: expect.objectContaining({ buffer: bodyImageEntity.data, mimetype: bodyImageEntity.mimeType }),
          clothingItemsImages: expect.arrayContaining([
            expect.objectContaining({ buffer: clothingImageEntity.data }),
          ]),
          clothingItems: [clothingItem],
        }),
      );
    });

    it('should throw NotFoundException when no body mapping exists for the user', async () => {
      (bodyMappingRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(fittingRoomService.createFit('user-uuid-1', ['item-uuid-1'])).rejects.toThrow(
        NotFoundException,
      );
      await expect(fittingRoomService.createFit('user-uuid-1', ['item-uuid-1'])).rejects.toThrow(
        "No body image found for user 'user-uuid-1'",
      );
      expect(imagesService.getImageById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when no clothing items match the provided IDs', async () => {
      const bodyMapping = createMockBodyMapping();
      const bodyImageEntity = createMockImage();

      (bodyMappingRepository.findOne as jest.Mock).mockResolvedValue(bodyMapping);
      (imagesService.getImageById as jest.Mock).mockResolvedValue(bodyImageEntity);
      (clothingItemService.getMultipleByIds as jest.Mock).mockResolvedValue([]);

      await expect(fittingRoomService.createFit('user-uuid-1', ['nonexistent-id'])).rejects.toThrow(
        NotFoundException,
      );
      await expect(fittingRoomService.createFit('user-uuid-1', ['nonexistent-id'])).rejects.toThrow(
        'No clothing items found for the provided IDs',
      );
      expect(generateOutfit).not.toHaveBeenCalled();
    });

    it('should propagate errors from generateOutfit', async () => {
      const bodyMapping = createMockBodyMapping();
      const bodyImageEntity = createMockImage();
      const clothingItem = createMockClothingItem();
      const clothingImageEntity = createMockImage({ id: 'clothing-image-uuid-1', originalName: 'shirt.png' });

      (bodyMappingRepository.findOne as jest.Mock).mockResolvedValue(bodyMapping);
      (imagesService.getImageById as jest.Mock).mockImplementation((id: string) => {
        if (id === 'image-uuid-1') return Promise.resolve(bodyImageEntity);
        return Promise.resolve(clothingImageEntity);
      });
      (clothingItemService.getMultipleByIds as jest.Mock).mockResolvedValue([clothingItem]);
      (generateOutfit as jest.Mock).mockRejectedValue(new Error('AI service unavailable'));

      await expect(fittingRoomService.createFit('user-uuid-1', ['item-uuid-1'])).rejects.toThrow(
        'AI service unavailable',
      );
    });

    it('should propagate errors from imagesService.getImageById for body image', async () => {
      const bodyMapping = createMockBodyMapping();

      (bodyMappingRepository.findOne as jest.Mock).mockResolvedValue(bodyMapping);
      (imagesService.getImageById as jest.Mock).mockRejectedValue(new NotFoundException("Image not found"));

      await expect(fittingRoomService.createFit('user-uuid-1', ['item-uuid-1'])).rejects.toThrow(
        NotFoundException,
      );
      expect(clothingItemService.getMultipleByIds).not.toHaveBeenCalled();
    });

    it('should handle multiple clothing items correctly', async () => {
      const bodyMapping = createMockBodyMapping();
      const bodyImageEntity = createMockImage();
      const item1 = createMockClothingItem({ id: 'item-uuid-1', imageId: 'clothing-image-uuid-1' });
      const item2 = createMockClothingItem({ id: 'item-uuid-2', imageId: 'clothing-image-uuid-2' });
      const clothingImageEntity1 = createMockImage({ id: 'clothing-image-uuid-1' });
      const clothingImageEntity2 = createMockImage({ id: 'clothing-image-uuid-2' });

      (bodyMappingRepository.findOne as jest.Mock).mockResolvedValue(bodyMapping);
      (imagesService.getImageById as jest.Mock).mockImplementation((id: string) => {
        if (id === 'image-uuid-1') return Promise.resolve(bodyImageEntity);
        if (id === 'clothing-image-uuid-1') return Promise.resolve(clothingImageEntity1);
        if (id === 'clothing-image-uuid-2') return Promise.resolve(clothingImageEntity2);
      });
      (clothingItemService.getMultipleByIds as jest.Mock).mockResolvedValue([item1, item2]);
      (generateOutfit as jest.Mock).mockResolvedValue(mockOutfitImageBuffer);

      const result = await fittingRoomService.createFit('user-uuid-1', ['item-uuid-1', 'item-uuid-2']);

      expect(result).toBe(mockOutfitImageBuffer);
      expect(generateOutfit).toHaveBeenCalledWith(
        expect.objectContaining({
          clothingItemsImages: expect.arrayContaining([
            expect.objectContaining({ buffer: clothingImageEntity1.data }),
            expect.objectContaining({ buffer: clothingImageEntity2.data }),
          ]),
          clothingItems: [item1, item2],
        }),
      );
    });
  });
});
