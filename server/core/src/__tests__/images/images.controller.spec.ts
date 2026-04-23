import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { imagesRouter } from '../../controllers/images.controller';
import { imagesService } from '../../services/images.service';
import { CustomException } from '../../exceptions/customException';
import { NotFoundException } from '../../exceptions/httpExceptions';

jest.mock('../../services/images.service');

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
  id: 'uuid-1234',
  mimeType: 'image/png',
  originalName: 'test.png',
  size: PNG_HEADER.length,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('imagesRouter', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(imagesRouter);
    app.use(mockErrorHandler);
  });

  describe('POST /', () => {
    it('should return 201 with ImageDto on successful upload', async () => {
      (imagesService.saveImage as jest.Mock).mockResolvedValue(mockDto);

      const response = await request(app)
        .post('/')
        .attach('file', PNG_HEADER, { filename: 'test.png', contentType: 'image/png' });

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body).toMatchObject({
        id: mockDto.id,
        mimeType: mockDto.mimeType,
        originalName: mockDto.originalName,
        size: mockDto.size,
      });
      expect(response.body.data).toBeUndefined();
      expect(imagesService.saveImage).toHaveBeenCalledTimes(1);
    });

    it('should return 400 when no file is provided', async () => {
      const response = await request(app).post('/').send();

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.message).toBe('No file provided');
    });

    it('should return 415 for unsupported MIME types', async () => {
      const response = await request(app)
        .post('/')
        .attach('file', Buffer.from('not an image'), { filename: 'test.txt', contentType: 'text/plain' });

      expect(response.status).toBe(StatusCodes.UNSUPPORTED_MEDIA_TYPE);
      expect(response.body.message).toContain('Unsupported file type');
      expect(response.body.details).toEqual({ allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] });
    });

    it('should return 400 for corrupted file (mismatched magic bytes)', async () => {
      const corruptedBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);

      const response = await request(app)
        .post('/')
        .attach('file', corruptedBuffer, { filename: 'fake.png', contentType: 'image/png' });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.message).toContain('corrupted');
    });

    it('should return 500 when the service throws an unexpected error', async () => {
      (imagesService.saveImage as jest.Mock).mockRejectedValue(new Error('DB connection lost'));

      const response = await request(app)
        .post('/')
        .attach('file', PNG_HEADER, { filename: 'test.png', contentType: 'image/png' });

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe('Oops, something went wrong!');
    });
  });

  describe('GET /:id', () => {
    it('should return 200 with raw image data and correct headers', async () => {
      const mockImage = {
        id: 'uuid-1234',
        data: PNG_HEADER,
        mimeType: 'image/png',
        originalName: 'test.png',
        size: PNG_HEADER.length,
        createdAt: new Date(),
      };
      (imagesService.getImageById as jest.Mock).mockResolvedValue(mockImage);

      const response = await request(app).get('/uuid-1234');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.headers['content-type']).toContain('image/png');
      expect(Buffer.from(response.body)).toEqual(PNG_HEADER);
      expect(imagesService.getImageById).toHaveBeenCalledWith('uuid-1234');
    });

    it('should return 404 when image is not found', async () => {
      (imagesService.getImageById as jest.Mock).mockRejectedValue(
        new NotFoundException("Image with id 'missing-id' not found")
      );

      const response = await request(app).get('/missing-id');

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body.message).toContain('missing-id');
    });

    it('should return 500 when the service throws an unexpected error', async () => {
      (imagesService.getImageById as jest.Mock).mockRejectedValue(new Error('DB down'));

      const response = await request(app).get('/uuid-1234');

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe('Oops, something went wrong!');
    });
  });
});
