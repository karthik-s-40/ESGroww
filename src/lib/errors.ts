export class AppError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTH_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Not authorized') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export const ERROR_MESSAGES = {
  HOSPITAL_NOT_FOUND: 'Hospital not found.',
  USER_NOT_FOUND: 'User not found.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  INTERNAL_SERVER_ERROR: 'An unexpected internal server error occurred.',
  ASSESSMENT_CYCLE_NOT_FOUND: 'Active assessment cycle not found.',
  INVALID_DATA: 'The provided data is invalid.',
};

export function handleActionError(error: unknown): { error: string; code?: string } {
  console.error('[Action Error]', error);
  if (error instanceof AppError) {
    return { error: error.message, code: error.code };
  }
  return { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR, code: 'INTERNAL_ERROR' };
}
