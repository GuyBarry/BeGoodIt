import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { clothingItemService } from '../services';

export const clothingItemRouter = Router();

clothingItemRouter.get('/user/:userId', async (req: Request, res: Response) => {
  const items = await clothingItemService.getAllByUserId(req.params.userId);
  res.status(StatusCodes.OK).json(items);
});

clothingItemRouter.delete('/:id', async (req: Request, res: Response) => {
  await clothingItemService.deleteById(req.params.id);
  res.status(StatusCodes.NO_CONTENT).send();
});
