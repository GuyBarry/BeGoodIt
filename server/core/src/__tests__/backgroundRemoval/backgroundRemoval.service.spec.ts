import { backgroundRemovalService } from '../../services/backgroundRemoval.service';

jest.mock('@imgly/background-removal-node', () => ({
  removeBackground: jest.fn(),
}));

jest.mock('sharp', () => {
  const mockToBuffer = jest.fn();
  const mockPng = jest.fn(() => ({ toBuffer: mockToBuffer }));
  const mockSharp = jest.fn(() => ({ png: mockPng }));
  (mockSharp as any).__mockToBuffer = mockToBuffer;
  return mockSharp;
});

import { removeBackground as rembg } from '@imgly/background-removal-node';
import sharp from 'sharp';

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

describe('backgroundRemovalService', () => {
  const mockSharpInstance = (sharp as unknown as jest.Mock);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('removeBackground', () => {
    it('should return a modified file with background removed', async () => {
      const file = createMockFile();
      const normalizedBuffer = Buffer.from('normalized-png-data');
      const outputBuffer = Buffer.from('bg-removed-png-data');
      const mockBlob = { arrayBuffer: jest.fn().mockResolvedValue(outputBuffer.buffer) } as unknown as Blob;

      const mockToBuffer = jest.fn().mockResolvedValue(normalizedBuffer);
      const mockPng = jest.fn(() => ({ toBuffer: mockToBuffer }));
      mockSharpInstance.mockReturnValue({ png: mockPng });
      (rembg as jest.Mock).mockResolvedValue(mockBlob);

      const result = await backgroundRemovalService.removeBackground(file);

      expect(mockSharpInstance).toHaveBeenCalledWith(file.buffer);
      expect(mockPng).toHaveBeenCalled();
      expect(mockToBuffer).toHaveBeenCalled();
      expect(rembg).toHaveBeenCalledWith(expect.any(Blob));
      expect(result.mimetype).toBe('image/png');
      expect(result.originalname).toBe('body_no_bg.png');
      expect(result.buffer).toEqual(Buffer.from(outputBuffer.buffer));
      expect(result.size).toBe(Buffer.from(outputBuffer.buffer).length);
    });

    it('should preserve other file properties from the original', async () => {
      const file = createMockFile({ fieldname: 'file', encoding: '7bit' });
      const normalizedBuffer = Buffer.from('normalized');
      const outputBuffer = Buffer.from('output');
      const mockBlob = { arrayBuffer: jest.fn().mockResolvedValue(outputBuffer.buffer) } as unknown as Blob;

      const mockToBuffer = jest.fn().mockResolvedValue(normalizedBuffer);
      mockSharpInstance.mockReturnValue({ png: jest.fn(() => ({ toBuffer: mockToBuffer })) });
      (rembg as jest.Mock).mockResolvedValue(mockBlob);

      const result = await backgroundRemovalService.removeBackground(file);

      expect(result.fieldname).toBe(file.fieldname);
      expect(result.encoding).toBe(file.encoding);
    });

    it('should rename originalname with _no_bg suffix replacing the extension', async () => {
      const file = createMockFile({ originalname: 'photo.jpg' });
      const normalizedBuffer = Buffer.from('n');
      const outputBuffer = Buffer.from('o');
      const mockBlob = { arrayBuffer: jest.fn().mockResolvedValue(outputBuffer.buffer) } as unknown as Blob;

      mockSharpInstance.mockReturnValue({ png: jest.fn(() => ({ toBuffer: jest.fn().mockResolvedValue(normalizedBuffer) })) });
      (rembg as jest.Mock).mockResolvedValue(mockBlob);

      const result = await backgroundRemovalService.removeBackground(file);

      expect(result.originalname).toBe('photo_no_bg.png');
    });

    it('should throw an error when sharp fails', async () => {
      const file = createMockFile();
      mockSharpInstance.mockReturnValue({
        png: jest.fn(() => ({ toBuffer: jest.fn().mockRejectedValue(new Error('sharp failure')) })),
      });

      await expect(backgroundRemovalService.removeBackground(file)).rejects.toThrow(
        'Failed to remove background from the image.',
      );
      expect(rembg).not.toHaveBeenCalled();
    });

    it('should throw an error when rembg fails', async () => {
      const file = createMockFile();
      const normalizedBuffer = Buffer.from('normalized');

      mockSharpInstance.mockReturnValue({
        png: jest.fn(() => ({ toBuffer: jest.fn().mockResolvedValue(normalizedBuffer) })),
      });
      (rembg as jest.Mock).mockRejectedValue(new Error('model inference failed'));

      await expect(backgroundRemovalService.removeBackground(file)).rejects.toThrow(
        'Failed to remove background from the image.',
      );
    });
  });
});
