import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { clothingItemRouter } from '../../controllers/clothingItem.controller';
import { clothingItemService } from '../../services/clothingItem.service';
import { CustomException } from '../../exceptions/customException';

jest.mock('../../services/clothingItem.service');

const mockErrorHandler = (error: any, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof CustomException) {
    res.status(error.statusCode).json({ message: error.message, details: error.details });
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Oops, something went wrong!' });
  }
};

const mockClothingItems = [
  {
    id: 'item-uuid-1',
    userId: 'user-uuid-1',
    imageUrl: 'https://example.com/img1.jpg',
    style: 'casual',
    colorGroup: { id: 1, name: 'Blue' },
    category: { id: 2, name: 'Tops' },
    season: { id: 1, name: 'Summer' },
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: 'item-uuid-2',
    userId: 'user-uuid-1',
    imageUrl: 'https://example.com/img2.jpg',
    style: null,
    colorGroup: null,
    category: null,
    season: null,
    createdAt: new Date('2026-01-02T00:00:00.000Z'),
  },
];

describe('clothingItemRouter', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(clothingItemRouter);
    app.use(mockErrorHandler);
  });

  describe('GET /user/:userId', () => {
    it('should return 200 with all clothing items for the user', async () => {
      (clothingItemService.getAllByUserId as jest.Mock).mockResolvedValue(mockClothingItems);

      const response = await request(app).get('/user/user-uuid-1');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({ id: 'item-uuid-1', userId: 'user-uuid-1' });
      expect(clothingItemService.getAllByUserId).toHaveBeenCalledWith('user-uuid-1');
    });

    it('should return 200 with empty array when user has no clothing items', async () => {
      (clothingItemService.getAllByUserId as jest.Mock).mockResolvedValue([]);

      const response = await request(app).get('/user/user-uuid-1');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual([]);
    });

    it('should return 500 when service throws an unexpected error', async () => {
      (clothingItemService.getAllByUserId as jest.Mock).mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/user/user-uuid-1');

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe('Oops, something went wrong!');
    });
  });
});
