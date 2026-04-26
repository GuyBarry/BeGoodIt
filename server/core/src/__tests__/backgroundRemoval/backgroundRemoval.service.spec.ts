import { backgroundRemovalService } from '../../services/backgroundRemoval.service';
import * as childProcess from 'child_process';
import * as fs from 'fs';

jest.mock('child_process');
jest.mock('fs');
jest.mock('sharp', () => {
  const mockToBuffer = jest.fn().mockResolvedValue(Buffer.from('png-data'));
  const mockPng = jest.fn().mockReturnValue({ toBuffer: mockToBuffer });
  const mockSharp = jest.fn().mockReturnValue({ png: mockPng });
  return mockSharp;
});

describe('backgroundRemovalService', () => {
  const createMockFile = (overrides?: Partial<Express.Multer.File>): Express.Multer.File => ({
    fieldname: 'file',
    originalname: 'photo.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 2048,
    buffer: Buffer.from('fake-image-data'),
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  });

  const mockOutputBuffer = Buffer.from('no-bg-image-data');

  beforeEach(() => {
    jest.clearAllMocks();

    (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
    (fs.readFileSync as jest.Mock).mockReturnValue(mockOutputBuffer);
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);

    (childProcess.exec as unknown as jest.Mock).mockImplementation(
      (_cmd: string, callback: (error: Error | null, stdout: string, stderr: string) => void) => {
        callback(null, '', '');
      },
    );
  });

  describe('removeBackground', () => {
    it('should return a file with the background removed', async () => {
      const file = createMockFile();

      const result = await backgroundRemovalService.removeBackground(file);

      expect(result.buffer).toEqual(mockOutputBuffer);
      expect(result.mimetype).toBe('image/png');
      expect(result.originalname).toBe('photo_no_bg.png');
      expect(result.size).toBe(mockOutputBuffer.length);
    });

    it('should preserve other file fields from the input', async () => {
      const file = createMockFile();

      const result = await backgroundRemovalService.removeBackground(file);

      expect(result.fieldname).toBe(file.fieldname);
      expect(result.encoding).toBe(file.encoding);
    });

    it('should write the converted PNG to a temp file before calling rembg', async () => {
      const file = createMockFile();

      await backgroundRemovalService.removeBackground(file);

      expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
      const [writtenPath, writtenData] = (fs.writeFileSync as jest.Mock).mock.calls[0];
      expect(writtenPath).toMatch(/rembg_input_/);
      expect(writtenData).toEqual(Buffer.from('png-data'));
    });

    it('should call rembg with input and output temp file paths', async () => {
      const file = createMockFile();

      await backgroundRemovalService.removeBackground(file);

      expect(childProcess.exec).toHaveBeenCalledTimes(1);
      const [cmd] = (childProcess.exec as unknown as jest.Mock).mock.calls[0];
      expect(cmd).toMatch(/^rembg i "/);
      expect(cmd).toMatch(/rembg_input_/);
      expect(cmd).toMatch(/rembg_output_/);
    });

    it('should read the rembg output file to build the result buffer', async () => {
      const file = createMockFile();

      await backgroundRemovalService.removeBackground(file);

      expect(fs.readFileSync).toHaveBeenCalledTimes(1);
      const [readPath] = (fs.readFileSync as jest.Mock).mock.calls[0];
      expect(readPath).toMatch(/rembg_output_/);
    });

    it('should clean up both temp files after success', async () => {
      const file = createMockFile();

      await backgroundRemovalService.removeBackground(file);

      expect(fs.unlinkSync).toHaveBeenCalledTimes(2);
      const unlinkedPaths = (fs.unlinkSync as jest.Mock).mock.calls.map(([p]: [string]) => p);
      expect(unlinkedPaths.some((p: string) => p.includes('rembg_input_'))).toBe(true);
      expect(unlinkedPaths.some((p: string) => p.includes('rembg_output_'))).toBe(true);
    });

    it('should clean up temp files even when rembg fails', async () => {
      (childProcess.exec as unknown as jest.Mock).mockImplementation(
        (_cmd: string, callback: (error: Error | null, stdout: string, stderr: string) => void) => {
          callback(new Error('rembg not found'), '', 'command not found: rembg');
        },
      );
      // Output file is never written when rembg fails
      (fs.existsSync as jest.Mock).mockImplementation((p: string) => p.includes('rembg_input_'));

      const file = createMockFile();

      await expect(backgroundRemovalService.removeBackground(file)).rejects.toThrow('rembg failed');

      expect(fs.unlinkSync).toHaveBeenCalledTimes(1);
      const [unlinkedPath] = (fs.unlinkSync as jest.Mock).mock.calls[0];
      expect(unlinkedPath).toMatch(/rembg_input_/);
    });

    it('should throw an error with the rembg stderr message on failure', async () => {
      (childProcess.exec as unknown as jest.Mock).mockImplementation(
        (_cmd: string, callback: (error: Error | null, stdout: string, stderr: string) => void) => {
          callback(new Error('exit 1'), '', 'model download failed');
        },
      );

      const file = createMockFile();

      await expect(backgroundRemovalService.removeBackground(file)).rejects.toThrow(
        'rembg failed: model download failed',
      );
    });

    it('should use the error message when stderr is empty on failure', async () => {
      (childProcess.exec as unknown as jest.Mock).mockImplementation(
        (_cmd: string, callback: (error: Error | null, stdout: string, stderr: string) => void) => {
          callback(new Error('spawn error'), '', '');
        },
      );

      const file = createMockFile();

      await expect(backgroundRemovalService.removeBackground(file)).rejects.toThrow(
        'rembg failed: spawn error',
      );
    });

    it('should rename the output file correctly for various extensions', async () => {
      const cases = [
        { originalname: 'shirt.jpg', expected: 'shirt_no_bg.png' },
        { originalname: 'photo.jpeg', expected: 'photo_no_bg.png' },
        { originalname: 'image.png', expected: 'image_no_bg.png' },
        { originalname: 'no-extension', expected: 'no-extension_no_bg.png' },
      ];

      for (const { originalname, expected } of cases) {
        const result = await backgroundRemovalService.removeBackground(createMockFile({ originalname }));
        expect(result.originalname).toBe(expected);
      }
    });
  });
});
