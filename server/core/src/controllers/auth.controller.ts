import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestException } from '../exceptions';
import { authService } from '../services/auth.service';

type GoogleLoginBody = { credential?: string };
type RegisterBody = { username?: string; email?: string; password?: string };
type LoginBody = { identifier?: string; password?: string };
type RefreshBody = { refreshToken?: string };

export const authRouter = Router();

authRouter.post(
  '/google',
  async (req: Request<{}, {}, GoogleLoginBody>, res: Response) => {
    const credential = req.body?.credential;
    if (!credential || typeof credential !== 'string') {
      throw new BadRequestException('Missing Google credential');
    }
    const result = await authService.loginWithGoogle(credential);
    res.status(StatusCodes.OK).json(result);
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
    const result = await authService.register({ username, email, password });
    res.status(StatusCodes.CREATED).json(result);
  },
);

authRouter.post(
  '/login',
  async (req: Request<{}, {}, LoginBody>, res: Response) => {
    const { identifier, password } = req.body ?? {};
    if (typeof identifier !== 'string' || typeof password !== 'string') {
      throw new BadRequestException('identifier and password are required');
    }
    const result = await authService.login({ identifier, password });
    res.status(StatusCodes.OK).json(result);
  },
);

authRouter.post(
  '/refresh',
  async (req: Request<{}, {}, RefreshBody>, res: Response) => {
    const refreshToken = req.body?.refreshToken;
    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new BadRequestException('Refresh token is required');
    }
    const tokens = await authService.refresh(refreshToken);
    res.status(StatusCodes.OK).json(tokens);
  },
);
