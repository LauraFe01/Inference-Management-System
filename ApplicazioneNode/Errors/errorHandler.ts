import { Request, Response, NextFunction } from 'express';
import { CustomError } from './customErrors';
import { MulterError } from 'multer';
import ErrorFactory, { ErrorType } from './errorFactory';

/**
 * Express middleware to handle errors.
 * @param {Error} err - The error object passed to the middleware.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function in the chain.
 * @returns {void}
 */
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(403).json({
        status: 'error',
        statusCode: 403,
        message: 'Only one file at time allowed!',
      });
    }
  }
  else if (err instanceof CustomError) {
    // If the error is a CustomError, send a JSON response with error details.
    res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
    });
  } else {
    // If the error is not a CustomError, treat it as an Internal Server Error.
    res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: 'Internal Server Error',
    });
  }
}

export default errorHandler;
