import express from 'express';
import bodyParser from 'body-parser';
import DatasetDAOApplication from './DAO/datasetDao'; // Assicurati di avere il percorso corretto
import { DatasetCreationAttributes } from './Model/dataset';
import { initModels, User, Dataset, Spectrogram } from './Model/init_database';

const app = express();
const port = 3000;

// Middleware per parsare il corpo delle richieste come JSON
app.use(bodyParser.json());

// Instanzia il DAO Application
const datasetApp = new DatasetDAOApplication();

// Rotta per creare un dataset vuoto
app.post('/datasets', async (req, res) => {
  try {
    const { id, name, description, userId } = req.body;

    // Controlla che tutti i campi necessari siano presenti
    if (!id || !name || !description || !userId) {
      return res.status(400).send({ error: 'Missing required fields' });
    }

    const newDataset: DatasetCreationAttributes = {
      id,
      name,
      description,
      userId,
    };

    await datasetApp.addDataset(newDataset);
    res.status(201).send(newDataset);
  } catch (error) {
    console.error('Error creating dataset:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
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
