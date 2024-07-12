import { Request, Response } from 'express';
import path from 'path';
import { getDecodedToken } from '../Token/token';
import {updateToken} from '../utils';
import {  User} from '../Model/init_database';
import UserDAOApplication from '../DAO/userDao';
import { SpectrogramCreationAttributes } from '../Model/spectrogram';
import DatasetDAOApplication from '../DAO/datasetDao';
import SpectrogramDAOApplication from '../DAO/spectrogramDao';
import AdmZip from 'adm-zip';
import fs from 'fs/promises';

const userApp = new UserDAOApplication();
const datasetApp = new DatasetDAOApplication();
const spectrogramDao= new SpectrogramDAOApplication();

export const spectrogramController = {
    addSpectrogram: async (req: Request, res: Response) => {
      
        const { filepath, datasetName } = req.body; 
        const fileName = path.basename(filepath);
    
        console.log(JSON.stringify(req.body))
        if (!filepath || !datasetName) {
            return res.status(400).json({ error: 'Missing required fields (filepath, datasetName) ' });
        }
        try {
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
    },
    uploadFile: async (req: Request, res: Response) => {
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
    }

  };
  