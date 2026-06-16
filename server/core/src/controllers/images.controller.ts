import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { StatusCodes } from 'http-status-codes';
import { imagesService } from '../services';
import { ImageValidationMiddleware } from '../middlewares/images.middleware';

export const imagesRouter = Router();

const upload = multer({ storage: multer.memoryStorage() });

imagesRouter.post(
  '/',
  upload.single('file'),
  ImageValidationMiddleware.validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const imageDto = await imagesService.saveImage(req.file!);
      res.status(StatusCodes.CREATED).json(imageDto);
    } catch (error) {
      next(error);
    }
  },
);

imagesRouter.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const image = await imagesService.getImageById(req.params.id);
      res.setHeader('Content-Type', image.mimeType);
      res.setHeader('Content-Length', image.size);
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${encodeURIComponent(image.originalName)}"`
      );
      res.status(StatusCodes.OK).send(image.data);
    } catch (error) {
      next(error);
    }
  }
);
