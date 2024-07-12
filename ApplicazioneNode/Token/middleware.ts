import DatasetDAOApplication from '../DAO/datasetDao';
import jwt from 'jsonwebtoken';
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { getDecodedToken } from './token';

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
    return res.status(401).json({ error: 'Token di autenticazione non fornito' });
  }
  
  const token = authHeader.split(' ')[1];

  try {
    const  decodedToken= jwt.verify(token, 'mysupersecretkey');
    console.log('token', JSON.stringify(decodedToken, null, 2))
  
    next();
  } catch (error) {
    console.error('Errore durante la verifica del token:', error);
    return res.status(403).json({ error: 'Token non valido' });
  }
}


async function checkDatasetOwnership (req: Request, res: Response, next: NextFunction){
  let datasetId = parseInt(req.params.id);
  console.log(`${datasetId}`);
  const userData = getDecodedToken(req)
  try {
    const dataset = await datasetApp.getDataset(datasetId);

    if (!dataset || !userData) {
      return res.status(404).json({ error: 'Dataset non trovato' });
    }else{
      if (typeof userData !== 'string') {
        const id = userData.id;  
      
      let userId = dataset.userId
      console.log(`${userData.id}`)
      console.log(`${dataset.userId}`);

      if (userId !== id) {
        return res.status(403).json({ error: 'Non sei autorizzato a cancellare questo dataset' });
      }
    }
    }
    
    next();
  } catch (error) {
    console.error('Errore durante il controllo della proprietà del dataset:', error);
    res.status(500).json({ error: 'Errore durante il controllo della proprietà del dataset' });
  }
};

function isAdminMiddleware(req: Request, res: Response, next: NextFunction) {

  const { decodedToken } = res.locals;

  if (!decodedToken.isAdmin) {
    return res.status(403).json({ error: 'Accesso negato. Non sei un amministratore.' });
  }

  next();
}

export { checkDatasetOwnership, authMiddleware};
