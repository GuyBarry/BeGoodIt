import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { StatusCodes } from "http-status-codes";
import { closetService } from "../services";
import { ImageValidationMiddleware } from "../middlewares/images.middleware";

export const closetRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

closetRouter.get(
  "/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await closetService.getItemsByUserId(req.params.userId);
      res.status(StatusCodes.OK).json(items);
    } catch (error) {
      next(error);
    }
  },
);

closetRouter.post(
  "/:userId/items",
  upload.single("file"),
  ImageValidationMiddleware.validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const colorGroupId = req.body.colorGroupId
        ? parseInt(req.body.colorGroupId, 10)
        : null;
      const categoryId = req.body.categoryId
        ? parseInt(req.body.categoryId, 10)
        : null;
      const seasonId = req.body.seasonId
        ? parseInt(req.body.seasonId, 10)
        : null;
      const style = req.body.style?.trim() || null;

      const result = await closetService.addToCloset(
        req.params.userId,
        req.file!,
        {
          colorGroupId,
          categoryId,
          seasonId,
          style,
        },
      );
      res.status(StatusCodes.CREATED).json(result);
    } catch (error) {
      next(error);
    }
  },
);

closetRouter.delete(
  "/:userId/items/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await closetService.removeFromCloset(req.params.userId, req.params.id);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  },
);
