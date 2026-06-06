import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestException } from '../exceptions';
import { authService } from '../services/auth.service';

type GoogleLoginBody = { credential?: string };

export const authRouter = Router();

authRouter.post(
  '/google',
  async (req: Request<{}, {}, GoogleLoginBody>, res: Response) => {
    const credential = req.body?.credential;
    if (!credential || typeof credential !== 'string') {
      throw new BadRequestException('Missing Google credential');
    }
    const user = await authService.loginWithGoogle(credential);
    res.status(StatusCodes.OK).json(user);
  },
);
