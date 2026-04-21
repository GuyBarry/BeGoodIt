import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { StatusCodes } from 'http-status-codes';
import { imagesService } from '../services';
import { ImageValidationMiddleware } from '../middlewares/images.middleware';

export const imagesRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Post image
imagesRouter.post(
  '/',
  upload.single('file'),
  ImageValidationMiddleware.validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await imagesService.uploadImage(req.file!);
      res.status(StatusCodes.CREATED).json(result);
    } catch (error) {
      next(error);
    }
  }
);
