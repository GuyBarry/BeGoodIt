import { RequestHandler } from 'express';

const noopMiddleware: RequestHandler = (_req, _res, next) => next();

export const setUpRateLimiter = () => noopMiddleware;

export const ONE_SECOND_MS = 1_000;
export const ONE_MINUTE_MS = ONE_SECOND_MS * 60;
