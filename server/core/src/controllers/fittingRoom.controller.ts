import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { StatusCodes } from 'http-status-codes';
import { fittingRoomService } from '../services';
import { inspirationMatchingService } from '../services/inspirationMatching.service';
import { BadRequestException } from '../exceptions/httpExceptions';

const upload = multer({ storage: multer.memoryStorage() });

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

      const { imageBuffer, imageId } = await fittingRoomService.createFit(userId, clothingItemIds);

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Length', imageBuffer.length);
      res.setHeader('X-Image-Id', imageId);
      res.setHeader('Access-Control-Expose-Headers', 'X-Image-Id');
      res.status(StatusCodes.OK).send(imageBuffer);
    } catch (error) {
      next(error);
    }
  },
);

fittingRoomRouter.post(
  '/:userId/find-matches',
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      if (!userId || !userId.trim()) {
        return next(new BadRequestException('userId is required'));
      }
      if (!req.file) {
        return next(new BadRequestException('file is required'));
      }

      const matchedItemIds = await inspirationMatchingService.findMatches(userId, {
        mimeType: req.file.mimetype,
        data: req.file.buffer,
      });

      res.status(StatusCodes.OK).json({ matchedItemIds });
    } catch (error) {
      next(error);
    }
  },
);
