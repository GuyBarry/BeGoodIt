import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { bodyRouter } from '../../controllers/body.controller';
import { bodyService } from '../../services/body.service';
import { CustomException } from '../../exceptions/customException';

jest.mock('../../services/body.service');

const mockErrorHandler = (error: any, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof CustomException) {
    const { message, details, statusCode } = error;
    res.status(statusCode).json({ message, details });
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Oops, something went wrong!',
    });
  }
};

const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const mockDto = {
  id: 'body-uuid-1',
  userId: 'user-uuid-1',
  imageId: 'image-uuid-1',
  picture: null,
  heightCm: null,
  weightKg: null,
  bodyType: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('bodyRouter', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(bodyRouter);
    app.use(mockErrorHandler);
  });

  describe('POST /image', () => {
    it('should return 201 with BodyMappingDto on successful upload', async () => {
      (bodyService.saveBodyImage as jest.Mock).mockResolvedValue(mockDto);

      const response = await request(app)
        .post('/image')
        .field('userId', 'user-uuid-1')
        .attach('file', PNG_HEADER, { filename: 'body.png', contentType: 'image/png' });

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body).toMatchObject({
        id: mockDto.id,
        userId: mockDto.userId,
        imageId: mockDto.imageId,
        picture: null,
        heightCm: null,
        weightKg: null,
        bodyType: null,
      });
      expect(bodyService.saveBodyImage).toHaveBeenCalledTimes(1);
      expect(bodyService.saveBodyImage).toHaveBeenCalledWith(
        expect.objectContaining({ originalname: 'body.png', mimetype: 'image/png' }),
        'user-uuid-1',
      );
    });

    it('should return 201 and update existing mapping when user re-uploads', async () => {
      const updatedDto = { ...mockDto, imageId: 'image-uuid-2' };
      (bodyService.saveBodyImage as jest.Mock).mockResolvedValue(updatedDto);

      const response = await request(app)
        .post('/image')
        .field('userId', 'user-uuid-1')
        .attach('file', PNG_HEADER, { filename: 'body2.png', contentType: 'image/png' });

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body.imageId).toBe('image-uuid-2');
    });

    it('should return 400 when userId is missing', async () => {
      const response = await request(app)
        .post('/image')
        .attach('file', PNG_HEADER, { filename: 'body.png', contentType: 'image/png' });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.message).toBe('userId is required');
      expect(bodyService.saveBodyImage).not.toHaveBeenCalled();
    });

    it('should return 400 when userId is blank whitespace', async () => {
      const response = await request(app)
        .post('/image')
        .field('userId', '   ')
        .attach('file', PNG_HEADER, { filename: 'body.png', contentType: 'image/png' });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.message).toBe('userId is required');
      expect(bodyService.saveBodyImage).not.toHaveBeenCalled();
    });

    it('should return 400 when no file is provided', async () => {
      const response = await request(app)
        .post('/image')
        .field('userId', 'user-uuid-1');

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.message).toBe('No file provided');
      expect(bodyService.saveBodyImage).not.toHaveBeenCalled();
    });

    it('should return 415 for unsupported MIME type', async () => {
      const response = await request(app)
        .post('/image')
        .field('userId', 'user-uuid-1')
        .attach('file', Buffer.from('not-an-image'), { filename: 'doc.pdf', contentType: 'application/pdf' });

      expect(response.status).toBe(StatusCodes.UNSUPPORTED_MEDIA_TYPE);
      expect(response.body.message).toContain('Unsupported file type');
      expect(response.body.details).toEqual({ allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] });
      expect(bodyService.saveBodyImage).not.toHaveBeenCalled();
    });

    it('should return 400 for corrupted file (mismatched magic bytes)', async () => {
      const corruptedBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);

      const response = await request(app)
        .post('/image')
        .field('userId', 'user-uuid-1')
        .attach('file', corruptedBuffer, { filename: 'fake.png', contentType: 'image/png' });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.message).toContain('corrupted');
      expect(bodyService.saveBodyImage).not.toHaveBeenCalled();
    });

    it('should return 500 when service throws an unexpected error', async () => {
      (bodyService.saveBodyImage as jest.Mock).mockRejectedValue(new Error('DB connection lost'));

      const response = await request(app)
        .post('/image')
        .field('userId', 'user-uuid-1')
        .attach('file', PNG_HEADER, { filename: 'body.png', contentType: 'image/png' });

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe('Oops, something went wrong!');
    });
  });
});
