import { Request, Response } from 'express';
import path from 'path';
import { getDecodedToken } from '../Token/token';
import { updateToken } from '../utils';
import { User } from '../Model/init_database';
import UserDAOApplication from '../DAO/userDao';
import { SpectrogramCreationAttributes } from '../Model/spectrogram';
import DatasetDAOApplication from '../DAO/datasetDao';
import SpectrogramDAOApplication from '../DAO/spectrogramDao';
import AdmZip from 'adm-zip';
import fs from 'fs/promises';

const userApp = new UserDAOApplication();
const datasetApp = new DatasetDAOApplication();
const spectrogramDao = new SpectrogramDAOApplication();

export const spectrogramController = {
  // Endpoint to add a single spectrogram
  addSpectrogram: async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: 'File upload is required' });
    }

    const { datasetName } = req.body;
    const pathName = req.file.originalname
    const fileName = path.basename(pathName);

    if (!pathName || !datasetName) {
      return res.status(400).json({ error: 'Missing required fields (filepath, datasetName)' });
    } else if (!fileName.endsWith('.png')) {
      return res.status(400).json({ error: 'Invalid file format. Expected .png' });
    }

    try {
      // Decode user token to get user data
      const userData = getDecodedToken(req);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Proceed if user data is valid
      if (typeof userData !== 'string') {
        const userId = userData.id;
        const userObj = await userApp.getUser(userId);

        // Update token usage for uploading an image
        const tokenRemaining = updateToken('uploadImage', userObj!, 1);
        if (tokenRemaining < 0 || !userObj) {
          return res.status(401).send('Not authorized');
        }
    
        await userApp.updateUser(userObj, { numToken: tokenRemaining });

        // Fetch dataset information by name
        const datasetData = await datasetApp.getByName(datasetName, userId);
        if (!datasetData || datasetData.userId !== userId) {
          return res.status(403).json({ error: 'User does not own the dataset' });
        }

        const newSpectrogram = {
          name: fileName,
          data: req.file.buffer,
          datasetId: datasetData.id,
        };

        // Save the spectrogram to the database
        await spectrogramDao.addSpectrogram(newSpectrogram);
        return res.status(201).json(newSpectrogram);
      }
    } catch (error) {
      console.error('Error adding spectrogram:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // Endpoint to upload a zip file containing spectrogram images
  uploadFile: async (req: Request, res: Response) => {
    try {
      const { datasetName } = req.body;

      // Check if required fields are missing
      if (!req.file || !datasetName) {
        return res.status(400).json({ error: 'Missing required fields (folderpath, datasetName)' });
      } else if (!req.file.originalname.endsWith('.zip')) {
        return res.status(400).json({ error: 'Invalid file format. Expected .zip' });
      }

      // Decode user token to get user data
      const userData = getDecodedToken(req);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Proceed if user data is valid
      if (typeof userData !== 'string') {
        const userId = userData.id;
        const userObj = await userApp.getUser(userId);
        const datasetData = await datasetApp.getByName(datasetName, userId);

        // Check ownership of the dataset
        if (!datasetData || datasetData.userId !== userId) {
          return res.status(403).json({ error: 'User does not own the dataset' });
        }

        try {
          // Extract and process zip file
          const zip = new AdmZip(req.file.buffer);
          const zipEntries = zip.getEntries();
          const datasetID = datasetData.id;
          const numEntries = zipEntries.length;

          // Update token usage for uploading the zip file
          const tokenRemaining = updateToken('uploadZip', userObj!, numEntries);
          if (tokenRemaining < 0 || !userObj) {
            return res.status(401).send('Not authorized');
          }
      
          await userApp.updateUser(userObj, { numToken: tokenRemaining });

          // Iterate through zip entries and add valid .png files as spectrograms
          for (const zipEntry of zipEntries) {
            let filename = zipEntry.entryName;
            const basename = path.basename(filename);

            // Process only .png files that are not in the __MACOSX directory
            if (zipEntry.entryName.endsWith('.png') && !zipEntry.entryName.startsWith('__MACOSX/')) {
              const bufferData = zipEntry.getData();
              const newSpectrogram: SpectrogramCreationAttributes = {
                name: basename,
                data: bufferData,
                datasetId: datasetID,
              };
              await spectrogramDao.addSpectrogram(newSpectrogram);
            }
          }

          return res.status(201).json({ message: 'Spectrograms successfully uploaded' });
        } catch (error) {
          console.error('Error reading file:', error);
          return res.status(500).json({ error: 'Error reading file' });
        }
      }
    } catch (error) {
      console.error('Error adding spectrogram:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};
