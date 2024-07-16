
export class CustomError extends Error {
    statusCode: number;
  
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  }

  export class MissingParameterError extends CustomError {
    constructor(message = 'Missing required data') {
      super(message, 422);
    }
  }
  
  export class NotFoundError extends CustomError {
    constructor(message = 'Resource not found') {
      super(message, 404);
    }
  }
  
  export class ValidationError extends CustomError {
    constructor(message = 'Validation error') {
      super(message, 400);
    }
  }
  
  export class TokenError extends CustomError {
    constructor(message = 'Not enough token!'){
        super(message, 403)
    }
  }

  export class UnauthorizedError extends CustomError {
    constructor(message = 'Unauthorized access') {
      super(message, 401);
    }
  }

  export class UnsupportedMediaType extends CustomError{
    constructor(message = 'Unsopported media type'){
      super(message, 415)
    }
  }

  export class InternalServerError extends CustomError{
    constructor(message = 'Internal server error'){
      super(message, 500)
    }
  }

  export class FieldsNotUpdatable extends CustomError{
    constructor(message = 'This fields cannot be updated'){
      super(message, 403)
    }
  }
  