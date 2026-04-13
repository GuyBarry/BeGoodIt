import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { imagesRouter } from '../../images/images.controller';
import { imagesService } from '../../images/images.service';

// Mock dependencies
jest.mock('../../images/images.service');
jest.mock('../../firebase/firebase.storage');

// Local Error Middleware to simulate how errors are caught
const mockErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({ error: error.message || 'Error' });
};

const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe('imagesRouter', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(imagesRouter);
    app.use(mockErrorHandler);
  });

  describe('POST /image', () => {
    it('should return 201 with url and fileName on successful upload', async () => {
      (imagesService.uploadImage as jest.Mock).mockResolvedValue({
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
      expect(imagesService.uploadImage).toHaveBeenCalledTimes(1);
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
      (imagesService.uploadImage as jest.Mock).mockRejectedValue(new Error('Firebase down'));

      const response = await request(app)
        .post('/image')
        .attach('file', PNG_HEADER, { filename: 'test.png', contentType: 'image/png' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Firebase down');
    });
  });
});
