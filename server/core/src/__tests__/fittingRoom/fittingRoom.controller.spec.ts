import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { fittingRoomRouter } from '../../controllers/fittingRoom.controller';
import { fittingRoomService } from '../../services/fittingRoom.service';
import { CustomException } from '../../exceptions/customException';

jest.mock('../../services/fittingRoom.service');

const mockErrorHandler = (error: any, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof CustomException) {
    const { message, details, statusCode } = error;
    res.status(statusCode).json({ message, details });
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Oops, something went wrong!' });
  }
};

const mockOutfitBuffer = Buffer.from('fake-outfit-png-data');

describe('fittingRoomRouter', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use(fittingRoomRouter);
    app.use(mockErrorHandler);
  });

  describe('POST /:userId/outfit', () => {
    it('should return 200 with PNG image buffer on success', async () => {
      (fittingRoomService.createFit as jest.Mock).mockResolvedValue({ imageBuffer: mockOutfitBuffer, imageId: 'generated-image-uuid-1' });

      const response = await request(app)
        .post('/user-uuid-1/outfit')
        .send({ clothingItemIds: ['item-uuid-1', 'item-uuid-2'] });

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.headers['content-type']).toMatch(/image\/png/);
      expect(response.body).toBeInstanceOf(Buffer);
      expect(fittingRoomService.createFit).toHaveBeenCalledWith('user-uuid-1', [
        'item-uuid-1',
        'item-uuid-2',
      ]);
    });

    it('should return 400 when userId is blank whitespace', async () => {
      const response = await request(app)
        .post('/%20%20%20/outfit')
        .send({ clothingItemIds: ['item-uuid-1'] });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.message).toBe('userId is required');
      expect(fittingRoomService.createFit).not.toHaveBeenCalled();
    });

    it('should return 400 when clothingItemIds is missing', async () => {
      const response = await request(app).post('/user-uuid-1/outfit').send({});

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.message).toBe('clothingItemIds must be a non-empty array');
      expect(fittingRoomService.createFit).not.toHaveBeenCalled();
    });

    it('should return 400 when clothingItemIds is an empty array', async () => {
      const response = await request(app)
        .post('/user-uuid-1/outfit')
        .send({ clothingItemIds: [] });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.message).toBe('clothingItemIds must be a non-empty array');
      expect(fittingRoomService.createFit).not.toHaveBeenCalled();
    });

    it('should return 400 when clothingItemIds is not an array', async () => {
      const response = await request(app)
        .post('/user-uuid-1/outfit')
        .send({ clothingItemIds: 'item-uuid-1' });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.message).toBe('clothingItemIds must be a non-empty array');
      expect(fittingRoomService.createFit).not.toHaveBeenCalled();
    });

    it('should return 404 when service throws NotFoundException for missing body image', async () => {
      const { NotFoundException } = jest.requireActual('../../exceptions/httpExceptions');
      (fittingRoomService.createFit as jest.Mock).mockRejectedValue(
        new NotFoundException('Please upload a body photo before generating a look.'),
      );

      const response = await request(app)
        .post('/user-uuid-1/outfit')
        .send({ clothingItemIds: ['item-uuid-1'] });

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body.message).toContain('Please upload a body photo');
    });

    it('should return 404 when service throws NotFoundException for missing clothing items', async () => {
      const { NotFoundException } = jest.requireActual('../../exceptions/httpExceptions');
      (fittingRoomService.createFit as jest.Mock).mockRejectedValue(
        new NotFoundException('No clothing items found for the provided IDs'),
      );

      const response = await request(app)
        .post('/user-uuid-1/outfit')
        .send({ clothingItemIds: ['nonexistent-id'] });

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body.message).toContain('No clothing items found');
    });

    it('should return 500 when service throws an unexpected error', async () => {
      (fittingRoomService.createFit as jest.Mock).mockRejectedValue(new Error('AI service crashed'));

      const response = await request(app)
        .post('/user-uuid-1/outfit')
        .send({ clothingItemIds: ['item-uuid-1'] });

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe('Oops, something went wrong!');
    });
  });
});
