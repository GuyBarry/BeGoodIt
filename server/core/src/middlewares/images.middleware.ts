import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const MAGIC_BYTES: Record<string, number[]> = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
};

export class ImageValidationMiddleware {
  static validate(req: Request, res: Response, next: NextFunction): void {
    const file = req.file;

    if (!file) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'No file provided' });
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      res.status(StatusCodes.UNSUPPORTED_MEDIA_TYPE).json({
        error: `Unsupported file type: ${file.mimetype}`,
        allowedTypes: ALLOWED_MIME_TYPES,
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      res.status(StatusCodes.REQUEST_TOO_LONG).json({
        error: 'File too large',
        maxSize: `${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      });
      return;
    }

    const expectedBytes = MAGIC_BYTES[file.mimetype];
    if (expectedBytes) {
      const fileHeader = Array.from(file.buffer.subarray(0, expectedBytes.length));
      const isValid = expectedBytes.every((byte, i) => fileHeader[i] === byte);

      if (!isValid) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'File appears to be corrupted or has mismatched content type' });
        return;
      }
    }

    next();
  }
}
