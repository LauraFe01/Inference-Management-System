import { NotFoundError, ValidationError, TokenError, UnauthorizedError, UnsupportedMediaType, MissingParameterError, InternalServerError, FieldsNotUpdatable } from './customErrors';

export enum ErrorType {
    NotFoundError = 'NotFoundError',
    ValidationError = 'ValidationError',
    TokenError = 'TokenError',
    UnauthorizedError = 'UnauthorizedError',
    UnsupportedMediaType = 'UnsupportedMediaType',
    MissingParameterError = 'MissingParameterError',
    InternalServerError = 'InternalServerError',
    FieldsNotUpdatable = 'FieldsNotUpdatable'
  }
  
  class ErrorFactory {
    static createError(type: ErrorType, message?: string): Error {
      switch (type) {
        case ErrorType.NotFoundError:
          return new NotFoundError(message);
        case ErrorType.ValidationError:
          return new ValidationError(message);
        case ErrorType.TokenError:
          return new TokenError(message);
        case ErrorType.UnauthorizedError:
          return new UnauthorizedError(message);
        case ErrorType.MissingParameterError:
          return new MissingParameterError(message);
        case ErrorType.UnsupportedMediaType:
          return new UnsupportedMediaType(message);
        case ErrorType.InternalServerError:
            return new InternalServerError(message);
        case ErrorType.FieldsNotUpdatable:
            return new FieldsNotUpdatable(message)
        default:
          throw new Error(`Unknown error type: ${type}`);
      }
    }
  }
  
  export default ErrorFactory;
