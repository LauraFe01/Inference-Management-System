import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import DatasetDAOApplication from './DAO/datasetDao'; // Assicurati di avere il percorso corretto
import { DatasetCreationAttributes } from './Model/dataset';
import { UserCreationAttributes } from './Model/user';
import { initModels, User, Dataset, Spectrogram } from './Model/init_database';
import UserDAOApplication from './DAO/userDao';
import config from './Token/configJWT';
import jwt from 'jsonwebtoken';
import {checkDatasetOwnership, authMiddleware, isAdminMiddleware} from './Token/middleware';
import { getDecodedToken } from './Token/token';
import { SpectrogramCreationAttributes } from './Model/spectrogram';
import SpectrogramDAOApplication from './DAO/spectrogramDao';
import fs from 'fs/promises';
import AdmZip from 'adm-zip';
import path from 'path';
import {updateToken} from './utils';


const app = express();
const port = 3000;


app.use(bodyParser.json());

const datasetApp = new DatasetDAOApplication();
const userApp = new UserDAOApplication();
const spectrogramDao= new SpectrogramDAOApplication();

/**
 * @route POST /emptydataset
 * @middleware authMiddleware - Verifica l'autenticazione dell'utente.
 * @desc Crea un nuovo dataset vuoto.
 * @param {string} req.body.name - Il nome del dataset.
 * @param {string} req.body.description - La descrizione del dataset.
 * @returns {Object} 201 - Il dataset creato.
 * @returns {Object} 400 - Se mancano i campi richiesti.
 * @returns {Object} 404 - Se l'utente non è trovato.
 * @returns {Object} 500 - Se c'è un errore durante la creazione del dataset.
 */
app.post('/emptydataset', authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).send({ error: 'Missing required fields in body (name, description)' });
    }

    const userData = getDecodedToken(req)
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }else{
      if (typeof userData !== 'string') {
        const userId = userData.id;

      const newDataset: DatasetCreationAttributes = {
        name,
        description,
        userId,
      };

      await datasetApp.addDataset(newDataset);
      res.status(201).send(newDataset);
    }
    }
  } catch (error) {
    console.error('Error creating dataset:', error);
    res.status(500).send({ error: 'Internal Server Error during dataset creation' });
  }
});

/**
 * @route PUT /dataset/:name/cancel
 * @middleware authMiddleware - Verifica l'autenticazione dell'utente.
 * @desc Cancella un dataset esistente.
 * @param {string} req.params.name - Il nome del dataset da cancellare.
 * @returns {Object} 204 - Se il dataset è stato cancellato.
 * @returns {Object} 400 - Se mancano i campi richiesti.
 * @returns {Object} 404 - Se il dataset non è trovato.
 * @returns {Object} 500 - Se c'è un errore durante la cancellazione del dataset.
 */
app.put('/dataset/:name/cancel', authMiddleware, async (req, res) => {
  const datasetName = req.params.name;
  const userData = getDecodedToken(req)

  if (!datasetName) {
    return res.status(400).send({ error: 'Missing required fields in body (datasetName)' });
  }
  
  if (userData && typeof userData !== 'string') {
      const userId = userData.id;

  try {
    const dataset = await datasetApp.getByName(datasetName, userId);

    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    await datasetApp.updateDataset(dataset, {isCancelled:true} );

    res.status(204).json({ message: 'Dataset deleted' });
  } catch (error) {
    console.error('Errore durante la cancellazione del dataset:', error);
    res.status(500).json({ error: 'Internal Server Error during dataset deletion' });
  }
}
});

/**
 * @route GET /remainingTokens
 * @middleware authMiddleware - Verifica l'autenticazione dell'utente.
 * @desc Ottiene il numero di token rimanenti per l'utente autenticato.
 * @returns {Object} 200 - Il numero di token rimanenti.
 * @returns {Object} 404 - Se l'utente non è trovato.
 * @returns {Object} 500 - Se c'è un errore durante la query.
 */
app.get('/remainingTokens', authMiddleware, async(req: Request, res: Response) => {
    const userData = getDecodedToken(req)
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }else{
      if (typeof userData !== 'string') {
        const id = userData.id;
    try {
        const numToken = await userApp.getTokensNumById(id)
        res.json({numToken});
      }catch(error){ 
      console.error('Error during query:', error);
      res.status(500).send({ error: 'Internal Server Error' });
      }
    }
  }
});

