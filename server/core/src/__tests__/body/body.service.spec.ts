import { bodyService } from '../../services/body.service';
import { bodyMappingRepository } from '../../repositories/bodyMapping.repository';
import { imagesService } from '../../services/images.service';
import { BadRequestException } from '../../exceptions/httpExceptions';
import { BodyMapping } from '../../db/entities/BodyMapping.entity';

jest.mock('../../repositories/bodyMapping.repository', () => ({
  bodyMappingRepository: {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  },
}));

jest.mock('../../services/images.service', () => ({
  imagesService: {
    saveImage: jest.fn(),
  },
}));

describe('bodyService', () => {
  const createMockFile = (overrides?: Partial<Express.Multer.File>): Express.Multer.File => ({
    fieldname: 'file',
    originalname: 'body.png',
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

  const mockImageDto = {
    id: 'image-uuid-1',
    mimeType: 'image/png',
    originalName: 'body.png',
    size: 1024,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  };

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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveBodyImage', () => {
    it('should create a new body mapping when none exists for the user', async () => {
      const file = createMockFile();
      const mockMapping = createMockBodyMapping();

      (imagesService.saveImage as jest.Mock).mockResolvedValue(mockImageDto);
      (bodyMappingRepository.findOne as jest.Mock).mockResolvedValue(null);
      (bodyMappingRepository.create as jest.Mock).mockReturnValue(mockMapping);
      (bodyMappingRepository.save as jest.Mock).mockResolvedValue(mockMapping);

      const result = await bodyService.saveBodyImage(file, 'user-uuid-1');

      expect(imagesService.saveImage).toHaveBeenCalledWith(file);
      expect(bodyMappingRepository.findOne).toHaveBeenCalledWith({ where: { userId: 'user-uuid-1' } });
      expect(bodyMappingRepository.create).toHaveBeenCalledWith({
        userId: 'user-uuid-1',
        imageId: mockImageDto.id,
        picture: null,
        heightCm: null,
        weightKg: null,
        bodyType: null,
      });
      expect(bodyMappingRepository.save).toHaveBeenCalledWith(mockMapping);
      expect(result).toEqual({
        id: mockMapping.id,
        userId: mockMapping.userId,
        imageId: mockMapping.imageId,
        picture: null,
        heightCm: null,
        weightKg: null,
        bodyType: null,
        createdAt: mockMapping.createdAt,
      });
    });

    it('should update the imageId when a body mapping already exists for the user', async () => {
      const file = createMockFile();
      const existingMapping = createMockBodyMapping({ imageId: 'old-image-uuid' });
      const newImageDto = { ...mockImageDto, id: 'image-uuid-2' };
      const updatedMapping = { ...existingMapping, imageId: 'image-uuid-2' } as BodyMapping;

      (imagesService.saveImage as jest.Mock).mockResolvedValue(newImageDto);
      (bodyMappingRepository.findOne as jest.Mock).mockResolvedValue(existingMapping);
      (bodyMappingRepository.save as jest.Mock).mockResolvedValue(updatedMapping);

      const result = await bodyService.saveBodyImage(file, 'user-uuid-1');

      expect(bodyMappingRepository.create).not.toHaveBeenCalled();
      expect(bodyMappingRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ imageId: 'image-uuid-2' }),
      );
      expect(result.imageId).toBe('image-uuid-2');
    });

    it('should throw BadRequestException when userId is empty string', async () => {
      await expect(bodyService.saveBodyImage(createMockFile(), '')).rejects.toThrow(
        BadRequestException,
      );
      await expect(bodyService.saveBodyImage(createMockFile(), '')).rejects.toThrow(
        'userId is required',
      );
      expect(imagesService.saveImage).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when userId is blank whitespace', async () => {
      await expect(bodyService.saveBodyImage(createMockFile(), '   ')).rejects.toThrow(
        BadRequestException,
      );
      expect(imagesService.saveImage).not.toHaveBeenCalled();
    });

    it('should propagate errors from imagesService.saveImage', async () => {
      (imagesService.saveImage as jest.Mock).mockRejectedValue(new Error('storage failure'));

      await expect(bodyService.saveBodyImage(createMockFile(), 'user-uuid-1')).rejects.toThrow(
        'storage failure',
      );
      expect(bodyMappingRepository.findOne).not.toHaveBeenCalled();
    });

    it('should propagate errors from bodyMappingRepository.save', async () => {
      const mockMapping = createMockBodyMapping();

      (imagesService.saveImage as jest.Mock).mockResolvedValue(mockImageDto);
      (bodyMappingRepository.findOne as jest.Mock).mockResolvedValue(null);
      (bodyMappingRepository.create as jest.Mock).mockReturnValue(mockMapping);
      (bodyMappingRepository.save as jest.Mock).mockRejectedValue(new Error('DB write error'));

      await expect(bodyService.saveBodyImage(createMockFile(), 'user-uuid-1')).rejects.toThrow(
        'DB write error',
      );
    });
  });
});
