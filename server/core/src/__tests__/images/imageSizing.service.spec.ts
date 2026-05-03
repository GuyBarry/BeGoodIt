import { imageSizingService } from '../../services/imageSizing.service';

const mockToBuffer = jest.fn();
const mockResize = jest.fn();

jest.mock('sharp', () => {
  return jest.fn(() => ({
    resize: mockResize.mockReturnValue({ toBuffer: mockToBuffer }),
  }));
});

describe('imageSizingService', () => {
  const TARGET_SIZE = 512;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('resizeToSquare', () => {
    it('should call sharp with the correct resize options', async () => {
      const inputBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      const outputBuffer = Buffer.from('resized');
      mockToBuffer.mockResolvedValue(outputBuffer);

      const sharp = require('sharp');

      await imageSizingService.resizeToSquare(inputBuffer);

      expect(sharp).toHaveBeenCalledWith(inputBuffer);
      expect(mockResize).toHaveBeenCalledWith(TARGET_SIZE, TARGET_SIZE, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    });

    it('should return the buffer produced by sharp', async () => {
      const inputBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      const outputBuffer = Buffer.from('resized-output');
      mockToBuffer.mockResolvedValue(outputBuffer);

      const result = await imageSizingService.resizeToSquare(inputBuffer);

      expect(result).toBe(outputBuffer);
    });

    it('should not enlarge images smaller than 512x512 (withoutEnlargement: true)', async () => {
      const smallBuffer = Buffer.from([0x00, 0x01]);
      const sameBuffer = Buffer.from([0x00, 0x01]);
      mockToBuffer.mockResolvedValue(sameBuffer);

      await imageSizingService.resizeToSquare(smallBuffer);

      expect(mockResize).toHaveBeenCalledWith(
        TARGET_SIZE,
        TARGET_SIZE,
        expect.objectContaining({ withoutEnlargement: true }),
      );
    });

    it('should propagate errors thrown by sharp', async () => {
      const inputBuffer = Buffer.from([0xff, 0xd8]);
      mockToBuffer.mockRejectedValue(new Error('Invalid image data'));

      await expect(imageSizingService.resizeToSquare(inputBuffer)).rejects.toThrow('Invalid image data');
    });
  });
});