/**
 * @route POST /login
 * @desc Esegue il login di un utente e ritorna un token JWT.
 * @param {string} req.body.email - L'email dell'utente.
 * @param {string} req.body.password - La password dell'utente.
 * @returns {Object} 201 - Il token JWT.
 * @returns {Object} 400 - Se mancano i campi richiesti.
 * @returns {Object} 401 - Se la password è errata.
 * @returns {Object} 500 - Se c'è un errore durante il login.
 */
app.post('/login', async(req, res)=>{
  try{
    const{email, password}= req.body;
    
    if(!email||!password){
      return res.status(400).send({error:'Missing required fields (email, password)'});
    } else{
      const user= await userApp.getUserByEmailPass(email);
      if(password!= user[0].password){
        res.status(401).send({error:'Wrong Password inserted'});
      }else{
        const token = jwt.sign({id: user[0].id, isAdmin: user[0].isAdmin}, config.jwtSecret, { expiresIn: config.jwtExpiration });
        console.log(`${user[0].id}`)
        res.set('Authorization', `Bearer ${token}`);
        //res.json({token});
        res.status(201).send(token);
      }
    }
  } catch(error){ 
      console.error('Error during login:', error);
      res.status(500).send({ error: 'Internal Server Error' });
  }
});

/**
 * @route PATCH /dataset/:name/update
 * @middleware authMiddleware - Verifica l'autenticazione dell'utente.
 * @desc Aggiorna un dataset esistente.
 * @param {string} req.params.name - Il nome del dataset da aggiornare.
 * @param {Object} req.body - I campi da aggiornare nel dataset.
 * @returns {Object} 200 - Il dataset aggiornato.
 * @returns {Object} 400 - Se mancano i campi da aggiornare.
 * @returns {Object} 404 - Se l'utente o il dataset non sono trovati.
 * @returns {Object} 500 - Se c'è un errore durante l'aggiornamento del dataset.
 */
app.patch('/dataset/:name/update', authMiddleware, async (req, res)=>{
  const datasetName = req.params.name;
  const updateFields = req.body; 

  if(!updateFields){
    return res.status(400).send({error:'Missing fields to be updated '});
  }

  const userData = getDecodedToken(req)
  if (!userData) {
    return res.status(404).json({ error: 'User not found' });
  }else{
    if (typeof userData !== 'string') {
      const id = userData.id;
  try {

    const dataset = await datasetApp.getByName(datasetName, id);
    const datasetList = await datasetApp.getAllDatasetsByUser(id)
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    await datasetApp.updateDataset(dataset, updateFields)

    res.json(dataset);
  } catch (error) {
    console.error('Errore durante l\'aggiornamento del dataset:', error);
    res.status(500).json({ error: 'Internal server error during dataset update' });
  }
}
}
});

/**
 * @route POST /startInference/:datasetName
 * @middleware authMiddleware - Verifica l'autenticazione dell'utente.
 * @desc Avvia l'inferenza su un dataset specifico.
 * @param {string} req.params.datasetName - Il nome del dataset.
 * @param {string} req.body.modelId - L'ID del modello di inferenza.
 * @returns {Object} 200 - I risultati dell'inferenza.
 * @returns {Object} 400 - Se il modelId non è consentito.
 * @returns {Object} 404 - Se l'utente o il dataset non sono trovati.
 * @returns {Object} 500 - Se c'è un errore durante la richiesta di inferenza.
 */
