import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { StatusCodes } from 'http-status-codes';
import { closetService } from '../services';
import { ImageValidationMiddleware } from '../middlewares/images.middleware';

export const closetRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

closetRouter.get('/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await closetService.getItemsByUserId(req.params.userId);
    res.status(StatusCodes.OK).json(items);
  } catch (error) {
    next(error);
  }
});

closetRouter.post(
  '/:userId/items',
  upload.single('file'),
  ImageValidationMiddleware.validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await closetService.addToCloset(req.params.userId, req.file!);
      res.status(StatusCodes.CREATED).json(result);
    } catch (error) {
      next(error);
    }
  },
);
