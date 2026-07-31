import {
  rateLimit,
  RateLimitRequestHandler,
  Options as RateLimitOptions,
} from "express-rate-limit";
import { Request } from "express";

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
        req.ip ||
        "unknown";
      return `${req.method}:${req.route?.path ?? req.path}:${userId}`;
    },
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "Too many requests. Please wait before trying again.",
    },
  });
