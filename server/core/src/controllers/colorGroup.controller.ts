import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { colorGroupService } from '../services';

export const colorGroupRouter = Router();

colorGroupRouter.get('/', async (_req: Request, res: Response) => {
  const colorGroups = await colorGroupService.getAll();
  res.status(StatusCodes.OK).json(colorGroups);
});
