import DatasetDAOApplication from '../DAO/datasetDao';
import jwt from 'jsonwebtoken';
import express from 'express';
import { Request, Response, NextFunction } from 'express';

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
  console.log(`${authHeader}`)
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token di autenticazione non fornito' });
  }
  
  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = jwt.verify(token, 'secret');
    console.log(`${decodedToken}`)
    next();
  } catch (error) {
    console.error('Errore durante la verifica del token:', error);
    return res.status(403).json({ error: 'Token non valido' });
  }
}


async function checkDatasetOwnership (req: Request, res: Response, next: NextFunction){
  const datasetId = req.params.id;
  console.log(`${datasetId}`);
  const userId = req.params.userId; 
  console.log(`${userId}`);

  try {
    const dataset = await datasetApp.getDataset(datasetId);
    console.log(`[${dataset}`);

    if (!dataset) {
      return res.status(404).json({ error: 'Dataset non trovato' });
    }

    // Verifica se l'utente è il proprietario del dataset
    if (dataset.userId !== userId) {
      return res.status(403).json({ error: 'Non sei autorizzato a cancellare questo dataset' });
    }

    // Se l'utente è il proprietario, passa al prossimo middleware o alla route
    next();
  } catch (error) {
    console.error('Errore durante il controllo della proprietà del dataset:', error);
    res.status(500).json({ error: 'Errore durante il controllo della proprietà del dataset' });
  }
};

export { checkDatasetOwnership, authMiddleware};
