import { Request, Response } from 'express';
import { getDecodedToken } from '../Token/token';
import { DatasetCreationAttributes } from '../Model/dataset';
import DatasetDAOApplication from '../DAO/datasetDao';
import UserDAOApplication from '../DAO/userDao';
import SpectrogramDAOApplication from '../DAO/spectrogramDao';
import axios from 'axios';
import {updateToken} from '../utils';
import { User} from '../Model/init_database';

const datasetApp = new DatasetDAOApplication();
const userApp = new UserDAOApplication();
const spectrogramDao= new SpectrogramDAOApplication();

export const datasetController = {
  createEmptyDataset: async (req: Request, res: Response) => {
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
  },

  cancelDataset: async (req: Request, res: Response) => {
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

        res.status(200).json({ message: 'Dataset deleted' });
    } catch (error) {
        console.error('Errore durante la cancellazione del dataset:', error);
        res.status(500).json({ error: 'Internal Server Error during dataset deletion' });
    }
    }
  },

  updateDataset: async (req: Request, res: Response) => {
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

        res.status(200).json(dataset);
    } catch (error) {
        console.error('Errore durante l\'aggiornamento del dataset:', error);
        res.status(500).json({ error: 'Internal server error during dataset update' });
    }
    }
    }
  },

  startInference: async (req: Request, res: Response) =>{
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
  },


  getAllDatasets: async (req: Request, res: Response) =>{
    const userData = getDecodedToken(req)
    if (userData && typeof userData !== 'string') {
        const userId = userData.id;
    try{
        const dataset = await datasetApp.getAllDatasetsByUser(userId);
        if (!dataset) {
        return res.status(404).json({ error: 'User does not have any dataset yet' });
        }else{
        res.status(200).json(dataset);
        }
    } catch(error){
        console.error('Errore durante il recupero dei dataset:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    }
  }

};
