/**
 * Custom error class that extends JavaScript's built-in Error class.
 * @class CustomError
 * @extends Error
 */
export class CustomError extends Error {
  statusCode: number; // HTTP status code associated with the error

  constructor(message: string, statusCode: number) {
    super(message); // Call the Error constructor with the provided message
    this.statusCode = statusCode; // Assign the status code to the instance
    this.name = this.constructor.name; // Set the name of the error class
    Error.captureStackTrace(this, this.constructor); // Capture the stack trace
  }
}

/**
 * Error class for indicating missing parameters.
 * @class MissingParameterError
 * @extends CustomError
 */
export class MissingParameterError extends CustomError {

  constructor(message = 'Missing required data') {
    super(message, 422); // Call parent constructor with status code 422 (Unprocessable Entity)
  }
}

/**
 * Error class for indicating resource not found.
 * @class NotFoundError
 * @extends CustomError
 */
export class NotFoundError extends CustomError {

  constructor(message = 'Resource not found') {
    super(message, 404); // Call parent constructor with status code 404 (Not Found)
  }
}

/**
 * Error class for indicating validation errors.
 * @class ValidationError
 * @extends CustomError
 */
export class ValidationError extends CustomError {

  constructor(message = 'Validation error') {
    super(message, 400); // Call parent constructor with status code 400 (Bad Request)
  }
}

/**
 * Error class for indicating insufficient tokens.
 * @class TokenError
 * @extends CustomError
 */
export class TokenError extends CustomError {

  constructor(message = 'Not enough token!') {
    super(message, 403); // Call parent constructor with status code 403 (Forbidden)
  }
}

/**
 * Error class for indicating unauthorized access.
 * @class UnauthorizedError
 * @extends CustomError
 */
export class UnauthorizedError extends CustomError {

  constructor(message = 'Unauthorized access') {
    super(message, 401); // Call parent constructor with status code 401 (Unauthorized)
  }
}

/**
 * Error class for indicating unsupported media type.
 * @class UnsupportedMediaType
 * @extends CustomError
 */
export class UnsupportedMediaType extends CustomError {

  constructor(message = 'Unsupported media type') {
    super(message, 415); // Call parent constructor with status code 415 (Unsupported Media Type)
  }
}

/**
 * Error class for indicating internal server errors.
 * @class InternalServerError
 * @extends CustomError
 */
export class InternalServerError extends CustomError {

  constructor(message = 'Internal server error') {
    super(message, 500); // Call parent constructor with status code 500 (Internal Server Error)
  }
}

/**
 * Error class for indicating fields that cannot be updated.
 * @class FieldsNotUpdatable
 * @extends CustomError
 */
export class FieldsNotUpdatable extends CustomError {

  constructor(message = 'This fields cannot be updated') {
    super(message, 403); // Call parent constructor with status code 403 (Forbidden)
  }
}

/**
 * Error class for indicating multiple file upload errors.
 * @class MultiFilesError
 * @extends CustomError
 */
export class MultiFilesError extends CustomError {
  
  constructor(message = 'Only one file at a time can be uploaded!') {
    super(message, 403); // Call parent constructor with status code 403 (Forbidden)
  }
}
