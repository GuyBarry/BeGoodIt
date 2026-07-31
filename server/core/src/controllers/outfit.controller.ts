import { Router, Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { outfitService } from '../services';
import { BadRequestException } from '../exceptions/httpExceptions';

export const outfitRouter = Router();

outfitRouter.get(
  '/:userId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      if (!userId || !userId.trim()) {
        return next(new BadRequestException('userId is required'));
      }
      const outfits = await outfitService.getUserOutfits(userId);
      res.status(StatusCodes.OK).json(outfits);
    } catch (error) {
      next(error);
    }
  },
);

outfitRouter.post(
  '/:userId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { imageId, clothingItemIds } = req.body ?? {};

      if (!userId || !userId.trim()) {
        return next(new BadRequestException('userId is required'));
      }
      if (!imageId || typeof imageId !== 'string') {
        return next(new BadRequestException('imageId is required'));
      }
      if (!Array.isArray(clothingItemIds) || clothingItemIds.length === 0) {
        return next(new BadRequestException('clothingItemIds must be a non-empty array'));
      }

      const outfit = await outfitService.saveOutfit(userId, imageId, clothingItemIds);
      res.status(StatusCodes.CREATED).json(outfit);
    } catch (error) {
      next(error);
    }
  },
);

outfitRouter.delete(
  '/:userId/:outfitId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, outfitId } = req.params;
      if (!userId || !userId.trim()) {
        return next(new BadRequestException('userId is required'));
      }
      if (!outfitId || !outfitId.trim()) {
        return next(new BadRequestException('outfitId is required'));
      }
      await outfitService.deleteOutfit(userId, outfitId);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  },
);
