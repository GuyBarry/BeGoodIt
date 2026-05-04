import { Router, Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { imagesService } from '../services';

export const imagesRouter = Router();

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
