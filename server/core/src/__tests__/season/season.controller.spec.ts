import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { seasonRouter } from '../../controllers/season.controller';
import { seasonService } from '../../services/season.service';
import { CustomException } from '../../exceptions/customException';

jest.mock('../../services/season.service');

const mockErrorHandler = (error: any, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof CustomException) {
    res.status(error.statusCode).json({ message: error.message, details: error.details });
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Oops, something went wrong!' });
  }
};

const mockSeasons = [
  { id: 1, name: 'Summer' },
  { id: 2, name: 'Winter' },
];

describe('seasonRouter', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(seasonRouter);
    app.use(mockErrorHandler);
  });

  describe('GET /', () => {
    it('should return 200 with all seasons', async () => {
      (seasonService.getAll as jest.Mock).mockResolvedValue(mockSeasons);

      const response = await request(app).get('/');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual(mockSeasons);
      expect(seasonService.getAll).toHaveBeenCalledTimes(1);
    });

    it('should return 200 with empty array when no seasons exist', async () => {
      (seasonService.getAll as jest.Mock).mockResolvedValue([]);

      const response = await request(app).get('/');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual([]);
    });

    it('should return 500 when service throws an unexpected error', async () => {
      (seasonService.getAll as jest.Mock).mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/');

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe('Oops, something went wrong!');
    });
  });
});
