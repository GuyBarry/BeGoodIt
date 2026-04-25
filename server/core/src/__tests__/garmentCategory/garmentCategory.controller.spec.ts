import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { garmentCategoryRouter } from '../../controllers/garmentCategory.controller';
import { garmentCategoryService } from '../../services/garmentCategory.service';
import { CustomException } from '../../exceptions/customException';

jest.mock('../../services/garmentCategory.service');

const mockErrorHandler = (error: any, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof CustomException) {
    res.status(error.statusCode).json({ message: error.message, details: error.details });
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Oops, something went wrong!' });
  }
};

const mockGarmentCategories = [
  { id: 1, name: 'Tops' },
  { id: 2, name: 'Bottoms' },
];

describe('garmentCategoryRouter', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(garmentCategoryRouter);
    app.use(mockErrorHandler);
  });

  describe('GET /', () => {
    it('should return 200 with all garment categories', async () => {
      (garmentCategoryService.getAll as jest.Mock).mockResolvedValue(mockGarmentCategories);

      const response = await request(app).get('/');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual(mockGarmentCategories);
      expect(garmentCategoryService.getAll).toHaveBeenCalledTimes(1);
    });

    it('should return 200 with empty array when no garment categories exist', async () => {
      (garmentCategoryService.getAll as jest.Mock).mockResolvedValue([]);

      const response = await request(app).get('/');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual([]);
    });

    it('should return 500 when service throws an unexpected error', async () => {
      (garmentCategoryService.getAll as jest.Mock).mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/');

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe('Oops, something went wrong!');
    });
  });
});
