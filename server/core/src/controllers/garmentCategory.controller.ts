import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { garmentCategoryService } from '../services';

export const garmentCategoryRouter = Router();

garmentCategoryRouter.get('/', async (_req: Request, res: Response) => {
  const garmentCategories = await garmentCategoryService.getAll();
  res.status(StatusCodes.OK).json(garmentCategories);
});
