import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { StatusCodes } from 'http-status-codes';
import { clothingItemService, imagesService } from '../services';
import { ImageValidationMiddleware } from '../middlewares/images.middleware';
import { BadRequestException } from '../exceptions/httpExceptions';

export const clothingItemRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

clothingItemRouter.post(
  '/',
  upload.single('file'),
  ImageValidationMiddleware.validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.body?.userId as string | undefined;
      if (!userId || !userId.trim()) {
        return next(new BadRequestException('userId is required'));
      }

      const colorGroupId = req.body.colorGroupId ? parseInt(req.body.colorGroupId, 10) : null;
      const categoryId = req.body.categoryId ? parseInt(req.body.categoryId, 10) : null;
      const seasonId = req.body.seasonId ? parseInt(req.body.seasonId, 10) : null;
      const style = req.body.style?.trim() || null;

      const image = await imagesService.saveImage(req.file!);
      const item = await clothingItemService.addItem(userId.trim(), image.id, {
        colorGroupId,
        categoryId,
        seasonId,
        style,
      });

      res.status(StatusCodes.CREATED).json(item);
    } catch (error) {
      next(error);
    }
  },
);

clothingItemRouter.get('/user/:userId', async (req: Request, res: Response) => {
  const items = await clothingItemService.getAllByUserId(req.params.userId);
  res.status(StatusCodes.OK).json(items);
});

clothingItemRouter.delete('/:id', async (req: Request, res: Response) => {
  await clothingItemService.deleteById(req.params.id);
  res.status(StatusCodes.NO_CONTENT).send();
});
