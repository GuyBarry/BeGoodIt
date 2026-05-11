import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { StatusCodes } from 'http-status-codes';
import { clothingItemService } from '../services';
import { ImageValidationMiddleware } from '../middlewares/images.middleware';

export const clothingItemRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

clothingItemRouter.post(
  '/classify',
  upload.single('file'),
  ImageValidationMiddleware.validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await clothingItemService.classifyItem(req.file!);
      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  },
);
