import type { ApiErrorCodes } from './codes';
import { apiErrorCodes } from './codes';

const errorSymbol = Symbol('ApiError');

export class ApiError extends Error {
  errorStatusCode: number;
  errorCode: ApiErrorCodes | undefined;
  [errorSymbol] = true;

  constructor(
    message: string,
    errorCode: undefined | ApiErrorCodes,
    code: number,
  ) {
    super(message);
    this.errorStatusCode = code;
    this.message = message;
    this.errorCode = errorCode;
  }

  static forCode(errorCode: ApiErrorCodes, statusCode?: number) {
    return new ApiError(errorCode, errorCode, statusCode ?? 400);
  }

  static forMessage(message: string, statusCode?: number) {
    return new ApiError(message, undefined, statusCode ?? 400);
  }
}

export function isApiError(err: any): err is ApiError {
  if (err[errorSymbol]) return true;
  return false;
}

export class NotFoundError extends ApiError {
  constructor() {
    super(apiErrorCodes.notFound, 'notFound', 404);
  }
}
