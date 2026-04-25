import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { colorGroupRouter } from '../../controllers/colorGroup.controller';
import { colorGroupService } from '../../services/colorGroup.service';
import { CustomException } from '../../exceptions/customException';

jest.mock('../../services/colorGroup.service');

const mockErrorHandler = (error: any, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof CustomException) {
    res.status(error.statusCode).json({ message: error.message, details: error.details });
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Oops, something went wrong!' });
  }
};

const mockColorGroups = [
  { id: 1, name: 'Blue' },
  { id: 2, name: 'Green' },
];

describe('colorGroupRouter', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(colorGroupRouter);
    app.use(mockErrorHandler);
  });

  describe('GET /', () => {
    it('should return 200 with all color groups', async () => {
      (colorGroupService.getAll as jest.Mock).mockResolvedValue(mockColorGroups);

      const response = await request(app).get('/');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual(mockColorGroups);
      expect(colorGroupService.getAll).toHaveBeenCalledTimes(1);
    });

    it('should return 200 with empty array when no color groups exist', async () => {
      (colorGroupService.getAll as jest.Mock).mockResolvedValue([]);

      const response = await request(app).get('/');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual([]);
    });

    it('should return 500 when service throws an unexpected error', async () => {
      (colorGroupService.getAll as jest.Mock).mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/');

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe('Oops, something went wrong!');
    });
  });
});
