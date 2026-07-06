import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { outfitRouter } from '../../controllers/outfit.controller';
import { outfitService } from '../../services/outfit.service';
import { CustomException } from '../../exceptions/customException';

jest.mock('../../services/outfit.service');

const mockErrorHandler = (error: any, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof CustomException) {
    const { message, details, statusCode } = error;
    res.status(statusCode).json({ message, details });
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Oops, something went wrong!' });
  }
};

const mockOutfitDto = {
  id: 'outfit-uuid-1',
  userId: 'user-uuid-1',
  name: null,
  isFavorite: false,
  imageId: 'image-uuid-1',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  items: [],
};

describe('outfitRouter', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use(outfitRouter);
    app.use(mockErrorHandler);
  });

  describe('GET /:userId', () => {
    it('should return 200 with a list of outfits', async () => {
      (outfitService.getUserOutfits as jest.Mock).mockResolvedValue([mockOutfitDto]);

      const response = await request(app).get('/user-uuid-1');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveLength(1);
      expect(outfitService.getUserOutfits).toHaveBeenCalledWith('user-uuid-1');
    });

    it('should return 500 when the service throws an unexpected error', async () => {
      (outfitService.getUserOutfits as jest.Mock).mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/user-uuid-1');

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe('Oops, something went wrong!');
    });
  });

  describe('POST /:userId', () => {
    it('should return 201 with the saved outfit', async () => {
      (outfitService.saveOutfit as jest.Mock).mockResolvedValue(mockOutfitDto);

      const response = await request(app)
        .post('/user-uuid-1')
        .send({ imageId: 'image-uuid-1', clothingItemIds: ['item-uuid-1'] });

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(outfitService.saveOutfit).toHaveBeenCalledWith('user-uuid-1', 'image-uuid-1', ['item-uuid-1']);
    });

    it('should return 400 when imageId is missing', async () => {
      const response = await request(app)
        .post('/user-uuid-1')
        .send({ clothingItemIds: ['item-uuid-1'] });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(outfitService.saveOutfit).not.toHaveBeenCalled();
    });

    it('should return 400 when clothingItemIds is empty', async () => {
      const response = await request(app)
        .post('/user-uuid-1')
        .send({ imageId: 'image-uuid-1', clothingItemIds: [] });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(outfitService.saveOutfit).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /:userId/:outfitId', () => {
    it('should return 204 on successful deletion', async () => {
      (outfitService.deleteOutfit as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app).delete('/user-uuid-1/outfit-uuid-1');

      expect(response.status).toBe(StatusCodes.NO_CONTENT);
      expect(outfitService.deleteOutfit).toHaveBeenCalledWith('user-uuid-1', 'outfit-uuid-1');
    });

    it('should return 404 when the outfit does not exist or does not belong to the user', async () => {
      const { NotFoundException } = jest.requireActual('../../exceptions/httpExceptions');
      (outfitService.deleteOutfit as jest.Mock).mockRejectedValue(new NotFoundException('Outfit not found'));

      const response = await request(app).delete('/user-uuid-1/nonexistent-id');

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(outfitService.deleteOutfit).toHaveBeenCalledWith('user-uuid-1', 'nonexistent-id');
    });

    it('should return 500 when the service throws an unexpected error', async () => {
      (outfitService.deleteOutfit as jest.Mock).mockRejectedValue(new Error('DB error'));

      const response = await request(app).delete('/user-uuid-1/outfit-uuid-1');

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe('Oops, something went wrong!');
    });
  });
});
