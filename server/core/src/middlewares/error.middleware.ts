import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CustomException } from '../exceptions/customException';

export const errorHandler: ErrorRequestHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (error instanceof CustomException) {
    const { message, details, statusCode } = error;
    res.status(statusCode).json({ message, details });
  } else {
    console.error('[Unhandled Error]', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Oops, something went wrong!',
    });
  }
};
