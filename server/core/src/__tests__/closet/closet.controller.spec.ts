import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { closetRouter } from '../../controllers/closet.controller';
import { closetService } from '../../services/closet.service';
import { CustomException } from '../../exceptions/customException';

jest.mock('../../services/closet.service');

const mockErrorHandler = (error: any, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof CustomException) {
    const { message, details, statusCode } = error;
    res.status(statusCode).json({ message, details });
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Oops, something went wrong!' });
  }
};

const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const mockClothingItemDto = {
  id: 'item-uuid-1',
  userId: 'user-uuid-1',
  imageId: 'image-uuid-1',
  style: null,
  colorGroup: null,
  category: null,
  season: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('closetRouter', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use(closetRouter);
    app.use(mockErrorHandler);
  });

  describe('GET /:userId', () => {
    it('should return 200 with a list of clothing items', async () => {
      (closetService.getItemsByUserId as jest.Mock).mockResolvedValue([mockClothingItemDto]);

      const response = await request(app).get('/user-uuid-1');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({ id: mockClothingItemDto.id, userId: mockClothingItemDto.userId });
      expect(closetService.getItemsByUserId).toHaveBeenCalledWith('user-uuid-1');
    });

    it('should return 200 with an empty array when the user has no items', async () => {
      (closetService.getItemsByUserId as jest.Mock).mockResolvedValue([]);

      const response = await request(app).get('/user-uuid-1');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual([]);
    });

    it('should return 500 when the service throws an unexpected error', async () => {
      (closetService.getItemsByUserId as jest.Mock).mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/user-uuid-1');

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe('Oops, something went wrong!');
    });
  });

  describe('POST /:userId/items', () => {
    it('should return 201 with ClothingItemDto on successful upload without tags', async () => {
      (closetService.addToCloset as jest.Mock).mockResolvedValue(mockClothingItemDto);

      const response = await request(app)
        .post('/user-uuid-1/items')
        .attach('file', PNG_HEADER, { filename: 'shirt.png', contentType: 'image/png' });

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body).toMatchObject({ id: mockClothingItemDto.id, userId: mockClothingItemDto.userId });
      expect(closetService.addToCloset).toHaveBeenCalledWith(
        'user-uuid-1',
        expect.objectContaining({ originalname: 'shirt.png', mimetype: 'image/png' }),
        { colorGroupId: null, categoryId: null, seasonId: null, style: null },
      );
    });

    it('should return 201 and pass tags to the service', async () => {
      (closetService.addToCloset as jest.Mock).mockResolvedValue(mockClothingItemDto);

      const response = await request(app)
        .post('/user-uuid-1/items')
        .attach('file', PNG_HEADER, { filename: 'shirt.png', contentType: 'image/png' })
        .field('colorGroupId', '2')
        .field('categoryId', '3')
        .field('seasonId', '1')
        .field('style', 'casual');

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(closetService.addToCloset).toHaveBeenCalledWith(
        'user-uuid-1',
        expect.objectContaining({ originalname: 'shirt.png' }),
        { colorGroupId: 2, categoryId: 3, seasonId: 1, style: 'casual' },
      );
    });

    it('should return 400 when no file is provided', async () => {
      const response = await request(app).post('/user-uuid-1/items').send();

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.message).toBe('No file provided');
      expect(closetService.addToCloset).not.toHaveBeenCalled();
    });

    it('should return 415 for an unsupported MIME type', async () => {
      const response = await request(app)
        .post('/user-uuid-1/items')
        .attach('file', Buffer.from('not-an-image'), { filename: 'doc.pdf', contentType: 'application/pdf' });

      expect(response.status).toBe(StatusCodes.UNSUPPORTED_MEDIA_TYPE);
      expect(closetService.addToCloset).not.toHaveBeenCalled();
    });

    it('should return 400 for a corrupted file with mismatched magic bytes', async () => {
      const response = await request(app)
        .post('/user-uuid-1/items')
        .attach('file', Buffer.from([0x00, 0x00, 0x00, 0x00]), { filename: 'fake.png', contentType: 'image/png' });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(closetService.addToCloset).not.toHaveBeenCalled();
    });

    it('should return 500 when the service throws an unexpected error', async () => {
      (closetService.addToCloset as jest.Mock).mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .post('/user-uuid-1/items')
        .attach('file', PNG_HEADER, { filename: 'shirt.png', contentType: 'image/png' });

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe('Oops, something went wrong!');
    });
  });

  describe('DELETE /:userId/items/:id', () => {
    it('should return 204 on successful removal', async () => {
      (closetService.removeFromCloset as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app).delete('/user-uuid-1/items/item-uuid-1');

      expect(response.status).toBe(StatusCodes.NO_CONTENT);
      expect(closetService.removeFromCloset).toHaveBeenCalledWith('user-uuid-1', 'item-uuid-1');
    });

    it('should return 404 when item does not exist or does not belong to user', async () => {
      const { NotFoundException } = jest.requireActual('../../exceptions/httpExceptions');
      (closetService.removeFromCloset as jest.Mock).mockRejectedValue(new NotFoundException('Clothing item not found'));

      const response = await request(app).delete('/user-uuid-1/items/nonexistent-id');

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(closetService.removeFromCloset).toHaveBeenCalledWith('user-uuid-1', 'nonexistent-id');
    });

    it('should return 500 when the service throws an unexpected error', async () => {
      (closetService.removeFromCloset as jest.Mock).mockRejectedValue(new Error('DB error'));

      const response = await request(app).delete('/user-uuid-1/items/item-uuid-1');

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe('Oops, something went wrong!');
    });
  });
});
