import express from 'express';
import request from 'supertest';
import { ImagesController } from '../../images/images.controller';
import { ImagesService } from '../../images/images.service';

jest.mock('../../images/images.service');

const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe('ImagesController', () => {
  let app: express.Express;
  let mockService: jest.Mocked<ImagesService>;

  beforeEach(() => {
    mockService = {
      processImage: jest.fn(),
      uploadImage: jest.fn(),
    } as unknown as jest.Mocked<ImagesService>;

    const controller = new ImagesController(mockService);
    app = express();
    app.use(controller.router);
  });

  describe('POST /image', () => {
    it('should return 201 with url and fileName on successful upload', async () => {
      mockService.uploadImage.mockResolvedValue({
        url: 'https://storage.googleapis.com/bucket/images/test.png',
        fileName: 'images/test.png',
      });

      const response = await request(app)
        .post('/image')
        .attach('file', PNG_HEADER, { filename: 'test.png', contentType: 'image/png' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        url: 'https://storage.googleapis.com/bucket/images/test.png',
        fileName: 'images/test.png',
      });
      expect(mockService.uploadImage).toHaveBeenCalledTimes(1);
    });

    it('should return 400 when no file is provided', async () => {
      const response = await request(app)
        .post('/image')
        .send();

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('No file provided');
    });

    it('should return 415 for unsupported MIME types', async () => {
      const response = await request(app)
        .post('/image')
        .attach('file', Buffer.from('not an image'), { filename: 'test.txt', contentType: 'text/plain' });

      expect(response.status).toBe(415);
      expect(response.body.error).toContain('Unsupported file type');
      expect(response.body.allowedTypes).toBeDefined();
    });

    it('should return 400 for corrupted file (mismatched magic bytes)', async () => {
      const corruptedBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);

      const response = await request(app)
        .post('/image')
        .attach('file', corruptedBuffer, { filename: 'fake.png', contentType: 'image/png' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('corrupted');
    });

    it('should return 500 when the service throws', async () => {
      mockService.uploadImage.mockRejectedValue(new Error('Firebase down'));

      const response = await request(app)
        .post('/image')
        .attach('file', PNG_HEADER, { filename: 'test.png', contentType: 'image/png' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Firebase down');
    });
  });
});
