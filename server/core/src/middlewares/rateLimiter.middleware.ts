import { Request } from "express";
import {
  ipKeyGenerator,
  rateLimit,
  Options as RateLimitOptions,
  RateLimitRequestHandler
} from "express-rate-limit";

export const ONE_SECOND_MS = 1_000;
export const ONE_MINUTE_MS = ONE_SECOND_MS * 60;

export const setUpRateLimiter = (
  limitOptions?: Pick<RateLimitOptions, "limit" | "windowMs">,
): RateLimitRequestHandler =>
  rateLimit({
    ...limitOptions,
    // Key: combination of route path + userId (from params or body)
    keyGenerator: (req: Request): string => {
      const userId: string =
        (req.params?.userId as string) ||
        (req.body?.userId as string) ||
        ipKeyGenerator(req.ip as string);
      return `${req.method}:${req.route?.path ?? req.path}:${userId}`;
    },
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "Too many requests. Please wait before trying again.",
    },
  });
