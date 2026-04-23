import { imagesService } from '../../services/images.service';
import { imageRepository } from '../../repositories/image.repository';
import { NotFoundException } from '../../exceptions/httpExceptions';
import { Image } from '../../db/entities/Image.entity';

jest.mock('../../repositories/image.repository', () => ({
  imageRepository: {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  },
}));

describe('imagesService', () => {
  const createMockFile = (overrides?: Partial<Express.Multer.File>): Express.Multer.File => ({
    fieldname: 'file',
    originalname: 'test-image.png',
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

  const createMockImage = (overrides?: Partial<Image>): Image => ({
    id: 'uuid-1234',
    data: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
    mimeType: 'image/png',
    originalName: 'test-image.png',
    size: 1024,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  } as Image);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveImage', () => {
    it('should create and save an image entity and return a DTO', async () => {
      const file = createMockFile();
      const mockImage = createMockImage();

      (imageRepository.create as jest.Mock).mockReturnValue(mockImage);
      (imageRepository.save as jest.Mock).mockResolvedValue(mockImage);

      const result = await imagesService.saveImage(file);

      expect(imageRepository.create).toHaveBeenCalledWith({
        data: file.buffer,
        mimeType: file.mimetype,
        originalName: file.originalname,
        size: file.size,
      });
      expect(imageRepository.save).toHaveBeenCalledWith(mockImage);
      expect(result).toEqual({
        id: mockImage.id,
        mimeType: mockImage.mimeType,
        originalName: mockImage.originalName,
        size: mockImage.size,
        createdAt: mockImage.createdAt,
      });
      // DTO must NOT include binary data
      expect((result as any).data).toBeUndefined();
    });

    it('should propagate repository errors', async () => {
      (imageRepository.create as jest.Mock).mockReturnValue({});
      (imageRepository.save as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(imagesService.saveImage(createMockFile())).rejects.toThrow('DB error');
    });
  });

  describe('getImageById', () => {
    it('should return the full image entity when found', async () => {
      const mockImage = createMockImage();
      (imageRepository.findOne as jest.Mock).mockResolvedValue(mockImage);

      const result = await imagesService.getImageById('uuid-1234');

      expect(imageRepository.findOne).toHaveBeenCalledWith({ where: { id: 'uuid-1234' } });
      expect(result).toBe(mockImage);
      expect(result.data).toBeDefined();
    });

    it('should throw NotFoundException when image does not exist', async () => {
      (imageRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(imagesService.getImageById('missing-id')).rejects.toThrow(NotFoundException);
      await expect(imagesService.getImageById('missing-id')).rejects.toThrow("Image with id 'missing-id' not found");
    });
  });
});
