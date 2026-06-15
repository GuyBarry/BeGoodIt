import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestException } from '../exceptions';
import { authService } from '../services/auth.service';

type GoogleLoginBody = { credential?: string };
type RegisterBody = { username?: string; email?: string; password?: string };
type LoginBody = { identifier?: string; password?: string };

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

authRouter.post(
  '/register',
  async (req: Request<{}, {}, RegisterBody>, res: Response) => {
    const { username, email, password } = req.body ?? {};
    if (
      typeof username !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      throw new BadRequestException('username, email and password are required');
    }
    const user = await authService.register({ username, email, password });
    res.status(StatusCodes.CREATED).json(user);
  },
);

authRouter.post(
  '/login',
  async (req: Request<{}, {}, LoginBody>, res: Response) => {
    const { identifier, password } = req.body ?? {};
    if (typeof identifier !== 'string' || typeof password !== 'string') {
      throw new BadRequestException('identifier and password are required');
    }
    const user = await authService.login({ identifier, password });
    res.status(StatusCodes.OK).json(user);
  },
);
