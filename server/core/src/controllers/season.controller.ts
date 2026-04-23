import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { seasonService } from '../services';

export const seasonRouter = Router();

seasonRouter.get('/', async (_req: Request, res: Response) => {
  const seasons = await seasonService.getAll();
  res.status(StatusCodes.OK).json(seasons);
});
