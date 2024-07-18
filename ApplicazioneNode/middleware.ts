import DatasetDAOApplication from './DAO/datasetDao';
import jwt from 'jsonwebtoken';
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { getDecodedToken } from './Utils/token_utils';
import JWT_config from './Config/JWT_config';
import ErrorFactory, { ErrorType } from './Errors/errorFactory';
import { MulterError } from 'multer';

// const middlewareProva = require('./middlewareProva')
// const auth = require('./auth')
var app = express();

/* var myLogger = function (req, res, next) {
  console.log('LOGGED');
  next();
}; */
const datasetApp = new DatasetDAOApplication()

/* var requestTime = function (req, res, next) {
    req.requestTime = Date.now();
    next();
  };*/

function authMiddleware(req: Request, res: Response, next: NextFunction){
  
  const authHeader = req.headers.authorization;
  console.log(JSON.stringify(req.headers, null, 2));
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ErrorFactory.createError(ErrorType.UnauthorizedError, 'Authorization token not provided');
  }
  
  const token = authHeader.split(' ')[1];

  try {
    const  decodedToken= jwt.verify(token, JWT_config.jwtSecret);
    console.log('token', JSON.stringify(decodedToken, null, 2))
    res.locals.decodedToken = decodedToken;
  
    next();
  } catch (error) {
    console.error('Errore durante la verifica del token:', error);
    throw ErrorFactory.createError(ErrorType.UnauthorizedError, 'Authorization token not correct');
  }
}

function isAdminMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log("res", res.locals.decodedToken);

  const { decodedToken } = res.locals;

  if (decodedToken.isAdmin==false) {
    throw ErrorFactory.createError(ErrorType.UnauthorizedError, 'Access denied');
  }

  next();
}

function checkValidJson(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof SyntaxError && 'body' in err) {
      throw ErrorFactory.createError(ErrorType.ValidationError, 'Invalid JSON format in body');
    }
    next();
};

function singleFileCheck(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      throw ErrorFactory.createError(ErrorType.MultiFilesError);
    }
  }
  next();
}


export { authMiddleware, isAdminMiddleware, checkValidJson, singleFileCheck};
