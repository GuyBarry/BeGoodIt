import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { StatusCodes } from 'http-status-codes';
import { ImagesService } from './images.service';
import { ImageValidationMiddleware } from '../middlewares/images.middleware';

const upload = multer({ storage: multer.memoryStorage() });

export class ImagesController {
  readonly router: Router;

  constructor(private readonly imagesService: ImagesService) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post(
      '/image',
      upload.single('file'),
      ImageValidationMiddleware.validate,
      this.upload.bind(this)
    );
    this.router.use(this.handleError.bind(this));
  }

  private async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.imagesService.uploadImage(req.file!);
      res.status(StatusCodes.CREATED).json(result);
    } catch (error) {
      next(error);
    }
  }

  private handleError(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
    const message = error instanceof Error ? error.message : 'Unexpected error during upload';
    const statusCode = this.resolveStatusCode(error);
    res.status(statusCode).json({ error: message });
  }

  private resolveStatusCode(error: unknown): number {
    if (error instanceof Error) {
      if (error.message.includes('not found')) return StatusCodes.NOT_FOUND;
      if (error.message.includes('unauthorized')) return StatusCodes.UNAUTHORIZED;
    }
    return StatusCodes.INTERNAL_SERVER_ERROR;
  }
}
