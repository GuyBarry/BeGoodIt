import { StatusCodes } from 'http-status-codes';
import { CustomException } from './customException';

export class BadRequestException extends CustomException {
  constructor(message: string, details?: unknown) {
    super(message, StatusCodes.BAD_REQUEST, details);
  }
}

export class UnauthorizedException extends CustomException {
  constructor(message: string, details?: unknown) {
    super(message, StatusCodes.UNAUTHORIZED, details);
  }
}

export class ForbiddenException extends CustomException {
  constructor(message: string, details?: unknown) {
    super(message, StatusCodes.FORBIDDEN, details);
  }
}

export class NotFoundException extends CustomException {
  constructor(message: string, details?: unknown) {
    super(message, StatusCodes.NOT_FOUND, details);
  }
}

export class UnsupportedMediaTypeException extends CustomException {
  constructor(message: string, details?: unknown) {
    super(message, StatusCodes.UNSUPPORTED_MEDIA_TYPE, details);
  }
}

export class PayloadTooLargeException extends CustomException {
  constructor(message: string, details?: unknown) {
    super(message, StatusCodes.REQUEST_TOO_LONG, details);
  }
}

export class InternalServerException extends CustomException {
  constructor(message: string = 'Oops, something went wrong!', details?: unknown) {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR, details);
  }
}

// 451 = "Unavailable For Legal Reasons" — repurposed here for bot-protected pages
export class BotProtectedException extends CustomException {
  constructor() {
    super('This site blocks automated access.', 451);
  }
}
