import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { StatusCodes } from 'http-status-codes';
import { smartBuyService } from '../services/smartBuy.service';

const upload = multer({ storage: multer.memoryStorage() });

export const smartBuyRouter = Router();

smartBuyRouter.get('/product-image', async (req: Request, res: Response, next: NextFunction) => {
  console.log('[SmartBuy] Request received, url:', req.query.url);
  try {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'url query parameter is required' });
      return;
    }

    const { data, mimeType, title, meta } = await smartBuyService.fetchProductImage(url);
    res.set('Content-Type', mimeType);
    res.set('Cache-Control', 'public, max-age=3600');
    res.set('Access-Control-Expose-Headers', 'X-Product-Title, X-Product-Category');
    if (title) res.set('X-Product-Title', encodeURIComponent(title));
    if (meta.category) res.set('X-Product-Category', encodeURIComponent(meta.category));
    res.send(data);
  } catch (err) {
    next(err);
  }
});

smartBuyRouter.post('/analyze', upload.single('image'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;
    if (!userId || typeof userId !== 'string') {
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'userId is required' });
      return;
    }
    if (!req.file) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'image file is required' });
      return;
    }
    const result = await smartBuyService.analyzeCompatibility(req.file, userId);
    res.status(StatusCodes.OK).json(result);
  } catch (err) {
    next(err);
  }
});
