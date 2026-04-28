import { closetService } from '../../services/closet.service';
import { clothingItemService } from '../../services/clothingItem.service';
import { imagesService } from '../../services/images.service';
import { ClothingItemDto } from '../../dtos';

jest.mock('../../services/clothingItem.service', () => ({
  clothingItemService: {
    getAllByUserId: jest.fn(),
    addItem: jest.fn(),
  },
}));

jest.mock('../../services/images.service', () => ({
  imagesService: {
    saveImage: jest.fn(),
  },
}));

jest.mock('../../services/backgroundRemoval.service', () => ({
  backgroundRemovalService: {
    removeBackground: jest.fn((file: Express.Multer.File) => Promise.resolve(file)),
  },
}));

describe('closetService', () => {
  const mockDto: ClothingItemDto = {
    id: 'item-uuid-1',
    userId: 'user-uuid-1',
    imageUrl: '/images/image-uuid-1',
    style: null,
    colorGroup: null,
    category: null,
    season: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  const mockImageDto = {
    id: 'image-uuid-1',
    mimeType: 'image/png',
    originalName: 'shirt.png',
    size: 1024,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  const createMockFile = (overrides?: Partial<Express.Multer.File>): Express.Multer.File => ({
    fieldname: 'file',
    originalname: 'shirt.png',
    encoding: '7bit',
    mimetype: 'image/png',
    size: 1024,
    buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getItemsByUserId', () => {
    it('should delegate to clothingItemService.getAllByUserId and return the result', async () => {
      (clothingItemService.getAllByUserId as jest.Mock).mockResolvedValue([mockDto]);

      const result = await closetService.getItemsByUserId('user-uuid-1');

      expect(clothingItemService.getAllByUserId).toHaveBeenCalledWith('user-uuid-1');
      expect(result).toEqual([mockDto]);
    });

    it('should return an empty array when clothingItemService returns none', async () => {
      (clothingItemService.getAllByUserId as jest.Mock).mockResolvedValue([]);

      const result = await closetService.getItemsByUserId('user-uuid-1');

      expect(result).toEqual([]);
    });

    it('should propagate errors from clothingItemService', async () => {
      (clothingItemService.getAllByUserId as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(closetService.getItemsByUserId('user-uuid-1')).rejects.toThrow('DB error');
    });
  });

  describe('addToCloset', () => {
    it('should remove background, save image, call clothingItemService.addItem, and return DTO', async () => {
      const file = createMockFile();
      (imagesService.saveImage as jest.Mock).mockResolvedValue(mockImageDto);
      (clothingItemService.addItem as jest.Mock).mockResolvedValue(mockDto);

      const result = await closetService.addToCloset('user-uuid-1', file);

      expect(imagesService.saveImage).toHaveBeenCalledWith(file);
      expect(clothingItemService.addItem).toHaveBeenCalledWith('user-uuid-1', '/images/image-uuid-1');
      expect(result).toEqual(mockDto);
    });

    it('should propagate errors from backgroundRemovalService', async () => {
      const { backgroundRemovalService } = jest.requireMock('../../services/backgroundRemoval.service');
      backgroundRemovalService.removeBackground.mockRejectedValueOnce(new Error('Background removal failed'));

      await expect(closetService.addToCloset('user-uuid-1', createMockFile())).rejects.toThrow(
        'Background removal failed',
      );
      expect(imagesService.saveImage).not.toHaveBeenCalled();
      expect(clothingItemService.addItem).not.toHaveBeenCalled();
    });

    it('should propagate errors from imagesService', async () => {
      (imagesService.saveImage as jest.Mock).mockRejectedValue(new Error('Image save failed'));

      await expect(closetService.addToCloset('user-uuid-1', createMockFile())).rejects.toThrow('Image save failed');
      expect(clothingItemService.addItem).not.toHaveBeenCalled();
    });

    it('should propagate errors from clothingItemService.addItem', async () => {
      (imagesService.saveImage as jest.Mock).mockResolvedValue(mockImageDto);
      (clothingItemService.addItem as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(closetService.addToCloset('user-uuid-1', createMockFile())).rejects.toThrow('DB error');
    });
  });
});

