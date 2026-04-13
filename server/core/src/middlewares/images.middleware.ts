import { Request, Response, NextFunction } from 'express';
import {
  BadRequestException,
  UnsupportedMediaTypeException,
  PayloadTooLargeException,
} from '../exceptions/httpExceptions';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const MAGIC_BYTES: Record<string, number[]> = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
};

export class ImageValidationMiddleware {
  static validate(req: Request, _res: Response, next: NextFunction): void {
    const file = req.file;

    if (!file) {
      return next(new BadRequestException('No file provided'));
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return next(
        new UnsupportedMediaTypeException(`Unsupported file type: ${file.mimetype}`, {
          allowedTypes: ALLOWED_MIME_TYPES,
        }),
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return next(
        new PayloadTooLargeException('File too large', {
          maxSize: `${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        }),
      );
    }

    const expectedBytes = MAGIC_BYTES[file.mimetype];
    if (expectedBytes) {
      const fileHeader = Array.from(file.buffer.subarray(0, expectedBytes.length));
      const isValid = expectedBytes.every((byte, i) => fileHeader[i] === byte);

      if (!isValid) {
        return next(
          new BadRequestException('File appears to be corrupted or has mismatched content type'),
        );
      }
    }

    next();
  }
}
