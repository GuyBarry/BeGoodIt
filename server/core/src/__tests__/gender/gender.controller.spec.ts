import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { genderRouter } from '../../controllers/gender.controller';
import { genderService } from '../../services/gender.service';
import { CustomException } from '../../exceptions/customException';

jest.mock('../../services/gender.service');

const mockErrorHandler = (error: any, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof CustomException) {
    res.status(error.statusCode).json({ message: error.message, details: error.details });
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Oops, something went wrong!' });
  }
};

const mockGenders = [
  { id: 1, name: 'Male' },
  { id: 2, name: 'Female' },
];

describe('genderRouter', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(genderRouter);
    app.use(mockErrorHandler);
  });

  describe('GET /', () => {
    it('should return 200 with all genders', async () => {
      (genderService.getAll as jest.Mock).mockResolvedValue(mockGenders);

      const response = await request(app).get('/');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual(mockGenders);
      expect(genderService.getAll).toHaveBeenCalledTimes(1);
    });

    it('should return 200 with empty array when no genders exist', async () => {
      (genderService.getAll as jest.Mock).mockResolvedValue([]);

      const response = await request(app).get('/');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual([]);
    });

    it('should return 500 when service throws an unexpected error', async () => {
      (genderService.getAll as jest.Mock).mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/');

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe('Oops, something went wrong!');
    });
  });
});
