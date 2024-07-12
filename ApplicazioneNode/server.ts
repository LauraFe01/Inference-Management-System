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
import {checkDatasetOwnership, authMiddleware} from './Token/middleware';
import { getDecodedToken } from './Token/token';
import { SpectrogramCreationAttributes } from './Model/spectrogram';
import SpectrogramDAOApplication from './DAO/spectrogramDao';
import fs from 'fs/promises';
import AdmZip from 'adm-zip';
import path from 'path';
import {updateToken} from './utils';


const app = express();
const port = 3000;

// Middleware per parsare il corpo delle richieste come JSON
app.use(bodyParser.json());

// Instanzia il DAO Application
const datasetApp = new DatasetDAOApplication();
const userApp = new UserDAOApplication();
const spectrogramDao= new SpectrogramDAOApplication();

// Rotta per creare un dataset vuoto
app.post('/emptydataset', authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;

    // Controlla che tutti i campi necessari siano presenti
    if (!name || !description) {
      return res.status(400).send({ error: 'Missing required fields' });
    }

    const userData = getDecodedToken(req)
    if (!userData) {
      return res.status(404).json({ error: 'Utente non trovato' });
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
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

app.put('/dataset/:name/cancel', authMiddleware, async (req, res) => {
  const datasetName = req.params.name;
  const userData = getDecodedToken(req)
  
  if (userData && typeof userData !== 'string') {
      const userId = userData.id;

  try {
    const dataset = await datasetApp.getByName(datasetName, userId);

    if (!dataset) {
      return res.status(404).json({ error: 'Dataset non trovato' });
    }

    await datasetApp.updateDataset(dataset, {isCancelled:true} );

    res.json({ message: 'Dataset cancellato logicamente' });
  } catch (error) {
    console.error('Errore durante la cancellazione del dataset:', error);
    res.status(500).json({ error: 'Errore durante la cancellazione del dataset' });
  }
}
});

app.get('/remainingTokens', authMiddleware, async(req: Request, res: Response) => {
    const userData = getDecodedToken(req)
    if (!userData) {
      return res.status(404).json({ error: 'Utente non trovato' });
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

app.post('/login', async(req, res)=>{
  try{
    const{email, password}= req.body;
    // Controllare la presenza di campi
    
    if(!email||!password){
      return res.status(400).send({error:'Missing required fields'});
    } else{
      const user= await userApp.getUserByEmailPass(email);
      if(password!= user[0].password){
        return res.status(401).send({error:'Wrong Password inserted'});
      }else{
        const token = jwt.sign({id: user[0].id, isAdmin: user[0].isAdmin}, config.jwtSecret, { expiresIn: config.jwtExpiration });
        console.log(`${user[0].id}`)
        res.set('Authorization', `Bearer ${token}`);
        res.json({token});
        //res.status(200).send({ message: 'Login successful', user: user[0] });
      }
    }
  } catch(error){ 
      console.error('Error during login:', error);
      res.status(500).send({ error: 'Internal Server Error' });
  }
});

app.patch('/dataset/:name/update', authMiddleware, async (req, res)=>{
  const datasetName = req.params.name;
  const updateFields = req.body; // I campi da aggiornare sono nel corpo della richiesta
  const userData = getDecodedToken(req)
  if (!userData) {
    return res.status(404).json({ error: 'Utente non trovato' });
  }else{
    if (typeof userData !== 'string') {
      const id = userData.id;
  try {

    const dataset = await datasetApp.getByName(datasetName, id);
    const datasetList = await datasetApp.getAllDatasetsByUser(id)
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset non trovato' });
    }

    await datasetApp.updateDataset(dataset, updateFields)

    res.json(dataset);
  } catch (error) {
    console.error('Errore durante l\'aggiornamento del dataset:', error);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento del dataset' });
  }
}
}
});

app.post('/startInference/:datasetId', authMiddleware, async (req: Request, res: Response) => {
  const { modelId } = req.body;
  const allowedValues = ["10_patients_model", "20_patients_model"]
  if (!allowedValues.includes(modelId)) {
    return res.status(400).send('Valore di modelId errato');
  }
  const datasetId = req.params.datasetId;

  const spectrograms = await spectrogramDao.getAllSpectrogramsByDataset(datasetId)

  const userData = getDecodedToken(req);
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

  if (typeof userData !== 'string') {
  const userId = userData.id; 
  const userObj = await userApp.getUser(userId)
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
      res.status(500).json({ error: 'Errore durante la richiesta a Flask' });
    }
    await userApp.updateUser(userObj, updateValues)
  }else{
    return res.status(401).send('Not authorized')
  }


}
});

// Rotta per l'inserimento di uno spettrogramma
app.post('/newspectrogram', authMiddleware, async (req, res) => {
  try {
    // Ci assicuriamo che i dati necessari siano presenti
    const { filepath, datasetName } = req.body; 
    const fileName = path.basename(filepath);

    console.log(JSON.stringify(req.body))
    if (!filepath || !datasetName) {
      return res.status(400).json({ error: 'Valori mancanti ' });
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

// Rotta per prendere i file da una cartella zippata
app.post('/uploadfilesfromzip', authMiddleware, async(req,res)=>{
  try {
    const { folderpath, datasetName } = req.body; 

    console.log(JSON.stringify(req.body))
    if (!folderpath || !datasetName) {
      return res.status(400).json({ error: 'Valori mancanti ' });
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
          console.log("here");
          let filename = zipEntry.entryName;
          const basename = path.basename(filename);
          if(zipEntry.entryName.endsWith('.png')&& !zipEntry.entryName.startsWith('__MACOSX/')){
            const bufferData = zipEntry.getData();
            console.log("ciao2");
            const newSpectrogram: SpectrogramCreationAttributes = {
              name: basename,
              data: bufferData,
              datasetId: datasetID,
            };
            await spectrogramDao.addSpectrogram(newSpectrogram);
            console.log("hey")
         }
        }

        return res.status(201).json({ esito: 'Spettrogrammi caricati' }); 
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


app.get('/refillToken/:userID', authMiddleware, async(req, res)=>{
  const userData = getDecodedToken(req)
  if (userData && typeof userData !== 'string') {
      const userId = userData.id;
  try{
    const dataset = await datasetApp.getAllDatasetsByUser(userId);
    if (!dataset) {
      return res.status(404).json({ error: 'User does not have any dataset' });
    }else{
      res.json(dataset);
    }
  } catch(error){
    console.error('Errore durante il recupero dei dataset:', error);
    res.status(500).json({ error: 'Errore durante il recupero dei dataset' });
  }
}
});

app.post('/allDataset', authMiddleware, async(req, res)=>{


});


// Sincronizza il database e avvia il server
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