app.post('/startInference/:datasetName', authMiddleware, async (req: Request, res: Response) => {
  const { modelId } = req.body;
  const allowedValues = ["10_patients_model", "20_patients_model"]
  if (!allowedValues.includes(modelId)) {
    return res.status(400).send('modelId value entered not allowed');
  }
  const datasetName = req.params.datasetName;

  const userData = getDecodedToken(req);
  if (!userData) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (typeof userData !== 'string') {
  const userId = userData.id; 
  const userObj = await userApp.getUser(userId)

  const dataset = await datasetApp.getByName(datasetName, userId)

  if (!dataset) {
      return res.status(404).json({ error: 'User not found' });
  }
  const spectrograms = await spectrogramDao.getAllSpectrogramsByDataset(dataset.id)

  const numSpectrograms = spectrograms.length;

  const tokenRemaining = updateToken("inference", userObj!, numSpectrograms)

  if (tokenRemaining >= 0 && userObj){
    const updateValues: Partial<User> = { numToken: tokenRemaining };
    console.log(spectrograms)

    const data = {
      modelId: modelId,
      spectrograms: spectrograms
    };

    try {
      const response = await axios.post('http://127.0.0.1:8080/inference', data);

      console.log('Risposta dal server Flask:', response.data);

      const dataresponse = response.data

      res.json({ dataresponse });
    } catch (error) {
      console.error('Errore durante la richiesta a Flask:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
    await userApp.updateUser(userObj, updateValues)
  }else{
    return res.status(401).send('Not authorized')
  }


}
});

/**
 * @route POST /newspectrogram
 * @middleware authMiddleware - Verifica l'autenticazione dell'utente.
 * @desc Aggiunge un nuovo spettrogramma a un dataset esistente.
 * @param {string} req.body.filepath - Il percorso del file dello spettrogramma.
 * @param {string} req.body.datasetName - Il nome del dataset.
 * @returns {Object} 201 - Lo spettrogramma creato.
 * @returns {Object} 400 - Se mancano i campi richiesti.
 * @returns {Object} 403 - Se l'utente non possiede il dataset.
 * @returns {Object} 404 - Se l'utente non è trovato.
 * @returns {Object} 500 - Se c'è un errore durante la lettura del file o l'aggiunta dello spettrogramma.
 */
app.post('/newspectrogram', authMiddleware, async (req, res) => {
  try {
    // Ci assicuriamo che i dati necessari siano presenti
    const { filepath, datasetName } = req.body; 
    const fileName = path.basename(filepath);

    console.log(JSON.stringify(req.body))
    if (!filepath || !datasetName) {
      return res.status(400).json({ error: 'Missing required fields (filepath, datasetName) ' });
    }

    const userData = getDecodedToken(req);
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (typeof userData !== 'string') {
      const userId = userData.id; 
      const userObj = await userApp.getUser(userId)
    
      const tokenRemaining = updateToken("uploadImage", userObj!, 1)

      if (tokenRemaining >= 0 && userObj){
        const updateValues: Partial<User> = { numToken: tokenRemaining };
        await userApp.updateUser(userObj, updateValues)
      }else{
        return res.status(401).send('Not authorized')
      }

      const datasetData = await datasetApp.getByName(datasetName, userId);
      if (!datasetData || datasetData.userId !== userId) {
        return res.status(403).json({ error: 'User does not own the dataset' });
      }
      const datasetID = datasetData.id

      // dobbiamo gestire 'data'
      try{
        let bufferData = await fs.readFile(filepath);
        const newSpectrogram: SpectrogramCreationAttributes = {
          name: fileName,
          data: bufferData,
          datasetId: datasetID,
        };
        await spectrogramDao.addSpectrogram(newSpectrogram);
        return res.status(201).json(newSpectrogram); 

        }catch(err){
          console.error('Error reading file:', err);
          return res.status(500).json({ error: 'Error reading file' });
        }

    }
  } catch (error) {
    console.error('Error adding spectrogram:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @route POST /uploadfilesfromzip
 * @middleware authMiddleware - Verifica l'autenticazione dell'utente.
 * @desc Carica spettrogrammi da un file zip in un dataset esistente.
 * @param {string} req.body.folderpath - Il percorso della cartella zip.
 * @param {string} req.body.datasetName - Il nome del dataset.
 * @returns {Object} 201 - Esito dell'operazione.
 * @returns {Object} 400 - Se mancano i campi richiesti.
 * @returns {Object} 403 - Se l'utente non possiede il dataset.
 * @returns {Object} 404 - Se l'utente non è trovato.
 * @returns {Object} 500 - Se c'è un errore durante la lettura del file zip o l'aggiunta degli spettrogrammi.
 */
app.post('/uploadfilesfromzip', authMiddleware, async(req,res)=>{
  try {
    const { folderpath, datasetName } = req.body; 

    console.log(JSON.stringify(req.body))
    if (!folderpath || !datasetName) {
      return res.status(400).json({ error: 'Missing required fields (folderpath, datasetName) ' });
    }

    const userData = getDecodedToken(req);
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (typeof userData !== 'string') {
      const userId = userData.id; 
      const userObj = await userApp.getUser(userId)
      const datasetData = await datasetApp.getByName(datasetName, userId);
      if (!datasetData || datasetData.userId !== userId) {
        return res.status(403).json({ error: 'User does not own the dataset' });
      }
      try {
        console.log(folderpath, datasetName);
        const zip = new AdmZip(folderpath);
        const zipEntries = zip.getEntries();
        const datasetID = datasetData.id;
        const numEntries = zipEntries.length;
        const tokenRemaining = updateToken("uploadZip", userObj!, numEntries)

        if (tokenRemaining >= 0 && userObj){
          const updateValues: Partial<User> = { numToken: tokenRemaining };
          await userApp.updateUser(userObj, updateValues)
        }else{
          return res.status(401).send('Not authorized')
        }

        for (const zipEntry of zipEntries){
          let filename = zipEntry.entryName;
          const basename = path.basename(filename);
          if(zipEntry.entryName.endsWith('.png')&& !zipEntry.entryName.startsWith('__MACOSX/')){
            const bufferData = zipEntry.getData();
            const newSpectrogram: SpectrogramCreationAttributes = {
              name: basename,
              data: bufferData,
              datasetId: datasetID,
            };
            await spectrogramDao.addSpectrogram(newSpectrogram);
         }
        }

        return res.status(201).json({ esito: 'Spectrograms successfully uploaded ' }); 
      } catch (error) {
          console.error('Error reading file:', error);
          return res.status(500).json({ error: 'Error reading file' });
      }
    }
  } catch (error) {
    console.error('Error adding spectrogram:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @route GET /allDatasets
 * @middleware authMiddleware - Verifica l'autenticazione dell'utente.
 * @desc Ottiene tutti i dataset dell'utente autenticato.
 * @returns {Object} 200 - I dataset dell'utente.
 * @returns {Object} 404 - Se l'utente non ha dataset.
 * @returns {Object} 500 - Se c'è un errore durante il recupero dei dataset.
 */
app.get('/allDatasets', authMiddleware, async(req, res)=>{
  const userData = getDecodedToken(req)
  if (userData && typeof userData !== 'string') {
      const userId = userData.id;
  try{
    const dataset = await datasetApp.getAllDatasetsByUser(userId);
    if (!dataset) {
      return res.status(404).json({ error: 'User does not have any dataset yet' });
    }else{
      res.json(dataset);
    }
  } catch(error){
    console.error('Errore durante il recupero dei dataset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
});

/**
 * @route POST /refillTokens
 * @middleware authMiddleware - Verifica l'autenticazione dell'utente.
 * @middleware isAdminMiddleware - Verifica che l'utente sia un amministratore.
 * @desc Aggiorna il numero di token per un utente specifico.
 * @param {string} req.body.userEmail - L'email dell'utente a cui si vogliono ricaricare i token.
 * @param {number} req.body.newTokens - Il numero di nuovi token da aggiungere all'utente.
 * @returns {Object} 201 - Se l'operazione ha successo, ritorna un oggetto con l'esito e l'utente aggiornato.
 * @returns {Object} 500 - Se l'operazione fallisce, ritorna un messaggio di errore.
 */
app.post('/refillTokens', authMiddleware, isAdminMiddleware, async(req, res)=>{
  const {userEmail, newTokens} = req.body

  try {
    const user = await userApp.getUserByEmailPass(userEmail);

    if (user) {
        console.log(user[0].numToken);

        const numToken = user[0].numToken + newTokens;

        await userApp.updateUser(user[0], { numToken });

        return res.status(201).json({ esito: 'Token number updated', user });
    } else {
        return res.status(500).json({ error: 'Internal server error' });
    }
} catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
}
});

(async () => {
  try {
    await initModels();
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
})();

