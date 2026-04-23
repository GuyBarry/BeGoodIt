import { Request, Response, NextFunction } from "express";
import { NotFoundException } from "../exceptions/httpExceptions";

export const noRouteHandler = (
  _req: Request,
  _res: Response,
  _next: NextFunction,
): void => {
  throw new NotFoundException(
    "Route not found",
    "The requested endpoint does not exist",
  );
};
