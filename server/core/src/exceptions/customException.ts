import { StatusCodes } from 'http-status-codes';

export class CustomException extends Error {
  readonly statusCode: StatusCodes;
  readonly details?: unknown;

  constructor(message: string, statusCode: StatusCodes, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}
