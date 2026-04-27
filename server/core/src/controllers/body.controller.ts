import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { StatusCodes } from 'http-status-codes';
import { bodyService } from '../services';
import { ImageValidationMiddleware } from '../middlewares/images.middleware';
import { BadRequestException } from '../exceptions/httpExceptions';

export const bodyRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /body/image — upload a body image for a user
bodyRouter.post(
  '/image',
  upload.single('file'),
  ImageValidationMiddleware.validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.body?.userId as string | undefined;

      if (!userId || !userId.trim()) {
        return next(new BadRequestException('userId is required'));
      }

      const result = await bodyService.saveBodyImage(req.file!, userId.trim());
      res.status(StatusCodes.CREATED).json(result);
    } catch (error) {
      next(error);
    }
  },
);

// POST /body/data — save or update body measurements for a user
bodyRouter.post(
  '/data',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, heightCm, weightKg, bodyType } = req.body ?? {};

      if (!userId || !(userId as string).trim()) {
        return next(new BadRequestException('userId is required'));
      }

      const result = await bodyService.saveBodyData((userId as string).trim(), {
        heightCm: heightCm ?? null,
        weightKg: weightKg ?? null,
        bodyType: bodyType ?? null,
      });

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  },
);
