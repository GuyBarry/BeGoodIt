import { FirebaseStorageClient } from '../../firebase/firebase.storage';
import { imagesService } from '../../images/images.service';

jest.mock('../../firebase/firebase.storage');

describe('imagesService', () => {
  let mockUploadFile: jest.Mock;

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
    jest.clearAllMocks();
    mockUploadFile = FirebaseStorageClient.prototype.uploadFile as jest.Mock;
  });

  describe('processImage', () => {
    it('should return the buffer unchanged', async () => {
      const input = Buffer.from([1, 2, 3]);
      const result = await imagesService.processImage(input, 'image/png');
      expect(result).toBe(input);
    });

    it('should handle empty buffers', async () => {
      const input = Buffer.alloc(0);
      const result = await imagesService.processImage(input, 'image/jpeg');
      expect(result).toBe(input);
    });
  });

  describe('uploadImage', () => {
    it('should process and upload the file and return url and fileName', async () => {
      const mockUrl = 'https://storage.googleapis.com/bucket/images/uuid.png';
      mockUploadFile.mockResolvedValue(mockUrl);

      const file = createMockFile();
      const result = await imagesService.uploadImage(file);

      expect(mockUploadFile).toHaveBeenCalledWith(
        file.buffer,
        expect.stringMatching(/^images\/.*\.png$/),
        'image/png'
      );
      expect(result.url).toBe(mockUrl);
      expect(result.fileName).toMatch(/^images\/.*\.png$/);
    });

    it('should extract extension from original filename', async () => {
      mockUploadFile.mockResolvedValue('https://example.com/img.jpg');

      const file = createMockFile({ originalname: 'photo.jpg', mimetype: 'image/jpeg' });
      const result = await imagesService.uploadImage(file);

      expect(result.fileName).toMatch(/\.jpg$/);
    });

    it('should fall back to mime-based extension when originalname has none', async () => {
      mockUploadFile.mockResolvedValue('https://example.com/img.webp');

      const file = createMockFile({ originalname: 'noext', mimetype: 'image/webp' });
      const result = await imagesService.uploadImage(file);

      expect(result.fileName).toMatch(/\.webp$/);
    });

    it('should propagate storage client errors', async () => {
      mockUploadFile.mockRejectedValue(new Error('Upload failed'));

      const file = createMockFile();
      await expect(imagesService.uploadImage(file)).rejects.toThrow('Upload failed');
    });
  });
});
