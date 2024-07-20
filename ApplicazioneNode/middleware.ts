import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import JWT_config from './Config/JWT_config';
import ErrorFactory, { ErrorType } from './Errors/errorFactory';


/**
 * Middleware function to authenticate and verify JWT token from request headers.
 * @param req - Express request object.
 * @param res - Express response object.
 * @param next - Next function to pass control to the next middleware.
 * @throws {Error} - Throws UnauthorizedError if token is missing or invalid.
 */
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ErrorFactory.createError(ErrorType.UnauthorizedError, 'Authorization token not provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = jwt.verify(token, JWT_config.jwtSecret);
    res.locals.decodedToken = decodedToken;
    next();
  } catch (error) {
    throw ErrorFactory.createError(ErrorType.UnauthorizedError, 'Authorization token not correct');
  }
}

/**
 * Middleware function to check if the authenticated user is an admin.
 * Relies on the decoded token set by the authMiddleware.
 * @param req - Express request object.
 * @param res - Express response object.
 * @param next - Next function to pass control to the next middleware.
 * @throws {Error} - Throws UnauthorizedError if user is not an admin.
 */
function isAdminMiddleware(req: Request, res: Response, next: NextFunction) {
  const { decodedToken } = res.locals;

  if (!decodedToken || decodedToken.isAdmin === false) {
    throw ErrorFactory.createError(ErrorType.UnauthorizedError, 'Access denied');
  }

  next();
}

/**
 * Middleware function to check for valid JSON format in request body.
 * @param err - Error object thrown by JSON parser.
 * @param req - Express request object.
 * @param res - Express response object.
 * @param next - Next function to pass control to the next middleware.
 * @throws {Error} - Throws ValidationError if JSON format in request body is invalid.
 */
function checkValidJson(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof SyntaxError && 'body' in err) {
    throw ErrorFactory.createError(ErrorType.ValidationError, 'Invalid JSON format in body');
  }
  next();
}


export { authMiddleware, isAdminMiddleware, checkValidJson };