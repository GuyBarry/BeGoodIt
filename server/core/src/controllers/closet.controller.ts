import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { StatusCodes } from "http-status-codes";
import { closetService } from "../services";
import { ImageValidationMiddleware } from "../middlewares/images.middleware";
import { setUpRateLimiter, ONE_MINUTE_MS } from "../middlewares/rateLimiter.middleware";

export const closetRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

closetRouter.get(
  "/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
      const filters = {
        search: req.query.search as string | undefined,
        category: req.query.category as string | undefined,
        color: req.query.color as string | undefined,
        season: req.query.season as string | undefined,
        style: req.query.style as string | undefined,
      };
      const result = await closetService.getItemsByUserId(
        req.params.userId,
        filters,
        page,
        limit,
      );
      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  },
);

closetRouter.post(
  "/:userId/items",
  setUpRateLimiter({ limit: 5, windowMs: ONE_MINUTE_MS }),
  upload.single("file"),
  ImageValidationMiddleware.validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parseIds = (val: unknown): number[] => {
        if (!val) return [];
        const arr = Array.isArray(val) ? val : [val];
        return arr
          .map((v) => parseInt(v as string, 10))
          .filter((n) => !isNaN(n));
      };
      const parseStrings = (val: unknown): string[] => {
        if (!val) return [];
        const arr = Array.isArray(val) ? val : [val];
        return arr.map((v) => String(v).trim()).filter(Boolean);
      };

      const colorGroupIds = parseIds(req.body.colorGroupIds);
      const categoryId = req.body.categoryId
        ? parseInt(req.body.categoryId, 10)
        : null;
      const seasonIds = parseIds(req.body.seasonIds);
      const styles = parseStrings(req.body.styles);
      const extractGarment = req.body.extractGarment === "true";
      const itemDescription =
        typeof req.body.itemDescription === "string"
          ? req.body.itemDescription
          : undefined;

      const result = await closetService.addToCloset(
        req.params.userId,
        req.file!,
        { colorGroupIds, categoryId, seasonIds, styles },
        { extractGarment, itemDescription },
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
      const removeOutfits = req.query.removeOutfits === "true";
      await closetService.removeFromCloset(req.params.userId, req.params.id, { removeOutfits });
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  },
);
