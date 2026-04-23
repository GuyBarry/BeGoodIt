import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { genderService } from '../services';

export const genderRouter = Router();

genderRouter.get('/', async (_req: Request, res: Response) => {
  const genders = await genderService.getAll();
  res.status(StatusCodes.OK).json(genders);
});
