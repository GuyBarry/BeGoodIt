import { ImagesService } from '../../images/images.service';
import { FirebaseStorageClient } from '../../firebase/firebase.storage';

jest.mock('../../firebase/firebase.storage');

describe('ImagesService', () => {
  let service: ImagesService;
  let mockStorageClient: jest.Mocked<FirebaseStorageClient>;

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

  beforeEach(() => {
    mockStorageClient = {
      uploadFile: jest.fn(),
      getFileUrl: jest.fn(),
      deleteFile: jest.fn(),
    } as unknown as jest.Mocked<FirebaseStorageClient>;

    service = new ImagesService(mockStorageClient);
  });

  describe('processImage', () => {
    it('should return the buffer unchanged', async () => {
      const input = Buffer.from([1, 2, 3]);
      const result = await service.processImage(input, 'image/png');
      expect(result).toBe(input);
    });

    it('should handle empty buffers', async () => {
      const input = Buffer.alloc(0);
      const result = await service.processImage(input, 'image/jpeg');
      expect(result).toBe(input);
    });
  });

  describe('uploadImage', () => {
    it('should process and upload the file and return url and fileName', async () => {
      const mockUrl = 'https://storage.googleapis.com/bucket/images/uuid.png';
      mockStorageClient.uploadFile.mockResolvedValue(mockUrl);

      const file = createMockFile();
      const result = await service.uploadImage(file);

      expect(mockStorageClient.uploadFile).toHaveBeenCalledWith(
        file.buffer,
        expect.stringMatching(/^images\/.*\.png$/),
        'image/png'
      );
      expect(result.url).toBe(mockUrl);
      expect(result.fileName).toMatch(/^images\/.*\.png$/);
    });

    it('should extract extension from original filename', async () => {
      mockStorageClient.uploadFile.mockResolvedValue('https://example.com/img.jpg');

      const file = createMockFile({ originalname: 'photo.jpg', mimetype: 'image/jpeg' });
      const result = await service.uploadImage(file);

      expect(result.fileName).toMatch(/\.jpg$/);
    });

    it('should fall back to mime-based extension when originalname has none', async () => {
      mockStorageClient.uploadFile.mockResolvedValue('https://example.com/img.webp');

      const file = createMockFile({ originalname: 'noext', mimetype: 'image/webp' });
      const result = await service.uploadImage(file);

      expect(result.fileName).toMatch(/\.webp$/);
    });

    it('should propagate storage client errors', async () => {
      mockStorageClient.uploadFile.mockRejectedValue(new Error('Upload failed'));

      const file = createMockFile();
      await expect(service.uploadImage(file)).rejects.toThrow('Upload failed');
    });
  });
});
