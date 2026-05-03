import { Router, Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { fittingRoomService } from '../services';
import { BadRequestException } from '../exceptions/httpExceptions';

export const fittingRoomRouter = Router();

fittingRoomRouter.post(
  '/:userId/outfit',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { clothingItemIds } = req.body ?? {};

      if (!userId || !userId.trim()) {
        return next(new BadRequestException('userId is required'));
      }

      if (!Array.isArray(clothingItemIds) || clothingItemIds.length === 0) {
        return next(new BadRequestException('clothingItemIds must be a non-empty array'));
      }

      const imageBuffer = await fittingRoomService.createFit(userId, clothingItemIds);

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Length', imageBuffer.length);
      res.status(StatusCodes.OK).send(imageBuffer);
    } catch (error) {
      next(error);
    }
  },
);
